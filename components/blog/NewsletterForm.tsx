"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Check, Loader2, Mail } from "lucide-react";

interface SignupResponse {
  error?: string;
  already_subscribed?: boolean;
}

type FormStatus = "idle" | "loading" | "success" | "error";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [successTitle, setSuccessTitle] = useState("Confirme sua inscrição");
  const [successMessage, setSuccessMessage] = useState(
    "Enviamos um link de confirmação para seu email."
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const confirmation = params.get("confirmed");
    const unsubscribed = params.get("unsubscribed");

    if (unsubscribed === "true") {
      setSuccessTitle("Descadastro concluído");
      setSuccessMessage(
        "Seu email foi removido do resumo semanal. Você pode se inscrever novamente quando quiser."
      );
      setStatus("success");
    } else if (unsubscribed === "error" || unsubscribed === "missing") {
      setErrorMsg(
        "Não foi possível concluir o descadastro com esse link. Entre em contato com a BaXiJen."
      );
      setStatus("error");
    } else if (confirmation === "true") {
      setSuccessTitle("Inscrição confirmada!");
      setSuccessMessage(
        "Pronto — seu email está na lista do resumo semanal da BaXiJen."
      );
      setStatus("success");
    } else if (confirmation === "error" || confirmation === "missing") {
      setErrorMsg(
        "Não foi possível confirmar esse link. Solicite uma nova inscrição abaixo."
      );
      setStatus("error");
    }
  }, []);

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

      const data = await res.json() as SignupResponse;

      if (!res.ok) {
        throw new Error(data.error || "Erro ao inscrever");
      }

      if (data.already_subscribed) {
        setSuccessTitle("Você já está na lista");
        setSuccessMessage(
          "Esse email já está confirmado para receber o resumo semanal da BaXiJen."
        );
      } else {
        setSuccessTitle("Confirme sua inscrição");
        setSuccessMessage(
          "Enviamos um link para seu email. Depois da confirmação, você estará na lista semanal."
        );
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
      <div className="rounded-2xl p-8 md:p-10 text-center buriti-card" aria-live="polite">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
          <Check className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: "var(--font-newsreader, serif)" }}>
          {successTitle}
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {successMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-8 md:p-10 buriti-card">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase mb-1">
              Newsletter semanal
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: "var(--font-newsreader, serif)" }}>
              Os posts da semana, direto no seu email
            </h2>
          </div>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 text-primary" />
          No máximo 1 email por semana
        </div>
      </div>

      <p className="text-muted-foreground mb-6 leading-relaxed max-w-3xl">
        Receba em um único resumo os novos artigos sobre IA soberana, agentes autônomos e produto. Se não houver publicação nova, não enviamos nada.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-3 md:grid-cols-[1fr_1.4fr_auto]">
          <label className="sr-only" htmlFor="newsletter-name">Nome (opcional)</label>
          <input
            id="newsletter-name"
            type="text"
            placeholder="Nome (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="rounded-lg border border-primary/20 bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40"
          />
          <label className="sr-only" htmlFor="newsletter-email">Email</label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="rounded-lg border border-primary/20 bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Inscrevendo...
              </>
            ) : (
              "Quero receber"
            )}
          </button>
        </div>
        {status === "error" && (
          <p className="text-sm text-red-400" role="alert">{errorMsg}</p>
        )}
        <p className="text-xs text-muted-foreground">
          A inscrição só é ativada após a confirmação por email. Dados protegidos pela LGPD.
        </p>
      </form>
    </div>
  );
}
