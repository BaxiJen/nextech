import React from 'react';
import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WhatsAppButton() {
  return (
    <a
      href="/contato"
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "bg-primary text-primary-foreground p-4 rounded-full shadow-lg",
        "transition-all duration-300 hover:scale-110 active:scale-95",
        "flex items-center justify-center"
      )}
      aria-label="Falar com a BaXiJen"
    >
      <Mail className="h-7 w-7" />
      <span className="sr-only">Contato</span>
    </a>
  );
}