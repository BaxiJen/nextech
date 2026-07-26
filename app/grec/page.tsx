import type { Metadata } from "next";
import { GRECContent } from "./GRECContent";

export const metadata: Metadata = {
  title: "BaXiJen | GREC — Gestão de Reputações e Crises",
  description: "Agente de IA integrado ao sistema GREC para proteção de reputação institucional. Análises, relatórios e previsões em tempo real.",
  openGraph: {
    title: "BaXiJen | GREC — Gestão de Reputações e Crises",
    description: "Agente de IA integrado ao sistema GREC para proteção de reputação institucional.",
    url: "https://baxijen.com.br/grec",
    type: "website",
  },
};

export default function GRECPage() {
  return <GRECContent />;
}