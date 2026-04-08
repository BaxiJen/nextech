import type { Metadata } from "next";
import { AgentesIAContent } from "./AgentesIAContent";

export const metadata: Metadata = {
  title: "BaXiJen | Agentes de IA",
  description: "Automação inteligente com agentes de IA. Crie assistentes virtuais que aprendem e se adaptam às necessidades do seu negócio.",
  openGraph: {
    title: "BaXiJen | Agentes de IA",
    description: "Automação inteligente com agentes de IA para seu negócio.",
    url: "https://baxijen.tech/agentes-ia",
    type: "website",
  },
};

export default function AgentesIAPage() {
  return <AgentesIAContent />;
}