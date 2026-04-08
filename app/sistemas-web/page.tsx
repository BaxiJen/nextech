import type { Metadata } from "next";
import { SistemasWebContent } from "./SistemasWebContent";

export const metadata: Metadata = {
  title: "BaXiJen | Sistemas Web",
  description: "Desenvolvimento de sistemas web personalizados e robustos. Soluções escaláveis para todos os tipos de negócios.",
  openGraph: {
    title: "BaXiJen | Sistemas Web",
    description: "Desenvolvimento de sistemas web personalizados e robustos para seu negócio.",
    url: "https://baxijen.tech/sistemas-web",
    type: "website",
  },
};

export default function SistemasWebPage() {
  return <SistemasWebContent />;
}