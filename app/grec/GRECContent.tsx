'use client';

import React from 'react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { ShieldCheck, BarChart3, AlertTriangle, TrendingUp, Eye, FileText } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Eye,
    title: 'Monitoramento contínuo',
    desc: 'Vigilância de menções, sentimentos e sinais de risco em múltiplas fontes. Detecção precoce de crises antes que escalonem.',
  },
  {
    icon: BarChart3,
    title: 'Análises em tempo real',
    desc: 'Dashboards e indicadores de reputação institutional. Saiba exatamente como sua organização é percebida agora — não ontem.',
  },
  {
    icon: AlertTriangle,
    title: 'Alertas preditivos',
    desc: 'Previsões baseadas em IA que antecipam cenários de crise. Tempo de reação é o que separa um incidente de um desastre.',
  },
  {
    icon: FileText,
    title: 'Relatórios automatizados',
    desc: 'Relatórios de exposição, impacto e resposta gerados automaticamente. Prontos para diretoria, stakeholders e órgãos de controle.',
  },
  {
    icon: TrendingUp,
    title: 'Recuperação de reputação',
    desc: 'Estratégias de recomposição de imagem baseadas em dados. Mede o efetivo retorno das ações de comunicação e relacionamento.',
  },
  {
    icon: ShieldCheck,
    title: 'Agente de IA integrado',
    desc: 'O agente GREC conversa, responde e orienta sua equipe em tempo real. Não é um dashboard estático — é um assessor ativo 24/7.',
  },
];

export function GRECContent() {
  return (
    <div className="py-20">
      <Container>
        {/* Hero */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium mb-6 border-primary/20 bg-primary/5" style={{ fontFamily: 'var(--font-geist-mono)' }}>
              <span className="text-[#97c459] mr-2 font-bold">01</span> Proteção Institucional
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>
              GREC
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Gestão de Reputações e Crises.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Um agente de IA integrado ao sistema GREC que entrega análises, relatórios e previsões para proteção de reputação institucional. Em produção, com maturidade tecnológica comprovada.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contato">
                <Button size="lg">Solicitar Demonstração</Button>
              </Link>
              <Link href="/servicos">
                <Button variant="outline" size="lg">Ver Todos os Serviços</Button>
              </Link>
            </div>
          </div>

          {/* Visual */}
          <motion.div
            className="relative h-[300px] lg:h-[350px] w-full rounded-2xl overflow-hidden border border-primary/10"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-primary/5" />
            <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-primary/10 blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-[#97c459]/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Shield central */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-center">
                  <ShieldCheck className="h-12 w-12 text-primary" />
                </div>
                {/* Pulsing rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-primary/10 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border border-primary/5" />
              </div>
            </div>

            {/* Floating indicators */}
            <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 border border-primary/15">
              <div className="w-2 h-2 rounded-full bg-[#97c459] animate-pulse" />
              <span className="text-xs font-mono text-muted-foreground">Monitorando</span>
            </div>
            <div className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 border border-primary/15">
              <AlertTriangle className="h-3 w-3 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">Previsão 24h</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Features grid */}
        <div className="mb-20">
          <motion.h2
            className="text-3xl md:text-4xl mb-4 text-center"
            style={{ fontFamily: 'var(--font-newsreader, serif)', fontWeight: 500, letterSpacing: '-0.025em' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            O que o GREC faz
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-center max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Não é apenas monitoramento. É um agente de IA que pensa, prevê e orienta sua equipe em tempo real.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="group p-8 rounded-2xl transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(26,93,58,0.2)',
                  borderRadius: '16px',
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{
                  borderColor: 'rgba(26,93,58,0.5)',
                  boxShadow: '0 0 24px rgba(26,93,58,0.12)',
                }}
              >
                <div
                  className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{
                    background: 'rgba(26,93,58,0.12)',
                    border: '1px solid rgba(26,93,58,0.15)',
                  }}
                >
                  <feature.icon className="h-7 w-7" style={{ color: '#97c459' }} />
                </div>
                <h3 className="text-lg font-medium mb-3 text-foreground" style={{ fontFamily: 'var(--font-geist-sans)', fontWeight: 500 }}>
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Como funciona */}
        <motion.div
          className="mb-20 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl mb-6" style={{ fontFamily: 'var(--font-newsreader, serif)', fontWeight: 500 }}>
            Como o agente GREC funciona
          </h2>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              O GREC integra monitoramento de fontes diversas — mídia, redes sociais, registros institucionais — com um agente de IA que analisa padrões, identifica riscos emergentes e gera relatórios acionáveis. Não é uma ferramenta passiva: o agente conversa com sua equipe, sugere respostas e antecipa cenários.
            </p>
            <p>
              Em produção com maturidade tecnológica comprovada (TRL 9), o sistema já opera em ambientes reais, processando dados sensíveis com soberania de informação. Cada interação alimenta a base de conhecimento do agente, tornando-o mais preciso na detecção de padrões de crise específicos do seu contexto institucional.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="rounded-2xl p-8 md:p-12 text-center"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(26,93,58,0.2)',
            borderRadius: '16px',
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>
            Proteja sua reputação antes que vire crise
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Agende uma demonstração e veja o GREC operando com dados do seu contexto institucional.
          </p>
          <Link href="/contato">
            <Button size="lg">Solicitar Demonstração</Button>
          </Link>
        </motion.div>
      </Container>
    </div>
  );
}