"use client";

import { BlogPost } from "@/lib/blog";

export function BlogMarkdown({ post }: { post: BlogPost }) {
  // Simple markdown-to-HTML for blog content
  // Using react-markdown is already a dependency
  const ReactMarkdown =
    require("react-markdown").default;

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
      <ReactMarkdown>{post.content}</ReactMarkdown>
    </div>
  );
}