import Link from "next/link";
import { BlogPost } from "@/lib/blog";

export function BlogCard({ post }: { post: BlogPost }) {
  const formattedDate = new Date(post.date).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="group flex flex-col rounded-2xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
      {post.featured && (
        <span className="mb-2 inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Destaque
        </span>
      )}
      <h2 className="mb-2 text-xl font-semibold tracking-tight group-hover:text-primary transition-colors">
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
        {post.description}
      </p>
      <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{post.author}</span>
          {post.authorRole && (
            <>
              <span>·</span>
              <span>{post.authorRole}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <time dateTime={post.date}>{formattedDate}</time>
          <span>·</span>
          <span>{post.readTime}</span>
        </div>
      </div>
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}