import { PMEContent } from './PMEContent';

export const metadata = {
  title: 'IA para PMEs — Resolva burocracia sozinho | BaXiJen',
  description: 'FGTS, CNPJ, e-CAC, DCTF, guias, impostos. Sua IA já sabe o caminho. Para pequenas e médias empresas brasileiras.',
  openGraph: {
    title: 'IA para PMEs — Resolva burocracia sozinho',
    description: 'Converse com a IA que entende burocracia brasileira. FGTS, CNPJ, impostos e mais.',
    url: 'https://baxi.ia.br/pme',
    type: 'website',
  },
};

export default function PMEPage() {
  return <PMEContent />;
}