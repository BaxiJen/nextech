'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, Mail, XCircle } from 'lucide-react'
import { Container } from '@/components/Container'

interface Campanha {
  campaign_id: string
  subject?: string
  status?: string
  started_at?: string
  finished_at?: string
  subscribers?: number
  sent?: number
  skipped?: number
  failed?: number
  error?: string
  posts?: Array<{ title: string; url: string }>
}

const ESTADO = {
  completed: { rotulo: 'Concluída', icone: CheckCircle2, cor: 'text-emerald-600' },
  running: { rotulo: 'Em andamento', icone: Clock, cor: 'text-amber-600' },
  failed: { rotulo: 'Falhou', icone: XCircle, cor: 'text-red-600' },
} as const

function estadoDe(status?: string) {
  return ESTADO[status as keyof typeof ESTADO] ?? ESTADO.running
}

function quando(iso?: string) {
  return iso ? new Date(iso).toLocaleString('pt-BR') : '—'
}

export default function CampanhasPage() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetch('/api/admin/campanhas')
      .then(r => {
        if (r.status === 401) {
          window.location.href = `/admin/login?next=${encodeURIComponent('/admin/campanhas')}`
          return []
        }
        return r.ok ? r.json() : Promise.reject(new Error('campanhas'))
      })
      .then(dados => setCampanhas(Array.isArray(dados) ? dados : []))
      .catch(() => setErro('Não foi possível carregar as campanhas.'))
      .finally(() => setCarregando(false))
  }, [])

  if (carregando) {
    return (
      <Container className="py-12">
        <div className="flex min-h-96 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-12">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Campanhas</h1>
          <p className="text-muted-foreground">Envios do resumo semanal da newsletter.</p>
        </div>

        {erro && (
          <p role="alert" className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {erro}
          </p>
        )}

        {campanhas.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <Mail className="mx-auto mb-3 h-8 w-8 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">Nenhuma campanha enviada.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {campanhas.map(campanha => {
              const estado = estadoDe(campanha.status)
              const Icone = estado.icone

              return (
                <li key={campanha.campaign_id} className="rounded-lg border p-5">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{campanha.subject || 'Resumo semanal'}</p>
                      <p className="text-xs text-muted-foreground">{quando(campanha.started_at)}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-sm ${estado.cor}`}>
                      <Icone className="h-4 w-4" />
                      {estado.rotulo}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t pt-3 text-sm sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Enviados</p>
                      <p className="font-bold">{campanha.sent ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pulados</p>
                      <p className="font-bold">{campanha.skipped ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Falhas</p>
                      <p className={`font-bold ${campanha.failed ? 'text-red-600' : ''}`}>
                        {campanha.failed ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Inscritos</p>
                      <p className="font-bold">{campanha.subscribers ?? 0}</p>
                    </div>
                  </div>

                  {campanha.posts && campanha.posts.length > 0 && (
                    <ul className="mt-3 space-y-1 border-t pt-3">
                      {campanha.posts.map(post => (
                        <li key={post.url} className="text-sm">
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {post.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}

                  {campanha.error && (
                    <p className="mt-3 rounded bg-red-500/10 px-3 py-2 text-xs text-red-600">
                      {campanha.error}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Container>
  )
}
