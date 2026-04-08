import type { Metadata } from "next";
import { SitesExpressContent } from "./SitesExpressContent";

export const metadata: Metadata = {
  title: "BaXiJen | Sites Express",
  description: "Crie sites estáticos rápidos e otimizados com nosso serviço Express. Perfeito para portfólios, blogs e apresentação de empresas.",
  openGraph: {
    title: "BaXiJen | Sites Express",
    description: "Crie sites estáticos rápidos e otimizados com nosso serviço Express.",
    url: "https://baxijen.tech/sites-express",
    type: "website",
  },
};

export default function SitesExpressPage() {
  return <SitesExpressContent />;
}