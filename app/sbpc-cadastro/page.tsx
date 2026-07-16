import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pré-registro SBPC 2026 | BaXiJen × Zhipu AI",
  description:
    "Faça seu pré-registro para a SBPC 2026 e converse com a IA BaXi ao vivo. Cadastro rápido em menos de 1 minuto.",
  openGraph: {
    title: "Pré-registro SBPC 2026 | BaXiJen × Zhipu AI",
    description:
      "Faça seu pré-registro para a SBPC 2026 e converse com a IA BaXi ao vivo.",
    url: "https://baxijen.com.br/sbpc-cadastro",
    type: "website",
  },
};

import { SbpcCadastroContent } from './SbpcCadastroContent';

export default function SbpcCadastroPage() {
  return <SbpcCadastroContent />;
}