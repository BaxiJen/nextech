import { GestorPublicoContent } from './GestorPublicoContent';

export const metadata = {
  title: 'IA para Gestão Pública — BXat by BaXiJen',
  description: 'Converse com a IA que entende licitação, transparência, MGI e burocracia municipal. Assistente inteligente para gestores públicos brasileiros.',
  openGraph: {
    title: 'IA para Gestão Pública — BXat',
    description: 'Seu assistente inteligente para licitações, transparência e gestão municipal.',
    url: 'https://baxijen.com.br/gestor-publico',
    type: 'website',
  },
};

export default function GestorPublicoPage() {
  return <GestorPublicoContent />;
}