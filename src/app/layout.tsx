import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { RegistrarServiceWorker } from "@/components/RegistrarServiceWorker";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cylcard.com"),
  title: "Gestión doméstica",
  description: "El refri y las tareas del hogar, organizados en un solo lugar.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hogar",
  },
  openGraph: {
    title: "Gestión doméstica",
    description: "El refri y las tareas del hogar, organizados en un solo lugar.",
    siteName: "Gestión doméstica",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gestión doméstica",
    description: "El refri y las tareas del hogar, organizados en un solo lugar.",
  },
};

// viewportFit: 'cover' habilita env(safe-area-inset-*) en iOS, para no
// tapar contenido con el notch o la barra de gestos inferior.
// themeColor pinta la barra de estado/navegador con el espresso de la marca.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#4A342A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-dvh antialiased">
      <body className="min-h-dvh flex flex-col">
        {children}
        <RegistrarServiceWorker />
        <Analytics />
      </body>
    </html>
  );
}
