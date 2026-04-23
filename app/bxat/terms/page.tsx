'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/Container';
import Link from 'next/link';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'zh', label: '中文' },
];

export default function BXatTermsPage() {
  const [lang, setLang] = useState('pt');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(`/bxat/terms-${lang}.html`)
      .then((r) => r.text())
      .then((html) => {
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        setContent(bodyMatch ? bodyMatch[1] : html);
      })
      .catch(() => setContent('<p>Erro ao carregar os termos de uso.</p>'));
  }, [lang]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container className="flex items-center justify-between py-3">
          <Link
            href="/bxat"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            BXat
          </Link>

          <div className="relative">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="appearance-none bg-muted text-sm rounded-lg px-4 py-2 pr-8 border border-border cursor-pointer hover:border-foreground/30 transition"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </Container>
      </div>

      {/* Content */}
      <Container className="py-12">
        <div
          className="prose prose-neutral dark:prose-invert max-w-3xl mx-auto prose-headings:scroll-mt-20 prose-h1:text-3xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-a:text-primary prose-table:text-sm prose-th:bg-muted"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </Container>
    </div>
  );
}
