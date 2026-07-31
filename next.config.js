/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Next.js walks up looking for a lockfile to infer the workspace root
    // and stops at C:\Users\Nathan\package-lock.json (unrelated file,
    // outside this project) unless pinned explicitly here.
    root: __dirname,
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
    return [
      // Backend routes are themselves registered under /api/v1 (see
      // cmd/api/main.go), not just /v1 - keep the /api segment when
      // forwarding, don't strip it.
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
