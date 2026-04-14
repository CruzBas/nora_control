import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "haciendacostarica-signer",
    "xadesjs",
    "xml-crypto",
    "@xmldom/xmldom"
  ],
};

export default nextConfig;
