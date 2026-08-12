'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Mail, X } from 'lucide-react'

const STORAGE_KEY = 'baxijen-newsletter-card-dismissed-at'
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000

export function FloatingNewsletterCard() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const dismissedAt = Number(window.localStorage.getItem(STORAGE_KEY) || 0)
        setVisible(!dismissedAt || Date.now() - dismissedAt > DISMISS_FOR_MS)
      } catch {
        setVisible(true)
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

  const dismiss = () => {
    setVisible(false)
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()))
    } catch {
      // A dispensa continua válida durante a navegação mesmo sem localStorage.
    }
  }

  if (!visible) return null

  return (
    <aside aria-label="Newsletter semanal" className="fixed z-40">
      {/* Celular: faixa compacta ao lado do botão do chat. */}
      <div className="fixed bottom-6 left-3 right-24 sm:hidden rounded-2xl border border-primary/30 bg-background/95 shadow-2xl shadow-black/25 backdrop-blur-xl">
        <div className="flex items-center gap-2 p-2">
          <Link
            href="/blog#newsletter"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Mail className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">Posts da semana</span>
              <span className="block truncate text-[11px] text-muted-foreground">Receba o resumo por email</span>
            </span>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-primary" />
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fechar convite da newsletter"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Desktop: card completo no canto oposto ao chat. */}
      <div className="fixed bottom-6 left-6 hidden w-[340px] overflow-hidden rounded-3xl border border-primary/30 bg-background/95 shadow-2xl shadow-black/30 backdrop-blur-xl sm:block">
        <div className="h-1 bg-gradient-to-r from-primary via-[#97c459] to-primary" />
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Fechar convite da newsletter"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5">
          <div className="mb-4 flex items-center gap-3 pr-8">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">Newsletter BaXiJen</p>
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>
                Os posts da semana
              </h2>
            </div>
          </div>

          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            IA soberana, agentes e produto em um único email. Sem publicação nova, sem mensagem.
          </p>

          <Link
            href="/blog#newsletter"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Quero receber
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">No máximo um email por semana.</p>
        </div>
      </div>
    </aside>
  )
}
