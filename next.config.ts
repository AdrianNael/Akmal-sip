import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  api: {
    bodyParser: {
      sizeLimit: "5mb", // Ubah sesuai kebutuhan (bisa 5mb, 10mb, dll)
    },
  },
};

export default nextConfig;
