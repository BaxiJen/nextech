"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao inscrever");
      }

      setStatus("success");
      setEmail("");
      setName("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erro ao inscrever. Tente novamente.");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border bg-gradient-to-br from-card to-muted/50 p-8 md:p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Inscrito!</h3>
        <p className="text-muted-foreground">
          Confira seu email para confirmar a inscrição. Conteúdo técnico sobre IA, soberania e produto chega toda semana.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-gradient-to-br from-card to-muted/50 p-8 md:p-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Newsletter BaXiJen</h3>
          <p className="text-sm text-muted-foreground">Conteúdo técnico sobre IA, soberania e produto.</p>
        </div>
      </div>

      <p className="text-muted-foreground mb-6 leading-relaxed">
        Análises com dados reais, papers acadêmicos e lições de produção. Sem spam, sem buzzword. Um email por semana.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Nome (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 rounded-lg border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Inscrevendo...
            </>
          ) : (
            "Inscrever-se"
          )}
        </button>
        {status === "error" && (
          <p className="text-sm text-red-400">{errorMsg}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Sem spam. Desinscreva a qualquer momento. Dados protegidos pela LGPD.
        </p>
      </form>
    </div>
  );
}