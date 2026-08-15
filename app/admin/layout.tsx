import type { Metadata } from 'next'
import { AdminHeader } from '@/components/admin/AdminHeader'

export const metadata: Metadata = {
  title: 'Painel BaXiJen',
  // O painel nunca deve aparecer em busca; o proxy já barra o acesso, isto é
  // só para não desperdiçar crawl e não expor a existência das rotas.
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminHeader />
      {children}
    </>
  )
}
