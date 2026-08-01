import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Evita que el navegador "adivine" el tipo de un archivo
          // distinto al declarado (protección contra ciertos XSS).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // La app no tiene ninguna razón legítima para cargarse dentro
          // de un iframe de otro sitio — bloquea clickjacking.
          { key: "X-Frame-Options", value: "DENY" },
          // Manda la URL completa solo a nuestro propio dominio; a
          // otros dominios (links salientes) solo el origen, no la ruta.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
