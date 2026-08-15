'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'

/** Só caminho interno: sem isso, `?next=` viraria redirecionamento aberto. */
function destinoSeguro(next: string | null): string {
  if (!next || !next.startsWith('/admin') || next.startsWith('//')) return '/admin'
  if (next.startsWith('/admin/login')) return '/admin'
  return next
}

function Formulario() {
  const router = useRouter()
  const destino = destinoSeguro(useSearchParams().get('next'))

  const [passo, setPasso] = useState<'email' | 'codigo'>('email')
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [espera, setEspera] = useState(0)

  useEffect(() => {
    if (espera <= 0) return
    const timer = setTimeout(() => setEspera(espera - 1), 1000)
    return () => clearTimeout(timer)
  }, [espera])

  async function pedirCodigo(evento?: React.FormEvent) {
    evento?.preventDefault()
    setErro('')
    setEnviando(true)

    try {
      const resposta = await fetch('/api/auth/codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const dados = await resposta.json()

      if (!resposta.ok) {
        setErro(dados.error || 'Não foi possível enviar o código')
        return
      }

      setPasso('codigo')
      setAviso(dados.message)
      setEspera(60)
    } catch {
      setErro('Falha de rede. Tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault()
    setErro('')
    setEnviando(true)

    try {
      const resposta = await fetch('/api/auth/sessao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: codigo }),
      })

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}))
        setErro(dados.error || 'Código inválido ou expirado')
        setCodigo('')
        return
      }

      // replace, não push: o botão voltar não deve trazer de volta o login.
      router.replace(destino)
      router.refresh()
    } catch {
      setErro('Falha de rede. Tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="mb-2 text-2xl font-bold">Painel BaXiJen</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        {passo === 'email'
          ? 'Digite seu email para receber um código de acesso.'
          : `Código enviado para ${email}.`}
      </p>

      {passo === 'email' ? (
        <form onSubmit={pedirCodigo} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={evento => setEmail(evento.target.value)}
              placeholder="voce@baxi.ia.br"
              className="w-full rounded-lg border bg-background px-4 py-2 outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <Button type="submit" disabled={enviando} className="w-full">
            {enviando ? 'Enviando...' : 'Receber código'}
          </Button>
        </form>
      ) : (
        <form onSubmit={entrar} className="space-y-4">
          <div>
            <label htmlFor="codigo" className="mb-1 block text-xs text-muted-foreground">
              Código de 6 dígitos
            </label>
            <input
              id="codigo"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              autoFocus
              maxLength={6}
              value={codigo}
              onChange={evento => setCodigo(evento.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full rounded-lg border bg-background px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <Button type="submit" disabled={enviando || codigo.length !== 6} className="w-full">
            {enviando ? 'Verificando...' : 'Entrar'}
          </Button>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => {
                setPasso('email')
                setCodigo('')
                setErro('')
                setAviso('')
              }}
              className="hover:text-foreground"
            >
              Trocar de email
            </button>
            <button
              type="button"
              disabled={espera > 0 || enviando}
              onClick={() => pedirCodigo()}
              className="hover:text-foreground disabled:opacity-50"
            >
              {espera > 0 ? `Reenviar em ${espera}s` : 'Reenviar código'}
            </button>
          </div>
        </form>
      )}

      {erro && (
        <p role="alert" className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-600">
          {erro}
        </p>
      )}

      {!erro && aviso && <p className="mt-4 text-xs text-muted-foreground">{aviso}</p>}

    </div>
  )
}

export default function LoginPage() {
  return (
    <Container className="flex min-h-[70vh] items-center py-16">
      <Suspense fallback={null}>
        <Formulario />
      </Suspense>
    </Container>
  )
}
