import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/lib/blog";

export function BlogCard({ post }: { post: BlogPost }) {
  const formattedDate = new Date(post.date).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="group flex flex-col rounded-2xl border bg-card overflow-hidden transition-all hover:border-primary/40 hover:shadow-xl">
      {/* Cover image */}
      {post.image && (
        <Link
          href={`/blog/${post.slug}`}
          className="relative aspect-[16/10] overflow-hidden"
        >
          <Image
            src={post.image}
            alt={post.imageAlt || post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {post.featured && (
            <span className="absolute top-4 left-4 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
              Destaque
            </span>
          )}
        </Link>
      )}
      {!post.image && post.featured && (
        <div className="px-6 pt-6">
          <span className="inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Destaque
          </span>
        </div>
      )}
      <div className="flex flex-col flex-grow p-6 md:p-7">
        <h2 className="mb-3 text-xl font-semibold tracking-tight leading-snug group-hover:text-primary transition-colors">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="mb-5 text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-grow">
          {post.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-4 border-t">
          <span className="font-medium text-foreground">{post.author}</span>
          <span>·</span>
          <time dateTime={post.date}>{formattedDate}</time>
          {post.readTime && (
            <>
              <span>·</span>
              <span>{post.readTime}</span>
            </>
          )}
        </div>
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{post.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}