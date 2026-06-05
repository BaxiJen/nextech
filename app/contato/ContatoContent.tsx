'use client';

import React, { useState } from 'react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { FrostTransition } from '@/components/FrostTransition';
import { Mail, MessageCircle, Shield, Cpu, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const assuntos = [
  { value: '', label: 'Selecione o assunto...' },
  { value: 'agente-ia', label: 'Quero um agente de IA para minha empresa' },
  { value: 'bxat', label: 'Quero conhecer o BXat' },
  { value: 'soberania', label: 'Soberania de dados e infraestrutura' },
  { value: 'consultoria', label: 'Consultoria em IA / Diagnóstico' },
  { value: 'parceria', label: 'Parceria ou integração' },
  { value: 'outro', label: 'Outro' },
];

export function ContatoContent() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    empresa: '',
    cargo: '',
    telefone: '',
    assunto: '',
    mensagem: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/leads/fake-door', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          source: 'contato',
          test_id: 'D',
          empresa: formData.empresa,
          cargo: formData.cargo,
          telefone: formData.telefone,
          dor: `${formData.assunto} — ${formData.mensagem}`,
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
        {/* ====== HERO ====== */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-md border-primary/20 bg-background/50 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Cpu className="h-4 w-4 mr-2 text-primary" /> Fale com a BaXiJen
          </motion.div>

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
            Seus dados no Brasil.
            <span className="block text-primary mt-2">IA que resolve de verdade.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Conte qual é o desafio da sua empresa. A gente responde em até 24 horas com uma proposta personalizada — sem pressão, sem automação genérica.
          </p>
        </motion.div>

        {/* ====== FORM + INFO ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* FORM — 3 cols */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {status === 'success' ? (
              <div
                className="rounded-3xl p-12 text-center border border-green-500/20"
                style={{ background: 'rgba(16,185,129,0.03)' }}
              >
                <div className="w-16 h-16 rounded-full border border-green-500/30 bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Mensagem enviada!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Recebemos seu contato. A equipe BaXiJen vai analisar e responder em até 24 horas no email ou WhatsApp informados.
                </p>
              </div>
            ) : (
              <div
                className="rounded-3xl p-8 md:p-10 border border-white/10 backdrop-blur-md"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold">Formulário de contato</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nome completo *</label>
                      <input
                        required
                        type="text"
                        value={formData.nome}
                        onChange={e => setFormData(s => ({ ...s, nome: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email *</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData(s => ({ ...s, email: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
                        placeholder="voce@empresa.com.br"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Empresa</label>
                      <input
                        type="text"
                        value={formData.empresa}
                        onChange={e => setFormData(s => ({ ...s, empresa: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
                        placeholder="Nome da empresa"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Cargo</label>
                      <input
                        type="text"
                        value={formData.cargo}
                        onChange={e => setFormData(s => ({ ...s, cargo: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
                        placeholder="Diretor, Gerente, Sócio..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">WhatsApp (opcional)</label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={e => setFormData(s => ({ ...s, telefone: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
                      placeholder="(21) 9XXXX-XXXX"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Assunto *</label>
                    <select
                      required
                      value={formData.assunto}
                      onChange={e => setFormData(s => ({ ...s, assunto: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground focus:border-primary/50 focus:outline-none"
                    >
                      {assuntos.map(a => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Descreva seu desafio *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.mensagem}
                      onChange={e => setFormData(s => ({ ...s, mensagem: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none resize-none"
                      placeholder="Ex: Precisamos de um agente que atenda clientes no WhatsApp e consulte nosso ERP..."
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full flex gap-2 h-14 text-lg mt-2 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? 'Enviando...' : <>Enviar mensagem <ArrowRight className="h-5 w-5" /></>}
                  </Button>

                  <p className="text-xs text-muted-foreground/60 text-center">
                    Seus dados são protegidos pela LGPD. Não compartilhamos com terceiros.
                  </p>
                </form>
              </div>
            )}
          </motion.div>

          {/* SIDEBAR — 2 cols */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Soberania card */}
            <div
              className="rounded-2xl p-6 border border-primary/15 backdrop-blur-md"
              style={{ background: 'rgba(0,229,255,0.03)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold">Soberania de dados</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nossos modelos rodam em infraestrutura brasileira. Nenhum dado sensível sai do país. LGPD compliant por arquitetura, não por adesivo.
              </p>
            </div>

            {/* Email card */}
            <div
              className="rounded-2xl p-6 border border-white/5 backdrop-blur-md"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-bold">Email</h3>
                  <a href="mailto:contato@baxi.ia.br" className="text-sm text-primary hover:underline">
                    contato@baxi.ia.br
                  </a>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/60">
                Tempo médio de resposta: até 24 horas em dias úteis.
              </p>
            </div>

            {/* WhatsApp card */}
            <div
              className="rounded-2xl p-6 border border-white/5 backdrop-blur-md"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold">WhatsApp</h3>
                  <a href="https://wa.me/5521933009048" target="_blank" className="text-sm text-primary hover:underline">
                    (21) 93300-9048
                  </a>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/60">
                Preferência para PMEs e atendimento rápido. Empresas e órgãos públicos podem preferir o formulário.
              </p>
            </div>

            {/* Localização */}
            <div
              className="rounded-2xl p-6 border border-white/5 backdrop-blur-md"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <p className="text-xs text-muted-foreground/60">
                <span className="text-primary font-semibold">巴西人</span> BaXiJen® — Atendimento nacional, escritório remoto.
              </p>
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}