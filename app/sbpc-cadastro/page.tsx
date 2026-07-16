import type { Metadata } from "next";
import { SbpcCadastroContent } from './SbpcCadastroContent';

export const metadata: Metadata = {
  title: "Pré-registro SBPC 2026 | BaXiJen + Zhipu AI",
  description:
    "Cadastre-se e tenha uma experiência integrada com a BaXi durante o evento.",
  openGraph: {
    title: "Pré-registro SBPC 2026 | BaXiJen + Zhipu AI",
    description:
      "Cadastre-se e tenha uma experiência integrada com a BaXi durante o evento.",
    url: "https://baxijen.com.br/sbpc-cadastro",
    type: "website",
  },
};

export default function SbpcCadastroPage() {
  return <SbpcCadastroContent />;
}