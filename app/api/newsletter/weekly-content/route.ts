import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/blog'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.baxijen.com.br'
const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const MAX_POSTS = 5

export async function GET() {
  const now = Date.now()
  const windowStart = now - WEEK_MS

  const posts = getAllPosts()
    .filter((post) => {
      const publishedAt = new Date(post.date).getTime()
      return Number.isFinite(publishedAt) && publishedAt > windowStart && publishedAt <= now
    })
    .slice(0, MAX_POSTS)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      tags: post.tags.slice(0, 5),
      url: new URL(`/blog/${post.slug}`, SITE_URL).toString(),
    }))

  const campaignId = posts.length
    ? `weekly-${createHash('sha256')
        .update(posts.map((post) => `${post.slug}:${post.date}`).join('|'))
        .digest('hex')
        .slice(0, 24)}`
    : null

  return NextResponse.json(
    {
      campaignId,
      generatedAt: new Date(now).toISOString(),
      periodDays: 7,
      posts,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
