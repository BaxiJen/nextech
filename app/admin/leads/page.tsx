'use client'

import { useEffect, useState } from 'react'
import { Lead } from '@/lib/types'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import {
  Search,
  Download,
  Trash2,
  Eye,
  Mail,
  Phone,
  Target,
  TrendingUp,
} from 'lucide-react'

interface EventoAuditoria {
  at: string
  actor_name: string
  action: string
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

/**
 * A sessão pode ter sido revogada ou vencido entre uma ação e outra. Sem isso,
 * a tela mostraria "erro ao carregar" para uma pessoa que só precisa entrar de
 * novo.
 */
function sessaoExpirada(response: Response): boolean {
  if (response.status !== 401) return false
  window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`
  return true
}

function descreveEvento(evento: EventoAuditoria): string {
  if (evento.action === 'lead.status') {
    const de = ROTULO_STATUS[evento.before || ''] || evento.before
    const para = ROTULO_STATUS[evento.after || ''] || evento.after
    return `${evento.actor_name} moveu de ${de} para ${para}`
  }
  if (evento.action === 'lead.delete') return `${evento.actor_name} excluiu`
  return `${evento.actor_name}: ${evento.action}`
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'score'>('recent')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [historico, setHistorico] = useState<EventoAuditoria[]>([])
  const [carregandoHistorico, setCarregandoHistorico] = useState(false)

  // Fetch leads
  useEffect(() => {
    fetchLeads()
  }, [])

  // Filter leads when search, status or sort changes
  useEffect(() => {
    let filtered = [...leads]

    // Search filter
    if (search.trim()) {
      filtered = filtered.filter(
        lead =>
          lead.name.toLowerCase().includes(search.toLowerCase()) ||
          lead.email.toLowerCase().includes(search.toLowerCase()) ||
          lead.objective?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter)
    }

    // Sort
    if (sortBy === 'score') {
      filtered.sort((a, b) => b.score - a.score)
    } else {
      filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }

    setFilteredLeads(filtered)
  }, [leads, search, statusFilter, sortBy])

  async function fetchLeads() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/leads')
      if (sessaoExpirada(response)) return
      if (!response.ok) throw new Error('Falha ao carregar leads')
      const data = await response.json()
      setLeads(data || [])
    } catch (error) {
      console.error('Erro ao carregar leads:', error)
      alert('Erro ao carregar leads. Verifique as variáveis de ambiente.')
    } finally {
      setLoading(false)
    }
  }

  async function deleteLead(id: string) {
    if (!confirm('Tem certeza que deseja deletar este lead?')) return

    try {
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: 'DELETE',
      })
      if (sessaoExpirada(response)) return
      if (!response.ok) throw new Error('Falha ao deletar lead')
      setLeads(leads.filter(l => l.id !== id))
      setShowModal(false)
    } catch (error) {
      console.error('Erro ao deletar lead:', error)
      alert('Erro ao deletar lead')
    }
  }

  async function updateLeadStatus(id: string, status: Lead['status']) {
    try {
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (sessaoExpirada(response)) return
      if (!response.ok) throw new Error('Falha ao atualizar lead')
      const updated = await response.json()
      setLeads(leads.map(l => (l.id === id ? updated : l)))
      if (selectedLead?.id === id) {
        setSelectedLead(updated)
        carregarHistorico(id)
      }
    } catch (error) {
      console.error('Erro ao atualizar lead:', error)
      alert('Erro ao atualizar lead')
    }
  }

  async function carregarHistorico(id: string) {
    setCarregandoHistorico(true)
    try {
      const response = await fetch(`/api/admin/leads/${id}/auditoria`)
      if (sessaoExpirada(response) || !response.ok) return
      setHistorico(await response.json())
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setCarregandoHistorico(false)
    }
  }

  function abrirLead(lead: Lead) {
    setSelectedLead(lead)
    setShowModal(true)
    setHistorico([])
    carregarHistorico(lead.id)
  }

  async function exportCSV() {
    const headers = [
      'Nome',
      'Email',
      'Telefone',
      'Empresa',
      'Objetivo',
      'Score',
      'Status',
      'Fonte',
      'Data',
    ]
    const rows = filteredLeads.map(lead => [
      lead.name,
      lead.email,
      lead.phone || '-',
      lead.company || '-',
      lead.objective || '-',
      lead.score,
      lead.status,
      lead.source,
      new Date(lead.created_at).toLocaleDateString('pt-BR'),
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `leads-${Date.now()}.csv`)
    link.click()
  }

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    avgScore: leads.length > 0 ? Math.round(leads.reduce((a, b) => a + b.score, 0) / leads.length) : 0,
  }

  if (loading) {
    return (
      <Container className="py-12">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-12">
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestão de Leads</h1>
          <p className="text-muted-foreground">Visualize e gerencie os leads capturados.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Leads</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-primary opacity-50" />
            </div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Novos</p>
                <p className="text-2xl font-bold">{stats.new}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qualificados</p>
                <p className="text-2xl font-bold">{stats.qualified}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Médio</p>
                <p className="text-2xl font-bold">{stats.avgScore}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou objetivo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border rounded-lg focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-background border rounded-lg focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="new">Novo</option>
              <option value="contacted">Contatado</option>
              <option value="qualified">Qualificado</option>
              <option value="converted">Convertido</option>
              <option value="lost">Perdido</option>
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'recent' | 'score')}
              className="px-4 py-2 bg-background border rounded-lg focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="recent">Mais Recentes</option>
              <option value="score">Maior Score</option>
            </select>
            <Button onClick={exportCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-background border rounded-lg overflow-hidden">
          {filteredLeads.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum lead encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Nome</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Score</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Data</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">{lead.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{lead.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{ width: `${lead.score}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold">{lead.score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={lead.status}
                          onChange={e => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
                          className={`px-3 py-1 rounded text-xs font-semibold border-0 outline-none cursor-pointer ${
                            lead.status === 'new'
                              ? 'bg-blue-500/10 text-blue-600'
                              : lead.status === 'contacted'
                                ? 'bg-purple-500/10 text-purple-600'
                                : lead.status === 'qualified'
                                  ? 'bg-green-500/10 text-green-600'
                                  : lead.status === 'converted'
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : 'bg-red-500/10 text-red-600'
                          }`}
                        >
                          <option value="new">Novo</option>
                          <option value="contacted">Contatado</option>
                          <option value="qualified">Qualificado</option>
                          <option value="converted">Convertido</option>
                          <option value="lost">Perdido</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => abrirLead(lead)}
                            className="p-2 hover:bg-muted rounded transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => deleteLead(lead.id)}
                            className="p-2 hover:bg-red-500/10 text-red-600 rounded transition-colors"
                            title="Deletar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Detalhes */}
        {showModal && selectedLead && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-md w-full p-6 space-y-4">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{selectedLead.name}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${selectedLead.email}`} className="text-primary hover:underline">
                      {selectedLead.email}
                    </a>
                  </p>
                </div>

                {selectedLead.phone && (
                  <div>
                    <label className="text-xs text-muted-foreground">Telefone</label>
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <Phone className="h-4 w-4" />
                      <a href={`https://wa.me/${selectedLead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {selectedLead.phone}
                      </a>
                    </p>
                  </div>
                )}

                {selectedLead.company && (
                  <div>
                    <label className="text-xs text-muted-foreground">Empresa</label>
                    <p className="text-sm font-medium">{selectedLead.company}</p>
                  </div>
                )}

                {selectedLead.objective && (
                  <div>
                    <label className="text-xs text-muted-foreground">Objetivo</label>
                    <p className="text-sm font-medium">{selectedLead.objective}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div>
                    <label className="text-xs text-muted-foreground">Score</label>
                    <p className="text-sm font-bold">{selectedLead.score}/100</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Status</label>
                    <p className="text-sm font-bold capitalize">{selectedLead.status}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Fonte</label>
                    <p className="text-sm font-bold capitalize">{selectedLead.source}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Data</label>
                    <p className="text-sm font-bold">
                      {new Date(selectedLead.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {selectedLead.notes && (
                  <div>
                    <label className="text-xs text-muted-foreground">Notas</label>
                    <p className="text-sm">{selectedLead.notes}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-3">
                <label className="text-xs text-muted-foreground">Histórico</label>
                {carregandoHistorico ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : historico.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma alteração registrada neste lead.
                  </p>
                ) : (
                  <ul className="mt-1 max-h-40 space-y-2 overflow-y-auto">
                    {historico.map(evento => (
                      <li key={evento.at} className="text-sm">
                        <p>{descreveEvento(evento)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(evento.at).toLocaleString('pt-BR')}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => deleteLead(selectedLead.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Deletar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}
