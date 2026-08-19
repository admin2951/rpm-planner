import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 專案位於使用者家目錄下，明確指定 root 避免 Turbopack 往上層尋找
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
