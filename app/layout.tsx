import type React from "react"
import type { Metadata, Viewport } from "next" // [NUEVO] Importamos Viewport
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"
import { PwaRegister } from "@/components/pwa-register" // [NUEVO] Importamos nuestro componente

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// [NUEVO] Configuración del Viewport (theme-color ahora va aquí en Next.js 14+)
export const viewport: Viewport = {
  themeColor: "#1a472a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Hace que se sienta más como una app nativa
}

export const metadata: Metadata = {
  title: "CthulhuBuilder",
  description: "Crea y gestiona tus fichas de investigador para Call of Cthulhu 7ª Edición",
  generator: "v0.app",
  // [NUEVO] Enlace al manifest
  manifest: "/cthulhu-7e-character-creator/manifest.json",
  // [NUEVO] Configuración específica para Apple (iOS)
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CthulhuBuilder",
  },
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png", // Asegúrate de que este archivo exista en public
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          {children}
          <Analytics />
          {/* [NUEVO] Componente que registra el Service Worker */}
          <PwaRegister />
        </ThemeProvider>
        
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
        <Script src="https://apis.google.com/js/api.js" strategy="beforeInteractive" />
      </body>
    </html>
  )
}