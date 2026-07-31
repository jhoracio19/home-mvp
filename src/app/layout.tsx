import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestión doméstica",
  description: "MVP de gestión del hogar: refri y tareas compartidas.",
};

// viewportFit: 'cover' habilita env(safe-area-inset-*) en iOS, para no
// tapar contenido con el notch o la barra de gestos inferior.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
