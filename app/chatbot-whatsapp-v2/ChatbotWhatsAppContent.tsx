'use client';

import React, { useState } from 'react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { CheckCircle2, ArrowRight, MessageSquare, Zap, Clock, Users, TrendingUp, Brain, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: MessageSquare, title: 'WhatsApp nativo', desc: 'Seus clientes já usam. Seu bot já responde. Sem app novo, sem fricção.' },
  { icon: Brain, title: 'IA que aprende', desc: 'Não segue script. Entende contexto, pergunta de volta, e melhora a cada conversa.' },
  { icon: Clock, title: '24/7 sem fila', desc: 'Responde em segundos, qualifica leads, agenda visitas. Enquanto você dorme.' },
  { icon: TrendingUp, title: 'Converte mais', desc: 'Reduz abandono de carrinho, recupera vendas perdidas e qualifica automaticamente.' },
  { icon: Users, title: 'Sem código', desc: 'Configure em 5 minutos. Descreva seu negócio, a IA já sabe atender.' },
  { icon: Zap, title: 'Setup instantâneo', desc: 'Conecte seu WhatsApp, descreva o que vende, pronto. Seu bot já está no ar.' },
];

const steps = [
  { num: '1', title: 'Conecte o WhatsApp', desc: 'Escaneie o QR Code e pronto.' },
  { num: '2', title: 'Descreva seu negócio', desc: '"Vendo roupas masculinas no Rio, atendimento rápido, frete grátis acima de R$200."' },
  { num: '3', title: 'Seu bot já atende', desc: 'Em 5 minutos, seu cliente já recebe resposta inteligente.' },
];

export function ChatbotWhatsAppContent() {
  const [formData, setFormData] = useState({ nome: '', email: '', empresa: '', segmento: '', whatsapp: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/leads/fake-door', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source: 'chatbot-whatsapp', test_id: 'B' }),
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
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-md border-green-500/20 bg-green-500/5 text-green-400">
              <Sparkles className="h-4 w-4 mr-2" /> Fake Door Test — Lista de espera
            </div>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl leading-tight">
              Chatbot WhatsApp com IA.
              <span className="block text-primary mt-2">Em 5 minutos, sem código.</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Seus clientes mandam mensagem no WhatsApp. O <strong>BXat</strong> responde, qualifica e converte. IA que aprende seu negócio e atende 24/7 como um vendedor que nunca dorme.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {['🟢', '🟢', '🟢', '🟢', '🟢'].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-green-500/20 flex items-center justify-center text-xs">👤</div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">+50 empresas na fila de espera</span>
            </div>
          </motion.div>

          {/* FORM */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="rounded-3xl p-8 md:p-10 border border-green-500/15 backdrop-blur-md" style={{ background: 'rgba(16,185,129,0.03)' }}>
              {status === 'success' ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full border border-green-500/30 bg-green-500/10 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold">Na fila de espera!</h3>
                  <p className="text-muted-foreground">Você receberá um email quando o chatbot estiver disponível. Os primeiros da fila ganham acesso grátis por 30 dias.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-2">Entrar na lista de espera</h3>
                  <p className="text-muted-foreground mb-6 text-sm">Gratuito por 30 dias para os primeiros 100 inscritos.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Seu nome</label>
                      <input required type="text" value={formData.nome} onChange={e => setFormData(s => ({ ...s, nome: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-green-500/50 focus:outline-none" placeholder="Maria Santos" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData(s => ({ ...s, email: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-green-500/50 focus:outline-none" placeholder="maria@empresa.com.br" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nome da empresa</label>
                      <input required type="text" value={formData.empresa} onChange={e => setFormData(s => ({ ...s, empresa: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-green-500/50 focus:outline-none" placeholder="Loja XYZ" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Segmento</label>
                      <select required value={formData.segmento} onChange={e => setFormData(s => ({ ...s, segmento: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground focus:border-green-500/50 focus:outline-none">
                        <option value="">Selecione...</option>
                        <option value="moda">Moda e Vestuário</option>
                        <option value="alimentacao">Alimentação</option>
                        <option value="saude">Saúde e Beleza</option>
                        <option value="servicos">Serviços</option>
                        <option value="educacao">Educação</option>
                        <option value="imobiliaria">Imobiliária</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">WhatsApp (opcional)</label>
                      <input type="tel" value={formData.whatsapp} onChange={e => setFormData(s => ({ ...s, whatsapp: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-green-500/50 focus:outline-none" placeholder="(21) 9XXXX-XXXX" />
                    </div>
                    <Button type="submit" size="lg" className="w-full flex gap-2 h-14 text-lg mt-2 bg-green-600 hover:bg-green-500 shadow-xl shadow-green-500/25" disabled={status === 'loading'}>
                      {status === 'loading' ? 'Enviando...' : <>Quero testar grátis <ArrowRight className="h-5 w-5" /></>}
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground/60 mt-4 text-center">Sem compromisso. Cancele quando quiser.</p>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* COMO FUNCIONA */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">3 passos. 5 minutos.</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Sem código, sem complexidade.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {steps.map((s, i) => (
            <motion.div key={s.num} className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
              <div className="w-16 h-16 rounded-2xl border border-green-500/20 bg-green-500/5 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-green-400">{s.num}</div>
              <h3 className="text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* FEATURES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {features.map((f, i) => (
            <motion.div key={f.title} className="rounded-2xl p-6 border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="w-12 h-12 rounded-xl border border-green-500/20 bg-green-500/5 flex items-center justify-center mb-4">
                <f.icon className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA FINAL */}
        <div className="rounded-3xl p-8 md:p-16 text-center" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(37,99,235,0.05) 100%)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Seus clientes já estão no WhatsApp.</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-lg">Eles mandam mensagem. Quem responde?</p>
          <Button size="lg" className="flex gap-2 h-14 px-8 text-lg shadow-xl mx-auto bg-green-600 hover:bg-green-500" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Entrar na lista de espera <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </Container>
    </div>
  );
}