import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Standalone output untuk Docker — menghasilkan .next/standalone/server.js
  // yang membundle hanya runtime deps yang dipakai, image jadi kecil.
  output: "standalone",
  reactCompiler: true,
  async rewrites() {
    const apiUrl =
      process.env.GETSMART_API_URL ||
      process.env.NEXT_PUBLIC_GETSMART_API_URL ||
      "";
    const backendHost = apiUrl
      ? apiUrl.replace(/\/api\/?$/, "")
      : process.env.NODE_ENV === "production"
        ? "http://getsmart-api-go:5000"
        : "http://localhost:5000";

    return [
      {
        source: "/api/uploads/:path*",
        destination: `${backendHost}/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "rafliafriza.gutechdeveloper.site",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config: any) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /@vladmandic\/face-api/ },
    ];
    return config;
  },
};

export default nextConfig;
