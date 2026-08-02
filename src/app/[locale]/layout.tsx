import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { RegistrarServiceWorker } from "@/components/RegistrarServiceWorker";
import { routing, type Locale } from "@/i18n/routing";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL("https://remindhome.app"),
  title: "RemindHome",
  description: "El refri y las tareas del hogar, organizados en un solo lugar.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RemindHome",
  },
  openGraph: {
    title: "RemindHome",
    description: "El refri y las tareas del hogar, organizados en un solo lugar.",
    siteName: "RemindHome",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RemindHome",
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

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Habilita render estático por locale (next-intl lee el locale de un
  // header seteado en el proxy si no se llama esto explícito).
  setRequestLocale(locale as Locale);

  return (
    <html lang={locale} className="h-dvh antialiased">
      <body className="min-h-dvh flex flex-col">
        <NextIntlClientProvider>
          {children}
          <RegistrarServiceWorker />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
