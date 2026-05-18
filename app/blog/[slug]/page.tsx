import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { getPostBySlug, getPostSlugs } from "@/lib/blog";
import { BlogMarkdown } from "@/components/blog/BlogMarkdown";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { NewsletterForm } from "@/components/blog/NewsletterForm";

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post não encontrado | BaXiJen" };

  return {
    title: `${post.title} | BaXiJen Blog`,
    description: post.description,
    authors: [{ name: post.author }],
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: post.image
        ? [
            {
              url: post.image,
              width: 1200,
              height: 630,
              alt: post.imageAlt || post.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const formattedDate = new Date(post.date).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="py-12 md:py-20">
      <div className="mx-auto max-w-2xl px-4">
        {/* Back link */}
        <Link
          href="/blog"
          className="mb-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao blog
        </Link>

        {/* Cover image */}
        {post.image && (
          <div className="relative aspect-[2/1] rounded-2xl overflow-hidden mb-10 shadow-lg">
            <Image
              src={post.image}
              alt={post.imageAlt || post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-tight mb-6">
            {post.title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
            {post.description}
          </p>

          {/* Author + meta bar */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground border-t border-b py-4">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{post.author}</span>
              {post.authorRole && (
                <span className="text-muted-foreground">({post.authorRole})</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={post.date}>{formattedDate}</time>
            </div>
            {post.readTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{post.readTime}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:border-primary/50 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <BlogMarkdown post={post} />

        {/* Share buttons */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t pt-6">
          <span className="text-sm text-muted-foreground">Compartilhar:</span>
          <ShareButtons title={post.title} slug={slug} description={post.description} />
        </div>

        {/* Separator */}
        <hr className="my-12 border-border" />

        {/* Footer CTA */}
        <div className="rounded-2xl border bg-gradient-to-br from-card to-muted/50 p-8 md:p-10">
          <h3 className="text-xl font-semibold mb-2">
            Quer construir IA soberana?
          </h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Fale com a BaXiJen e descubra como agentes autônomos podem
            transformar sua operação.
          </p>
          <Link
            href="/contato"
            className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Fale conosco
          </Link>
        </div>

        {/* Newsletter */}
        <div className="mt-12">
          <NewsletterForm />
        </div>
      </div>
    </article>
  );
}