import type { Metadata } from "next";
import { ContatoContent } from "./ContatoContent";

export const metadata: Metadata = {
  title: "BaXiJen | Contato",
  description: "Entre em contato conosco. Estamos prontos para conversar sobre suas necessidades e apresentar nossas soluções.",
  openGraph: {
    title: "BaXiJen | Contato",
    description: "Entre em contato com a BaXiJen para conhecer nossas soluções.",
    url: "https://baxijen.tech/contato",
    type: "website",
  },
};

export default function ContatoPage() {
  return <ContatoContent />;
}