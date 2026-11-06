type Params = Record<string, string | number | undefined>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Evento no GA4 (G-3Y99X0TP1K, carregado em app/layout.tsx). Bloqueador de
 * anúncio ou script que não carregou deixam `gtag` ausente; medir nunca pode
 * impedir o clique ou o envio que o evento descreve.
 */
export function track(evento: string, params: Params = {}): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  try {
    window.gtag('event', evento, params)
  } catch {
    // ignorado: ver acima
  }
}
