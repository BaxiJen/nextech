"use client";

import { BlogPost } from "@/lib/blog";
import ReactMarkdown from "react-markdown";

export function BlogMarkdown({ post }: { post: BlogPost }) {
  return (
    <div className="blog-content">
      <ReactMarkdown>{post.content}</ReactMarkdown>
    </div>
  );
}