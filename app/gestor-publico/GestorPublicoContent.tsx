'use client';

import React, { useState } from 'react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { CheckCircle2, ArrowRight, Building2, FileSearch, Shield, Clock, Brain, Sparkles, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const beneficios = [
  { icon: FileSearch, title: 'Licitações em segundos', desc: 'Pergunte sobre edital, TR, modalidade. A IA responde com base na legislação atualizada.' },
  { icon: Shield, title: 'Transparência automática', desc: 'Gere relatórios de prestação de contas, receita e despesa no formato que o TCE exige.' },
  { icon: Clock, title: 'MGI sem dor de cabeça', desc: 'Preencha indicadores, entenda portarias e acompanhe prazos do Ministério da Gestão.' },
  { icon: Building2, title: 'Diário Oficial inteligente', desc: 'Busque portarias, decretos e publicações por assunto, data ou órgão em segundos.' },
  { icon: Brain, title: 'Memória institucional', desc: 'A IA aprende as normas do seu município e responde como um servidor experiente.' },
  { icon: CheckCircle2, title: 'LGPD compliant', desc: 'Dados no Brasil, criptografia ponta a ponta, auditoria completa de cada interação.' },
];

const perguntas = [
  '"Qual a modalidade de licitação pra obra de R$ 800mil?"',
  '"Gere o relatório de transparência do 1º quadrimestre"',
  '"Quais indicadores do MGI estão atrasados?"',
  '"Busque portarias sobre IPTU publicadas em março"',
];

export function GestorPublicoContent() {
  const [formData, setFormData] = useState({ nome: '', email: '', cargo: '', orgao: '', telefone: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/leads/fake-door', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'gestor-publico',
          test_id: 'A',
        }),
      });

      if (!res.ok) throw new Error('Erro ao enviar');

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
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium border-primary/20 bg-primary/5 text-primary">
              <Sparkles className="h-4 w-4 mr-2" /> Fake Door Test — Solicite acesso antecipado
            </div>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl leading-tight" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>
              Seu órgão público merece
              <span className="block text-primary mt-2">um assistente inteligente.</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">
              O <strong>BXat</strong> é a IA que entende licitação, transparência, MGI e burocracia municipal. Converse em português, pergunte qualquer coisa, receba respostas com base na legislação e nos dados do seu órgão.
            </p>

            <div className="space-y-3 pt-2">
              {perguntas.map((p, i) => (
                <motion.div key={i} className="flex items-center gap-3 text-muted-foreground" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                  <ChevronDown className="h-4 w-4 text-primary rotate-[-90deg]" />
                  <span className="font-mono text-sm">{p}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* FORM */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="rounded-3xl p-8 md:p-10 buriti-card">
              {status === 'success' ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>Você está na fila!</h3>
                  <p className="text-muted-foreground">Vamos liberar acesso por ordem de inscrição. Você receberá um email quando o BXat estiver pronto para o seu órgão.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>Solicitar acesso antecipado</h3>
                  <p className="text-muted-foreground mb-6 text-sm">Gratuito para os primeiros 100 gestores. Sem compromisso.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nome completo</label>
                      <input required type="text" value={formData.nome} onChange={e => setFormData(s => ({ ...s, nome: e.target.value }))} className="w-full rounded-xl border border-primary/20 bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="João da Silva" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email corporativo</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData(s => ({ ...s, email: e.target.value }))} className="w-full rounded-xl border border-primary/20 bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="joao@prefeitura.gov.br" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Cargo</label>
                      <input required type="text" value={formData.cargo} onChange={e => setFormData(s => ({ ...s, cargo: e.target.value }))} className="w-full rounded-xl border border-primary/20 bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Secretário de Gestão, Auditor, Procurador..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Órgão / Município</label>
                      <input required type="text" value={formData.orgao} onChange={e => setFormData(s => ({ ...s, orgao: e.target.value }))} className="w-full rounded-xl border border-primary/20 bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Prefeitura de Niterói, TCE-RJ..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Telefone (opcional)</label>
                      <input type="tel" value={formData.telefone} onChange={e => setFormData(s => ({ ...s, telefone: e.target.value }))} className="w-full rounded-xl border border-primary/20 bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="(21) 9XXXX-XXXX" />
                    </div>
                    <Button type="submit" size="lg" className="w-full flex gap-2 h-14 text-lg mt-2 shadow-xl shadow-primary/25" disabled={status === 'loading'}>
                      {status === 'loading' ? 'Enviando...' : <>Quero acesso antecipado <ArrowRight className="h-5 w-5" /></>}
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground/60 mt-4 text-center">Seus dados são protegidos pela LGPD. Não compartilhamos com terceiros.</p>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* BENEFÍCIOS */}
        <div className="text-center mb-16">
          <div className="text-sm font-medium text-[#97c459] mb-3" style={{ fontFamily: 'var(--font-geist-mono)' }}>
            CAPACIDADES
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>O que o BXat faz pelo gestor público</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">De licitações a transparência, do MGI ao Diário Oficial. Um assistente que fala a sua língua.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {beneficios.map((b, i) => (
            <motion.div key={b.title} className="rounded-2xl p-6 buriti-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="w-12 h-12 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-center mb-4">
                <b.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">{b.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* PROVA SOCIAL */}
        <div className="rounded-3xl p-8 md:p-12 text-center mb-24 border border-primary/15" style={{ background: 'rgba(26,93,58,0.03)' }}>
          <p className="text-muted-foreground mb-2 text-sm">Já em uso por</p>
          <h3 className="text-4xl font-bold text-primary mb-2" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>CID/UFF</h3>
          <p className="text-muted-foreground max-w-xl mx-auto">O Centro de Inteligência em Dados da UFF já utiliza o BXat para gestão de projetos de inovação e atendimento interno.</p>
        </div>

        {/* CTA FINAL */}
        <div className="rounded-3xl p-8 md:p-16 text-center buriti-card">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>Gestão pública não precisa ser lenta.</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-lg">Solicite acesso e descubra como a IA pode transformar o atendimento no seu órgão.</p>
          <Button size="lg" className="flex gap-2 h-14 px-8 text-lg shadow-xl mx-auto" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Quero acesso antecipado <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </Container>
    </div>
  );
}