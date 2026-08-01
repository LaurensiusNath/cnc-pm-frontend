/** @type {import('next').NextConfig} */
const nextConfig = {
  // Needed for the multi-stage Dockerfile: bundles a minimal server plus
  // only the production deps actually traced from the build, instead of
  // shipping the full node_modules tree into the runtime image.
  output: "standalone",
  // msw (test-only, never imported by app code) ships ESM-only internals
  // (e.g. rettime) that Jest can't require() by default, since next/jest
  // ignores all of node_modules for transforms unless a package is listed
  // here - this is how next/jest is told to transform it too.
  transpilePackages: [
    "msw",
    "rettime",
    "until-async",
    "headers-polyfill",
    "@open-draft/deferred-promise",
  ],
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
