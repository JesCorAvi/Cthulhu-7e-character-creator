import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"
import { PwaRegister } from "@/components/pwa-register"
import { LanguageProvider } from "@/components/language-provider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const viewport: Viewport = {
  themeColor: "#1a472a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "CthulhuBuilder",
  description: "Crea y gestiona tus fichas de investigador para Call of Cthulhu 7ª Edición",
  generator: "v0.app",
  manifest: "/manifest.json",
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
    apple: "/apple-icon.png",
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
        <LanguageProvider>
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              storageKey="theme" 
              disableTransitionOnChange
            >
            {children}
            <Analytics />
            <PwaRegister />
          </ThemeProvider>
        </LanguageProvider>
        
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
        <Script src="https://apis.google.com/js/api.js" strategy="beforeInteractive" />
      </body>
    </html>
  )
}