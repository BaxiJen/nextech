import type { Metadata } from "next";
import { ServicesContent } from "./ServicesContent";

export const metadata: Metadata = {
  title: "BaXiJen | Serviços de Tecnologia",
  description: "Conheça nossos serviços de desenvolvimento web, sistemas inteligentes e automações com IA. Soluções personalizadas para sua empresa.",
  openGraph: {
    title: "BaXiJen | Serviços de Tecnologia",
    description: "Conheça nossos serviços de desenvolvimento web, sistemas inteligentes e automações com IA.",
    url: "https://baxijen.tech/servicos",
    type: "website",
  },
};

export default function ServicesPage() {
  return <ServicesContent />;
}