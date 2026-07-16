import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "../globals.css";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pré-registro SBPC 2026 | BaXiJen + Zhipu AI",
  description:
    "Faça seu pré-registro para a SBPC 2026 e tenha uma experiência integrada com a BaXi durante o evento.",
  openGraph: {
    title: "Pré-registro SBPC 2026 | BaXiJen + Zhipu AI",
    description:
      "Cadastre-se e tenha uma experiência integrada com a BaXi durante o evento.",
    url: "https://baxijen.com.br/sbpc-cadastro",
    type: "website",
  },
};

export default function SbpcCadastroLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3Y99X0TP1K" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-3Y99X0TP1K');
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}