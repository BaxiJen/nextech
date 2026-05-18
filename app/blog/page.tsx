import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";

export const metadata: Metadata = {
  title: "Blog | BaXiJen",
  description:
    "Insights sobre IA soberana, agentes autônomos, tecnologia brasileira e inovação. Conteúdo técnico e estratégico da BaXiJen.",
  openGraph: {
    title: "Blog | BaXiJen",
    description:
      "Insights sobre IA soberana, agentes autônomos e tecnologia brasileira.",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="py-16 md:py-24">
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Blog BaXiJen
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          IA soberana, agentes autônomos e tecnologia brasileira. Pensamento
          técnico e estratégico direto de quem constrói.
        </p>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="mx-auto max-w-3xl text-center py-16">
          <p className="text-muted-foreground">
            Em breve, novos artigos por aqui.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-primary hover:underline"
          >
            Voltar ao início
          </Link>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}