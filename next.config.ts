import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  // O canto inferior esquerdo é ocupado pelo botão "Sair" do menu lateral.
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
