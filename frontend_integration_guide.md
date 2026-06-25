# Frontend Integration Guide - Handling Uploaded Assets in Next.js

With the backend updates, file upload endpoints dynamically change their returned URL formats depending on the environment:
* **Staging / Dev**: Returns absolute URLs (e.g., `https://api.getsmart.id/uploads/images/xxx.jpg`).
* **Production**: Returns relative paths starting with `/api/uploads` (e.g., `/api/uploads/images/xxx.jpg`) because the backend is hidden inside the internal Docker network.

This guide helps frontend developers configure Next.js to proxy asset requests and render them correctly, including handling inline images in rich-text content (like `text_question` HTML fields).

---

## 1. Next.js Proxy Rewrite Configuration

In your Next.js application, configure rewrites inside `next.config.js` to proxy requests for `/api/uploads/...` directly to the backend's `/uploads/...` port.

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Proxy '/api/uploads/:path*' to backend's static '/uploads/:path*' directory
      {
        source: '/api/uploads/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'http://getsmart-api-go:5000/uploads/:path*' // Production internal docker host
          : 'http://localhost:5000/uploads/:path*',      // Dev local host
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 2. Asset URL Resolution Helper (For Single URL Fields)

For single URL fields returned by the API (e.g., `imageUrl`, `fileUrl`), use this helper function to resolve the correct source for `<img>` or `<a>` tags:

```typescript
/**
 * Resolves a single asset URL returned by the backend.
 * Handles both absolute URLs (dev/staging) and relative paths (production).
 */
export function resolveAssetUrl(url: string | null | undefined): string {
  if (!url) return '';

  // 1. If it's already an absolute URL, use it directly (Dev/Staging)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // 2. For relative paths in production (starts with '/api/uploads/...')
  // Let the browser resolve it relatively from the current host (intercepted by Next.js rewrites)
  return url;
}
```

---

## 3. Handling Rich-Text / HTML Content (e.g., `text_question` Fields)

In some database fields (like diagnostic test questions), the content is rich-text/HTML that contains inline `<img>` tags referencing the internal docker host:
`src="http://getsmart-api-go:5000/uploads/images/1782187042740841315-2ef35597.jpg"`

Since the internal host `getsmart-api-go:5000` is inaccessible from the user's browser, the frontend **must** clean the HTML content by replacing this internal host URL with the relative proxy route before rendering.

Here is the helper function to fix inline URLs in HTML strings:

```typescript
/**
 * Sanitizes rich-text HTML strings from the database by replacing 
 * internal docker hosts with the Next.js proxy route /api/uploads.
 */
export function sanitizeHtmlUrls(html: string | null | undefined): string {
  if (!html) return '';

  // Replace 'http://getsmart-api-go:5000/uploads/' with '/api/uploads/'
  // This allows the browser to fetch the images through the Next.js rewrite proxy.
  return html.replace(/http:\/\/getsmart-api-go:5000\/uploads\//g, '/api/uploads/');
}
```

### Usage Example:
```tsx
import { sanitizeHtmlUrls } from '@/utils/helpers';

interface QuestionRendererProps {
  textQuestion: string; // HTML string containing raw <img> tags
}

export function QuestionRenderer({ textQuestion }: QuestionRendererProps) {
  const cleanHtml = sanitizeHtmlUrls(textQuestion);

  return (
    <div 
      className="prose max-w-none text-gray-800"
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}
```
*(This ensures images in rich-text content load perfectly on production while maintaining standard output on dev/staging).*
