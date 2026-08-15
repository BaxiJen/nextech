'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, LogOut, Users } from 'lucide-react'
import { Container } from '@/components/Container'

interface Identidade {
  name: string
  email: string
}

const LINKS = [
  { href: '/admin', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/admin/leads', label: 'Leads', icon: Users },
]

export function AdminHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [identidade, setIdentidade] = useState<Identidade | null>(null)
  const [saindo, setSaindo] = useState(false)

  const noLogin = pathname === '/admin/login'

  useEffect(() => {
    if (noLogin) return
    let ativo = true

    fetch('/api/auth/sessao')
      .then(resposta => (resposta.ok ? resposta.json() : null))
      .then(dados => {
        if (ativo && dados?.authenticated) setIdentidade({ name: dados.name, email: dados.email })
      })
      .catch(() => {})

    return () => {
      ativo = false
    }
  }, [noLogin, pathname])

  if (noLogin) return null

  async function sair() {
    setSaindo(true)
    await fetch('/api/auth/sessao', { method: 'DELETE' }).catch(() => {})
    router.replace('/admin/login')
    router.refresh()
  }

  return (
    <div className="border-b bg-muted/30">
      <Container className="flex flex-wrap items-center justify-between gap-4 py-3">
        <nav className="flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icone }) => {
            const ativo = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  ativo ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icone className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {identidade && (
            <span className="text-muted-foreground">
              {identidade.name} <span className="hidden sm:inline">({identidade.email})</span>
            </span>
          )}
          <button
            onClick={sair}
            disabled={saindo}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {saindo ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      </Container>
    </div>
  )
}
