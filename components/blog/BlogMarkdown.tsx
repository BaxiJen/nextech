"use client";

import { BlogPost } from "@/lib/blog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function BlogMarkdown({ post }: { post: BlogPost }) {
  return (
    <div className="blog-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
    </div>
  );
}