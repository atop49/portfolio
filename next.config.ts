import type { NextConfig } from "next";

const isPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  /* GitHub Pages 只托管静态文件：导出成 out/，资源前缀到 /portfolio。
     本地 dev 和其他平台的构建行为保持不变。 */
  output: isPages ? "export" : undefined,
  basePath: isPages ? "/portfolio" : undefined,
  trailingSlash: isPages ? true : undefined,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;