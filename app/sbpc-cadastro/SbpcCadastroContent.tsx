'use client';

import React, { useState, useEffect } from 'react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { Mail, User, Building2, Briefcase, ArrowRight, CheckCircle2, Sparkles, CalendarPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const profissoes = [
  { value: '', label: 'Selecione...' },
  { value: 'professor', label: 'Professor(a)' },
  { value: 'pesquisador', label: 'Pesquisador(a)' },
  { value: 'empreendedor', label: 'Empreendedor(a)' },
  { value: 'empresario', label: 'Empresário(a)' },
  { value: 'prestador_servicos', label: 'Prestador(a) de Serviços' },
  { value: 'gestor_publico', label: 'Gestor(a) Público(a)' },
  { value: 'estudante_graduacao', label: 'Estudante de Graduação' },
  { value: 'estudante_pos', label: 'Estudante de Pós-graduação' },
  { value: 'consultor', label: 'Consultor(a)' },
  { value: 'investidor', label: 'Investidor(a)' },
  { value: 'jornalista', label: 'Jornalista / Comunicação' },
  { value: 'ti_profissional', label: 'Profissional de TI / Dados' },
  { value: 'advogado', label: 'Advogado(a)' },
  { value: 'engenheiro', label: 'Engenheiro(a)' },
  { value: 'medico', label: 'Profissional da Saúde' },
  { value: 'outro', label: 'Outro' },
];

// Evento SBPC 2026 para o botão "Adicionar ao calendário"
const SBPC_EVENT = {
  title: 'SBPC 2026 — Reunião Anual da Sociedade Brasileira para o Progresso da Ciência',
  description: 'BaXi × Zhipu AI — Pré-registro confirmado. Experiência integrada com a BaXi durante o evento.',
  location: 'Universidade Federal Fluminense (UFF), Campus Gragoatá, Niterói, RJ',
  startDate: '2026-07-26',
  endDate: '2026-08-01',
};

