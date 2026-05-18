import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";

export const metadata: Metadata = {
  title: "Blog | BaXiJen",
  description:
    "Insights sobre IA soberana, agentes autônomos, tecnologia brasileira e inovação. Pesquisa, análise e reflexão direto de quem constrói.",
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
      <div className="mx-auto max-w-5xl px-4">
        {/* Hero */}
        <div className="mb-16 md:mb-20">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Blog
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Pesquisa, análise e reflexão sobre IA soberana, agentes autônomos
            e tecnologia brasileira. Direto de quem constrói.
          </p>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
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
          <div className="grid gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}