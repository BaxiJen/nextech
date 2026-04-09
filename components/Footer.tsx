import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Linkedin } from 'lucide-react';
import { Container } from './Container';

export function Footer() {
  return (
    <footer className="bg-muted border-t">
      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image 
                src="/baxijen_symbol.png" 
                alt="BaXiJen" 
                width={40} 
                height={40}
                className="h-10 w-10 dark:invert"
              />
            </Link>
            <p className="text-muted-foreground max-w-xs">
              Tecnologia brasileira com visão global. Combinamos inovação e conectividade para resolver seus desafios.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Serviços</h3>
            <ul className="space-y-2">
              <li><Link href="/servicos" className="text-sm text-muted-foreground hover:text-primary transition-colors">Todos os Serviços</Link></li>
              <li><Link href="/sites-express" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sites Express</Link></li>
              <li><Link href="/agentes-ia" className="text-sm text-muted-foreground hover:text-primary transition-colors">Agentes de IA</Link></li>
              <li><Link href="/chatbots-whatsapp" className="text-sm text-muted-foreground hover:text-primary transition-colors">Chatbots WhatsApp</Link></li>
              <li><Link href="/sistemas-web" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sistemas Web</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li><Link href="/sobre" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sobre Nós</Link></li>
              <li><Link href="/contato" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contato</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} BaXiJen. Todos os direitos reservados.</p>
          <a
            href="https://www.linkedin.com/company/baxijen/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="LinkedIn da BaXiJen"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
      </Container>
    </footer>
  );
}
