import type { Metadata } from "next";
import { ChatbotsContent } from "./ChatbotsContent";

export const metadata: Metadata = {
  title: "BaXiJen | Chatbots WhatsApp",
  description: "Crie chatbots inteligentes para WhatsApp. Automação de atendimento, vendas e suporte em tempo real.",
  openGraph: {
    title: "BaXiJen | Chatbots WhatsApp",
    description: "Crie chatbots inteligentes para WhatsApp com automação completa.",
    url: "https://baxijen.tech/chatbots-whatsapp",
    type: "website",
  },
};

export default function ChatbotsPage() {
  return <ChatbotsContent />;
}