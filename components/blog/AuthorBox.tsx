"use client";

import Image from "next/image";
import { findTeamMemberByName } from "@/lib/teamMembers";
import { track } from "@/lib/analytics";

export function AuthorBox({ author, authorRole }: { author: string; authorRole?: string }) {
  const membro = findTeamMemberByName(author);
  if (!membro) return null;

  return (
    <aside
      aria-label="Sobre o autor"
      className="mt-12 flex flex-col gap-5 rounded-2xl p-6 sm:flex-row sm:items-center buriti-card"
    >
      <Image
        src={membro.photo}
        alt={`Foto de ${membro.name}`}
        width={80}
        height={80}
        className="h-20 w-20 shrink-0 rounded-full object-cover border border-primary/20"
      />
      <div className="flex-1">
        <div className="text-xs font-medium text-[#97c459] mb-1" style={{ fontFamily: "var(--font-geist-mono)" }}>
          QUEM ESCREVEU
        </div>
        <p className="text-lg font-semibold" style={{ fontFamily: "var(--font-newsreader, serif)" }}>
          {membro.name}
        </p>
        <p className="text-sm text-muted-foreground">{authorRole || membro.headline}</p>
      </div>
      <a
        href={membro.linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("clique_seguir_autor", { autor: membro.id })}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        Seguir no LinkedIn
      </a>
    </aside>
  );
}
