import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { getAllPosts } = vi.hoisted(() => ({ getAllPosts: vi.fn() }))

vi.mock('@/lib/blog', () => ({ getAllPosts }))

const { GET } = await import('@/app/api/newsletter/weekly-content/route')

const AGORA = new Date('2026-08-14T12:00:00.000Z')

function post(slug: string, date: string) {
  return {
    slug,
    title: `Título de ${slug}`,
    description: `Descrição de ${slug}`,
    date,
    tags: ['ia', 'agentes', 'brasil', 'llm', 'produto', 'extra'],
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(AGORA)
  getAllPosts.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('janela de sete dias', () => {
  it('inclui post publicado dentro da semana', async () => {
    getAllPosts.mockReturnValue([post('recente', '2026-08-10')])

    const body = await (await GET()).json()

    expect(body.posts.map((p: { slug: string }) => p.slug)).toEqual(['recente'])
  })

  it('exclui post anterior à janela', async () => {
    getAllPosts.mockReturnValue([post('antigo', '2026-08-01')])

    const body = await (await GET()).json()

    expect(body.posts).toEqual([])
  })

  it('exclui post com data no futuro', async () => {
    // Post agendado não pode entrar no resumo antes de existir para o leitor.
    getAllPosts.mockReturnValue([post('agendado', '2026-08-20')])

    const body = await (await GET()).json()

    expect(body.posts).toEqual([])
  })

  it('ignora data inválida em vez de quebrar o digest', async () => {
    getAllPosts.mockReturnValue([post('quebrado', 'data-invalida'), post('ok', '2026-08-12')])

    const body = await (await GET()).json()

    expect(body.posts.map((p: { slug: string }) => p.slug)).toEqual(['ok'])
  })

  it('limita a cinco posts', async () => {
    getAllPosts.mockReturnValue(
      Array.from({ length: 9 }, (_, i) => post(`post-${i}`, '2026-08-12'))
    )

    const body = await (await GET()).json()

    expect(body.posts).toHaveLength(5)
  })

  it('corta as tags em cinco', async () => {
    getAllPosts.mockReturnValue([post('recente', '2026-08-12')])

    const body = await (await GET()).json()

    expect(body.posts[0].tags).toHaveLength(5)
  })

  it('monta a URL absoluta do post', async () => {
    getAllPosts.mockReturnValue([post('recente', '2026-08-12')])

    const body = await (await GET()).json()

    expect(body.posts[0].url).toBe('https://www.baxijen.com.br/blog/recente')
  })
})

describe('campaignId', () => {
  it('é null quando não houve publicação na semana', async () => {
    // É o sinal que impede o envio de um digest vazio.
    getAllPosts.mockReturnValue([])

    const body = await (await GET()).json()

    expect(body.campaignId).toBeNull()
    expect(body.posts).toEqual([])
  })

  it('é estável para o mesmo conjunto de posts', async () => {
    getAllPosts.mockReturnValue([post('a', '2026-08-12'), post('b', '2026-08-13')])

    const primeiro = await (await GET()).json()
    const segundo = await (await GET()).json()

    expect(primeiro.campaignId).toBe(segundo.campaignId)
    expect(primeiro.campaignId).toMatch(/^weekly-[0-9a-f]{24}$/)
  })

  it('muda quando entra post novo', async () => {
    getAllPosts.mockReturnValue([post('a', '2026-08-12')])
    const antes = await (await GET()).json()

    getAllPosts.mockReturnValue([post('a', '2026-08-12'), post('b', '2026-08-13')])
    const depois = await (await GET()).json()

    expect(depois.campaignId).not.toBe(antes.campaignId)
  })
})

describe('resposta', () => {
  it('não é cacheável', async () => {
    getAllPosts.mockReturnValue([])

    const res = await GET()

    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  it('declara a janela usada', async () => {
    getAllPosts.mockReturnValue([])

    const body = await (await GET()).json()

    expect(body.periodDays).toBe(7)
    expect(body.generatedAt).toBe(AGORA.toISOString())
  })
})
