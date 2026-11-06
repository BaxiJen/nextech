"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics";

export function WorkspaceCta({ origem }: { origem: string }) {
  const href = `/contato?assunto=workspace-bxat&origem=${encodeURIComponent(origem)}`;

  return (
    <div className="rounded-2xl p-8 md:p-10 buriti-card">
      <div className="text-xs font-medium text-[#97c459] mb-3" style={{ fontFamily: "var(--font-geist-mono)" }}>
        WORKSPACE PRÓPRIO NO BXAT
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-newsreader, serif)" }}>
        Quer agentes assim trabalhando com o seu time?
      </h3>
      <p className="text-muted-foreground mb-6 leading-relaxed">
        O agente deste teste roda num workspace do BXat. A sua empresa pode ter o
        dela: desenhamos os agentes junto com vocês, ligados às ferramentas que o
        time já usa e, se fizer sentido, rodando num modelo aberto numa GPU de vocês.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href={href}
          onClick={() => track("clique_workspace_bxat", { origem })}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
        >
          Quero um workspace próprio <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/bxat#workspace"
          className="inline-flex items-center justify-center px-2 py-3 text-sm font-medium text-primary hover:underline"
        >
          Ver o que entra
        </Link>
      </div>
    </div>
  );
}
