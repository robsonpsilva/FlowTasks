import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Domínio padrão das fotos de perfil do Google
        port: '',
        pathname: '/**', // Permite qualquer caminho dentro do domínio
      },
    ],
  },
};

export default nextConfig;