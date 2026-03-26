import type { Metadata } from "next"
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "Mapa do Engajamento — Crie conteúdo com direção",
  description: "Gere prompts personalizados, use IA como apoio estratégico e crie conteúdo que conecta e vende. Por @omatheus.ai",
  keywords: ["instagram", "conteúdo", "engajamento", "prompts", "IA", "marketing digital"],
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${plusJakarta.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
