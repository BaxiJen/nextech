import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { LiveAgent } from "@/components/LiveAgent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseURL = "https://baxijen.tech";

export const metadata: Metadata = {
  title: "BaXiJen | Tecnologia Brasileira com Visão Global",
  description: "BaXiJen (巴西人) desenvolve soluções tecnológicas inteligentes: sites, agentes de IA, chatbots e sistemas sob medida. Tecnologia brasileira com padrão global.",
  keywords: ["BaXiJen", "tecnologia", "IA", "inteligência artificial", "desenvolvimento web", "chatbot", "automação", "Brasil"],
  authors: [{ name: "BaXiJen" }],
  metadataBase: new URL(baseURL),
  alternates: {
    canonical: baseURL,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: baseURL,
    siteName: "BaXiJen",
    title: "BaXiJen | Tecnologia Brasileira com Visão Global",
    description: "Tecnologia inteligente feita no Brasil, com identidade própria e visão global.",
    images: [
      {
        url: `${baseURL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "BaXiJen - Tecnologia Brasileira",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BaXiJen | Tecnologia Brasileira com Visão Global",
    description: "Combinamos inovação e conectividade com um toque de calor humano.",
    images: [`${baseURL}/og-image.jpg`],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <LiveAgent />
        <Analytics />
      </body>
    </html>
  );
}
