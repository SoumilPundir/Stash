/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
        port: "",
        pathname: "/api/portraits/**",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  
  reactCompiler: true,

  // Ensure Prisma files are included in the deployment
  outputFileTracingIncludes: {
    '/api/**': ['./node_modules/.prisma/**/*'],
    '/dashboard/**': ['./node_modules/.prisma/**/*'],
    '/transaction/**': ['./node_modules/.prisma/**/*'],
  },
};

export default nextConfig;
