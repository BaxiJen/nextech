'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/Container';
import Link from 'next/link';

export default function TermsPage() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/terms-pt.html')
      .then((r) => r.text())
      .then((html) => {
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        setContent(bodyMatch ? bodyMatch[1] : html);
      })
      .catch(() => setContent('<p>Erro ao carregar os termos.</p>'));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container className="flex items-center justify-between py-3">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Início
          </Link>
          <span className="text-sm font-medium text-muted-foreground">
            Termos e Condições
          </span>
        </Container>
      </div>

      <Container className="py-12">
        <div
          className="prose prose-neutral dark:prose-invert max-w-3xl mx-auto prose-headings:scroll-mt-20 prose-h1:text-3xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-a:text-primary prose-table:text-sm prose-th:bg-muted"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </Container>
    </div>
  );
}