function generateICalLink() {
  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BaXiJen//SBPC 2026//PT',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@baxijen.com.br`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${SBPC_EVENT.startDate.replace(/-/g, '')}`,
    `DTEND:${SBPC_EVENT.endDate.replace(/-/g, '')}`,
    `SUMMARY:${SBPC_EVENT.title}`,
    `DESCRIPTION:${SBPC_EVENT.description}`,
    `LOCATION:${SBPC_EVENT.location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}

function generateGoogleCalendarLink() {
  const fmt = (d: string) => d.replace(/-/g, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: SBPC_EVENT.title,
    dates: `${fmt(SBPC_EVENT.startDate)}/${fmt(SBPC_EVENT.endDate)}`,
    details: SBPC_EVENT.description,
    location: SBPC_EVENT.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function SbpcCadastroContent() {
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    sobrenome: '',
    profissao: '',
    instituicao: '',
    contato_zhipu: true, // já marcado por padrão
    novidades_baxi: false,
    termos: false,
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Esconde o widget LiveAgent nesta página
  useEffect(() => {
    document.body.classList.add('hide-live-agent');
    return () => {
      document.body.classList.remove('hide-live-agent');
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const payload = {
      email: formData.email,
      nome: formData.nome,
      sobrenome: formData.sobrenome,
      profissao: formData.profissao,
      instituicao: formData.instituicao || null,
      contato_zhipu: formData.contato_zhipu,
      novidades_baxi: formData.novidades_baxi,
      termos_aceitos: formData.termos,
      timestamp: new Date().toISOString(),
      evento: 'sbpc_2026',
      parceria: 'baxi_zhipu',
    };

    try {
      const res = await fetch('/api/cadastro-sbpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erro ao enviar');
      }

      // Backup local também
      const cadastros = JSON.parse(localStorage.getItem('cadastros_sbpc') || '[]');
      cadastros.push(payload);
      localStorage.setItem('cadastros_sbpc', JSON.stringify(cadastros));

      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="py-20">
        <Container>
          <motion.div
            className="max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="rounded-3xl p-12 text-center border border-green-500/20"
              style={{ background: 'rgba(16,185,129,0.03)' }}
            >
              <div className="w-16 h-16 rounded-full border border-green-500/30 bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Pré-registro confirmado!</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-2">
                {formData.nome} {formData.sobrenome}, seu cadastro foi realizado com sucesso.
              </p>
              <p className="text-sm text-muted-foreground/70 max-w-md mx-auto mb-8">
                Bem-vindo(a) à SBPC 2026! Em breve você poderá conversar com a IA BaXi ao vivo.
              </p>

              {/* Botão adicionar ao calendário */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={generateGoogleCalendarLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-primary/30 bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Adicionar ao Google Calendar
                </a>
                <a
                  href={generateICalLink()}
                  download="sbpc-2026.ics"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Adicionar ao Outlook / Apple
                </a>
              </div>
            </div>
          </motion.div>
        </Container>
      </div>
    );
  }

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
          {/* Botão "Adicionar ao calendário" */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <a
              href={generateGoogleCalendarLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-md border-primary/20 bg-background/50 hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <CalendarPlus className="h-4 w-4 text-primary" />
              SBPC 2026 · Niterói, RJ · 26/07 a 01/08
            </a>
          </motion.div>

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
            Pré-registro para a SBPC 2026
            <span className="block text-primary mt-2">BaXi + Zhipu AI</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Cadastre-se e tenha uma experiência integrada com a BaXi durante o evento.
          </p>
        </motion.div>

        {/* ====== FORM ====== */}
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div
              className="rounded-3xl p-8 md:p-10 border border-white/10 backdrop-blur-md"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">Cadastro rápido</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* E-mail */}
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    E-mail <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))}
                      required
                      placeholder="seu@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Nome + Sobrenome */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Nome <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
                      <input
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData((s) => ({ ...s, nome: e.target.value }))}
                        required
                        placeholder="Maria"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Sobrenome <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      name="sobrenome"
                      value={formData.sobrenome}
                      onChange={(e) => setFormData((s) => ({ ...s, sobrenome: e.target.value }))}
                      required
                      placeholder="Silva"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Profissão */}
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Profissão <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 pointer-events-none" />
                    <select
                      name="profissao"
                      value={formData.profissao}
                      onChange={(e) => setFormData((s) => ({ ...s, profissao: e.target.value }))}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground focus:border-primary/50 focus:outline-none transition-colors appearance-none cursor-pointer"
                    >
                      {profissoes.map((p) => (
                        <option key={p.value} value={p.value} className="bg-background text-foreground">
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Empresa/Instituição */}
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Empresa / Instituição
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
                    <input
                      type="text"
                      name="instituicao"
                      value={formData.instituicao}
                      onChange={(e) => setFormData((s) => ({ ...s, instituicao: e.target.value }))}
                      placeholder="Ex: UFF, Petrobras, Minha Startup..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* === TERMOS === */}
                <div className="space-y-3 pt-2">
                  {/* a) Contato comercial Zhipu (já marcado) */}
                  <div
                    className="flex items-start gap-3 p-4 rounded-xl border border-white/10"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <input
                      type="checkbox"
                      name="contato_zhipu"
                      id="contato_zhipu"
                      checked={formData.contato_zhipu}
                      onChange={(e) => setFormData((s) => ({ ...s, contato_zhipu: e.target.checked }))}
                      className="mt-1 accent-primary cursor-pointer"
                    />
                    <label
                      htmlFor="contato_zhipu"
                      className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                    >
                      <strong className="text-foreground">
                        Tenho interesse em receber contato comercial da Zhipu
                      </strong>
                      <br />
                      A Zhipu AI é parceira da BaXiJen e uma das líderes mundiais em inteligência artificial. Ao marcar esta opção, você autoriza o compartilhamento do seu e-mail e perfil com a Zhipu para contato comercial e oportunidades relacionadas a IA.
                    </label>
                  </div>

                  {/* b) Novidades BaXiJen */}
                  <div
                    className="flex items-start gap-3 p-4 rounded-xl border border-white/10"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <input
                      type="checkbox"
                      name="novidades_baxi"
                      id="novidades_baxi"
                      checked={formData.novidades_baxi}
                      onChange={(e) => setFormData((s) => ({ ...s, novidades_baxi: e.target.checked }))}
                      className="mt-1 accent-primary cursor-pointer"
                    />
                    <label
                      htmlFor="novidades_baxi"
                      className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                    >
                      <strong className="text-foreground">
                        Aceito receber novidades da BaXiJen
                      </strong>
                      <br />
                      Conteúdos, lançamentos e atualizações sobre nossos produtos e serviços.
                    </label>
                  </div>

                  {/* c) Termos e condições */}
                  <div
                    className="flex items-start gap-3 p-4 rounded-xl border border-white/10"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <input
                      type="checkbox"
                      name="termos"
                      id="termos"
                      checked={formData.termos}
                      onChange={(e) => setFormData((s) => ({ ...s, termos: e.target.checked }))}
                      required
                      className="mt-1 accent-primary cursor-pointer"
                    />
                    <label
                      htmlFor="termos"
                      className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                    >
                      <strong className="text-foreground">
                        Aceito os termos e condições da BaXiJen
                      </strong>
                      <br />
                      Ao continuar, você concorda com nossos{' '}
                      <a
                        href="/privacy"
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        Termos de Uso e Política de Privacidade
                      </a>
                      . Seus dados são tratados em conformidade com a LGPD e não serão vendidos a terceiros.
                    </label>
                  </div>
                </div>

                {/* Aviso: termos obrigatórios */}
                {!formData.termos && (
                  <p className="text-xs text-muted-foreground/50 text-center">
                    Você precisa aceitar os termos e condições da BaXiJen para continuar.
                  </p>
                )}

                {/* Submit — bloqueado até aceitar os termos */}
                <Button
                  type="submit"
                  size="lg"
                  className={`w-full flex gap-2 h-14 text-lg mt-2 transition-all ${
                    formData.termos
                      ? 'shadow-xl shadow-primary/25 hover:shadow-primary/40'
                      : 'opacity-40 cursor-not-allowed shadow-none'
                  }`}
                  disabled={status === 'loading' || !formData.termos}
                >
                  {status === 'loading' ? (
                    'Enviando...'
                  ) : (
                    <>
                      Cadastrar <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>

                {status === 'error' && (
                  <p className="text-sm text-red-400 text-center">
                    Algo deu errado. Tente novamente ou entre em contato via
                    contato@baxi.ia.br
                  </p>
                )}

                <p className="text-xs text-muted-foreground/60 text-center">
                  Seus dados são protegidos pela LGPD. Não compartilhamos com terceiros sem autorização.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}