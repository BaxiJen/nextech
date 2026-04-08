import type { Metadata } from "next";
import { SobreContent } from "./SobreContent";

export const metadata: Metadata = {
  title: "Sobre BaXiJen | História, Missão e Equipe",
  description: "Conheça a história da BaXiJen, nossa missão nossa equipe",
  openGraph: {
    title: "Sobre BaXiJen | História, Missão e Equipe",
    description: "Conheça a história da BaXiJen e nossa equipe.",
    url: "https://baxijen.tech/sobre",
    type: "website",
  },
};

export default function SobrePage() {
  return <SobreContent />;
}