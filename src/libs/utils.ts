// Utility function untuk class names
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// Delay function untuk testing
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Format currency
export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

// Check if menu is active based on current pathname
export function isActiveMenu(menuUrl: string, currentPath: string): boolean {
  // Exact match untuk root/dashboard
  if (menuUrl === "/" && currentPath === "/") {
    return true;
  }

  // Jangan match root untuk path lain
  if (menuUrl === "/" && currentPath !== "/") {
    return false;
  }

  // Check if current path starts with menu URL
  // Contoh: menuUrl="/reports" akan match dengan "/reports/annual-report"
  return currentPath.startsWith(menuUrl);
}

export const smoothScrolltoSection = (elementId: string) => {
  if (elementId.startsWith("#")) {
    elementId = elementId.substring(1);
  }
  const element = document.getElementById(elementId);

  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - 110;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};

/**
 * Resolves a single asset URL returned by the backend.
 * Handles both absolute URLs (dev/staging) and relative paths (production).
 */
export function resolveAssetUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url.replace(
    /http:\/\/(?:getsmart-api-go|localhost|127\.0\.0\.1):5000\/uploads\//g,
    "/api/uploads/",
  );
}

/**
 * Sanitizes rich-text HTML strings from the database by replacing
 * internal docker hosts with the Next.js proxy route /api/uploads.
 */
export function sanitizeHtmlUrls(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(
    /http:\/\/(?:getsmart-api-go|localhost|127\.0\.0\.1):5000\/uploads\//g,
    "/api/uploads/",
  );
}

export function formatBirthDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function latexTextToTiptapHtml(text: string): string {
  if (!text) return "";

  if (
    text.includes('data-type="inline-math"') ||
    text.includes('data-type="block-math"')
  ) {
    return text;
  }

  let parsedText = text.replace(
    /\$\$((?:[^$]|\$[^\n$])+)\$\$/g,
    (_, latex) => {
      const cleanLatex = latex.replace(/"/g, "&quot;");
      return `<div data-type="block-math" data-latex="${cleanLatex}"></div>`;
    },
  );

  parsedText = parsedText.replace(/\$([^$\n]+)\$/g, (_, latex) => {
    const cleanLatex = latex.replace(/"/g, "&quot;");
    return `<span data-type="inline-math" data-latex="${cleanLatex}"></span>`;
  });

  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(text);
  if (!hasHtmlTags) {
    parsedText = parsedText
      .split("\n")
      .map((line) => `<p>${line || "<br>"}</p>`)
      .join("");
  }

  return parsedText;
}

export function tiptapHtmlToLatexHtml(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined") {
    return html.replace(/<[^>]*>/g, "").trim();
  }

  const doc = new DOMParser().parseFromString(html, "text/html");

  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const dataType = element.getAttribute("data-type");
      if (dataType === "inline-math") {
        const latex = element.getAttribute("data-latex") ?? "";
        return latex ? `$${latex}$` : "";
      }
      if (dataType === "block-math") {
        const latex = element.getAttribute("data-latex") ?? "";
        return latex ? `$$${latex}$$` : "";
      }

      const tag = element.tagName.toLowerCase();
      const inner = Array.from(element.childNodes).map(processNode).join("");
      const attributes = Array.from(element.attributes)
        .map((attribute) => `${attribute.name}="${attribute.value}"`)
        .join(" ");
      return `<${tag}${attributes ? " " + attributes : ""}>${inner}</${tag}>`;
    }
    return "";
  }

  return Array.from(doc.body.childNodes)
    .map(processNode)
    .join("")
    .replace(/\n+$/, "");
}
