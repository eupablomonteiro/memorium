/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Transpila os pacotes do monorepo para funcionar com Next.js
  transpilePackages: ["@memorium/config", "@memorium/utils"],
};

export default nextConfig;
