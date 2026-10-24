import type { Metadata, Viewport } from "next"
import { Geist_Mono, Inter, Lora } from "next/font/google"

import "./globals.css"
import { BottomNav } from "@/components/bottom-nav"
import { ServiceWorkerRegister } from "@/components/service-worker-register"
import { ThemeProvider } from "@/components/theme-provider"
import { fontSizeScript } from "@/lib/font-size-script"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

// Scripture text: a book-like serif that echoes the "Calvary" wordmark.
const fontSerif = Lora({ subsets: ["latin"], variable: "--font-serif" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Calvary Temple Philippines Inc.",
    template: "%s · Calvary Temple Philippines Inc.",
  },
  description: "A church that has passion for God and compassion for man.",
  applicationName: "Calvary Temple",
  appleWebApp: {
    capable: true,
    title: "Calvary Temple",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: "#2a0e72",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        fontSerif.variable,
        "font-sans",
        inter.variable
      )}
    >
      <head>
        {/* Apply the saved font size before first paint (no size flash). */}
        <script dangerouslySetInnerHTML={{ __html: fontSizeScript }} />
      </head>
      <body className="min-h-svh bg-background pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <ThemeProvider>
          {children}
          <BottomNav />
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
