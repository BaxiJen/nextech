'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, Mail, Target, TrendingUp, Users } from 'lucide-react'
import { Container } from '@/components/Container'

interface Resumo {
  leads: {
    total: number
    porStatus: Record<string, number>
    ultimos7: number
    ultimos30: number
    scoreMedio: number
  }
  newsletter: { total: number; confirmed: number; pending: number; unsubscribed: number } | null
  geradoEm: string
}

interface EtapaFunil {
  step: string
  label: string
  sessoes: number
  percentualDoTopo: number
  perdaNaEtapa: number
  percentualPerdido: number
}

interface Funil {
  dias: number
  etapas: EtapaFunil[]
  gargalo: EtapaFunil | null
}

interface EventoAuditoria {
  at: string
  actor_name: string
  action: string
  entity_id: string
  label?: string
  before?: string
  after?: string
}

const ROTULO_STATUS: Record<string, string> = {
  new: 'Novo',
  contacted: 'Contatado',
  qualified: 'Qualificado',
  converted: 'Convertido',
  lost: 'Perdido',
}

const COR_STATUS: Record<string, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-amber-500',
  qualified: 'bg-violet-500',
  converted: 'bg-emerald-500',
  lost: 'bg-red-500',
}

function Cartao({
  titulo,
  valor,
  detalhe,
  icone: Icone,
  cor,
}: {
  titulo: string
  valor: string | number
  detalhe?: string
  icone: typeof Users
  cor: string
}) {
  return (
    <div className={`rounded-lg border p-4 ${cor}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{titulo}</p>
          <p className="text-2xl font-bold">{valor}</p>
          {detalhe && <p className="mt-1 text-xs text-muted-foreground">{detalhe}</p>}
        </div>
        <Icone className="h-8 w-8 opacity-40" />
      </div>
    </div>
  )
}

function descreveEvento(evento: EventoAuditoria): string {
  const quem = evento.actor_name
  const alvo = evento.label || evento.entity_id

  if (evento.action === 'lead.status') {
    const de = ROTULO_STATUS[evento.before || ''] || evento.before
    const para = ROTULO_STATUS[evento.after || ''] || evento.after
    return `${quem} moveu ${alvo} de ${de} para ${para}`
  }
  if (evento.action === 'lead.delete') return `${quem} excluiu ${alvo}`
  if (evento.action === 'lead.update') return `${quem} editou ${alvo}`
  return `${quem}: ${evento.action}`
}

export default function VisaoGeralPage() {
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const [atividade, setAtividade] = useState<EventoAuditoria[]>([])
  const [funil, setFunil] = useState<Funil | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/resumo').then(r => (r.ok ? r.json() : Promise.reject(new Error('resumo')))),
      fetch('/api/admin/atividade').then(r => (r.ok ? r.json() : [])),
      fetch('/api/admin/funil?dias=30').then(r => (r.ok ? r.json() : null)),
    ])
      .then(([dadosResumo, dadosAtividade, dadosFunil]) => {
        setResumo(dadosResumo)
        setAtividade(Array.isArray(dadosAtividade) ? dadosAtividade : [])
        setFunil(dadosFunil)
      })
      .catch(() => setErro('Não foi possível carregar os números agora.'))
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

  const leads = resumo?.leads
  const pipeline = Object.entries(leads?.porStatus || {})
  const totalPipeline = pipeline.reduce((soma, [, quantidade]) => soma + quantidade, 0)

  return (
    <Container className="py-12">
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Visão geral</h1>
          <p className="text-muted-foreground">Leads, pipeline e newsletter.</p>
        </div>

        {erro && (
          <p role="alert" className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {erro}
          </p>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Cartao
            titulo="Total de leads"
            valor={leads?.total ?? 0}
            icone={Target}
            cor="bg-primary/10 border-primary/20"
          />
          <Cartao
            titulo="Últimos 7 dias"
            valor={leads?.ultimos7 ?? 0}
            detalhe={`${leads?.ultimos30 ?? 0} nos últimos 30`}
            icone={TrendingUp}
            cor="bg-blue-500/10 border-blue-500/20"
          />
          <Cartao
            titulo="Score médio"
            valor={leads?.scoreMedio ?? 0}
            icone={Activity}
            cor="bg-orange-500/10 border-orange-500/20"
          />
          <Cartao
            titulo="Newsletter"
            valor={resumo?.newsletter?.confirmed ?? '—'}
            detalhe={
              resumo?.newsletter
                ? `${resumo.newsletter.pending} pendentes, ${resumo.newsletter.unsubscribed} saíram`
                : 'contagem indisponível'
            }
            icone={Mail}
            cor="bg-emerald-500/10 border-emerald-500/20"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border p-5">
            <h2 className="mb-4 font-semibold">Pipeline</h2>

            {totalPipeline === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum lead ainda.</p>
            ) : (
              <div className="space-y-3">
                {pipeline.map(([status, quantidade]) => (
                  <div key={status}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{ROTULO_STATUS[status] || status}</span>
                      <span className="text-muted-foreground">{quantidade}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full ${COR_STATUS[status] || 'bg-primary'}`}
                        style={{ width: `${Math.round((quantidade / totalPipeline) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/admin/leads"
              className="mt-5 inline-block text-sm text-primary hover:underline"
            >
              Ver todos os leads →
            </Link>
          </section>

          <section className="rounded-lg border p-5">
            <h2 className="mb-4 font-semibold">Atividade recente</h2>

            {atividade.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma alteração ainda.</p>
            ) : (
              <ul className="space-y-3">
                {atividade.map(evento => (
                  <li key={`${evento.at}-${evento.entity_id}`} className="text-sm">
                    <p>{descreveEvento(evento)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(evento.at).toLocaleString('pt-BR')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-lg border p-5">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold">Funil do chat</h2>
            <span className="text-xs text-muted-foreground">últimos {funil?.dias ?? 30} dias</span>
          </div>

          {!funil || funil.etapas[0]?.sessoes === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma conversa nesta janela.</p>
          ) : (
            <>
              <div className="space-y-3">
                {funil.etapas.map((etapa, i) => (
                  <div key={etapa.step}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{etapa.label}</span>
                      <span className="text-muted-foreground">
                        {etapa.sessoes}
                        {i > 0 && etapa.perdaNaEtapa > 0 && (
                          <span className="ml-2 text-red-500">−{etapa.percentualPerdido}%</span>
                        )}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full ${
                          funil.gargalo?.step === etapa.step ? 'bg-red-500' : 'bg-primary'
                        }`}
                        style={{ width: `${etapa.percentualDoTopo}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {funil.gargalo && (
                <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm">
                  Maior queda em <strong>{funil.gargalo.label}</strong>: {funil.gargalo.perdaNaEtapa}{' '}
                  {funil.gargalo.perdaNaEtapa === 1 ? 'conversa parou' : 'conversas pararam'} antes
                  desta etapa ({funil.gargalo.percentualPerdido}% de quem chegou na anterior).
                </p>
              )}
            </>
          )}
        </section>

      </div>
    </Container>
  )
}
