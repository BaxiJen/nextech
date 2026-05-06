'use client';

import React, { useState } from 'react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { CheckCircle2, ArrowRight, FileText, Calculator, Building, Receipt, Scale, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const problemas = [
  { icon: FileText, title: 'FGTS e e-CAC', desc: '"ComoConsulto saldo do FGTS?" "Preciso do e-CAC, como acesso?" — pergunte e receba o passo a passo.' },
  { icon: Calculator, title: 'Impostos e guias', desc: 'DCTF, SPED, GIA, DARF. A IA explica qual guia, quando entregar e como preencher.' },
  { icon: Building, title: 'CNPJ e abertura', desc: '"Quais os tipos de CNPJ?" "Mei ou LTDA?" — respostas claras para quem tá começando.' },
  { icon: Receipt, title: 'Notas e tributos', desc: 'ISS, ICMS, PIS, COFINS. Qual incide? Qual a alíquota? Pergunte em português.' },
  { icon: Scale, title: 'Contratos e CLT', desc: '"Posso demitir no período de experiência?" "13º proporcional como calcula?" — respostas com base na legislação.' },
  { icon: CheckCircle2, title: 'O que falta entregar', desc: '"O que eu preciso entregar este mês?" A IA cruza seu CNAE com o calendário e diz o que falta.' },
];

export function PMEContent() {
  const [formData, setFormData] = useState({ nome: '', email: '', empresa: '', porte: '', dor: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/leads/fake-door', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source: 'pme', test_id: 'C' }),
      });
      if (!res.ok) throw new Error('Erro');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="py-20">
      <Container>
        {/* HERO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <motion.div className="space-y-6" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-md border-amber-500/20 bg-amber-500/5 text-amber-400">
              <Sparkles className="h-4 w-4 mr-2" /> Fake Door Test — Validação de demanda
            </div>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl leading-tight">
              Burocracia brasileira?
              <span className="block text-primary mt-2">Converse com a IA.</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">
              FGTS, CNPJ, e-CAC, DCTF, impostos, guias, prazos. Sua empresa tem dúvidas que levariam horas de contador. O <strong>BXat</strong> responde em segundos.
            </p>
          </motion.div>

          {/* FORM */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="rounded-3xl p-8 md:p-10 border border-amber-500/15 backdrop-blur-md" style={{ background: 'rgba(245,158,11,0.03)' }}>
              {status === 'success' ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full border border-amber-500/30 bg-amber-500/10 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-amber-400" />
                  </div>
                  <h3 className="text-2xl font-bold">Cadastro realizado!</h3>
                  <p className="text-muted-foreground">Você será um dos primeiros a testar o assistente de burocracia para PMEs. Enquanto isso, já pode usar o BXat gratuito em baxi.ia.br.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-2">Quero ser beta tester</h3>
                  <p className="text-muted-foreground mb-6 text-sm">Gratuito para os primeiros 200 inscritos. Conte qual é sua maior dor que a gente prioriza.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Seu nome</label>
                      <input required type="text" value={formData.nome} onChange={e => setFormData(s => ({ ...s, nome: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-amber-500/50 focus:outline-none" placeholder="Carlos Oliveira" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData(s => ({ ...s, email: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-amber-500/50 focus:outline-none" placeholder="carlos@minhaempresa.com.br" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nome da empresa</label>
                      <input type="text" value={formData.empresa} onChange={e => setFormData(s => ({ ...s, empresa: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-amber-500/50 focus:outline-none" placeholder="Minha Empresa LTDA" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Porte</label>
                      <select required value={formData.porte} onChange={e => setFormData(s => ({ ...s, porte: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground focus:border-amber-500/50 focus:outline-none">
                        <option value="">Selecione...</option>
                        <option value="mei">MEI</option>
                        <option value="me">Microempresa (ME)</option>
                        <option value="pme">PME</option>
                        <option value="media">Média empresa</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Sua maior dor burocrática</label>
                      <textarea required value={formData.dor} onChange={e => setFormData(s => ({ ...s, dor: e.target.value }))} rows={3} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-amber-500/50 focus:outline-none resize-none" placeholder="Ex: 'Nunca sei o que entregar na Receita no mês' ou 'Contratar demorado e confuso'" />
                    </div>
                    <Button type="submit" size="lg" className="w-full flex gap-2 h-14 text-lg mt-2 bg-amber-600 hover:bg-amber-500 shadow-xl shadow-amber-500/25" disabled={status === 'loading'}>
                      {status === 'loading' ? 'Enviando...' : <>Quero ser beta tester <ArrowRight className="h-5 w-5" /></>}
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground/60 mt-4 text-center">Zero spam. Apenas 1 email quando o produto estiver pronto.</p>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* PROBLEMAS */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">A burocracia que todo empreendedor enfrenta</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">O BXat já sabe o caminho. Pergunte em português e receba respostas com base na legislação.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {problemas.map((p, i) => (
            <motion.div key={p.title} className="rounded-2xl p-6 border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="w-12 h-12 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-center mb-4">
                <p.icon className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">{p.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA FINAL */}
        <div className="rounded-3xl p-8 md:p-16 text-center" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(124,77,255,0.05) 100%)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Empreendedor não deveria precisar de contador pra perguntar.</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-lg">O BXat responde burocracia em português, com base na legislação. Seja beta tester.</p>
          <Button size="lg" className="flex gap-2 h-14 px-8 text-lg shadow-xl mx-auto bg-amber-600 hover:bg-amber-500" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Quero ser beta tester <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </Container>
    </div>
  );
}