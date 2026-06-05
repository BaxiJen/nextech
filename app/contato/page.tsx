import type { Metadata } from "next";
import { ContatoContent } from "./ContatoContent";

export const metadata: Metadata = {
  title: "Contato | BaXiJen — IA soberana para negócios brasileiros",
  description: "Fale com a BaXiJen. Agentes de IA com soberania de dados. Conte seu desafio e receba uma proposta personalizada em até 24 horas.",
  openGraph: {
    title: "Contato | BaXiJen",
    description: "Agentes de IA com soberania de dados. Conte seu desafio e receba uma proposta personalizada.",
    url: "https://baxijen.com.br/contato",
    type: "website",
  },
};

export default function ContatoPage() {
  return <ContatoContent />;
}