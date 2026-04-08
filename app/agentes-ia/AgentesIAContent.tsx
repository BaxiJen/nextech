'use client';

import React from 'react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { IceBlockCard } from '@/components/IceBlockCard';
import { FrostTransition } from '@/components/FrostTransition';
import { Bot, MessageSquare, Brain, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const featureItems = [
  'Linguagem Natural (NLP) avançada.',
  'Treinado com os dados da sua empresa.',
  'Capacidade de agendamento e consultoria.',
  'Integração com APIs e bancos de dados externos.',
];

export function AgentesIAContent() {
  return (
    <div className="py-20">
      <Container>
        {/* Hero with animated glow orb */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Animated glow orb — replaces Unsplash */}
          <motion.div
            className="order-2 lg:order-1 relative aspect-square rounded-2xl overflow-hidden border border-white/5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Pulsing glow background */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(0,229,255,0.15) 0%, rgba(124,77,255,0.08) 40%, transparent 70%)',
                animation: 'glow-pulse 4s infinite ease-in-out',
              }}
            />
            {/* Outer ring */}
            <div className="absolute inset-8 rounded-full border border-cyan-500/10 animate-pulse" />
            <div className="absolute inset-16 rounded-full border border-purple-500/8 animate-pulse" style={{ animationDelay: '0.5s' }} />
            {/* Center brain icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 rounded-3xl border border-cyan-500/20 backdrop-blur-md bg-white/5 flex items-center justify-center glow-pulse">
                <Brain className="h-14 w-14 text-cyan-400 animate-pulse" />
              </div>
            </div>
            {/* Floating label */}
            <div className="absolute top-6 left-6 flex items-center gap-3 text-foreground/80">
              <Brain className="h-6 w-6 animate-pulse text-cyan-400" />
              <span className="font-semibold tracking-wide text-sm">BaXi - AI</span>
            </div>
            {/* Decorative dots */}
            <div className="absolute bottom-8 right-8 w-2 h-2 rounded-full bg-cyan-400/40 animate-pulse" />
            <div className="absolute bottom-12 right-12 w-1.5 h-1.5 rounded-full bg-purple-400/30 animate-pulse" style={{ animationDelay: '1s' }} />
          </motion.div>

          <motion.div
            className="order-1 lg:order-2 space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Frost glass badge */}
            <motion.div
              className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-md border-cyan-500/20 bg-cyan-500/5 text-cyan-400"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Inteligência Artificial Generativa
            </motion.div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Agentes de WhatsApp</h1>
            <p className="text-lg text-muted-foreground">
              Não é apenas um bot. É um agente inteligente que entende o contexto, responde como humano e fecha vendas no seu WhatsApp.
            </p>
            <div className="space-y-4">
              {featureItems.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                >
                  <Sparkles className="h-5 w-5 text-primary shrink-0" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
            <div className="pt-4">
              <Link href="https://wa.me/5521933009048" target="_blank">
                <Button size="lg" className="flex gap-2">
                  <MessageSquare className="h-5 w-5" /> Contratar Agente
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Quote section — glassmorphism with cyan border glow */}
        <FrostTransition>
          <motion.div
            className="rounded-3xl p-8 md:p-12 mb-20 text-center"
            style={{
              background: 'rgba(0,229,255,0.03)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0,229,255,0.15)',
              boxShadow: '0 0 40px rgba(0,229,255,0.06)',
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold italic">&quot;O fim dos menus infinitos. O começo do diálogo inteligente.&quot;</h2>
              <p className="text-muted-foreground">
                Nossos agentes utilizam modelos de linguagem de última geração para garantir que seu cliente nunca receba uma resposta genérica ou irrelevante.
              </p>
            </div>
          </motion.div>
        </FrostTransition>

        {/* Feature cards */}
        <FrostTransition>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <IceBlockCard
                title="Agentes de WhatsApp"
                description="Empatia e clareza nas respostas, mantendo o tom de voz da sua marca em todas as interações."
                href="/agentes-ia"
                icon={Bot}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <IceBlockCard
                title="Chatbots Oficiais"
                description="O agente evolui a cada conversa, tornando-se cada vez mais eficiente no seu processo de venda."
                href="/agentes-ia"
                icon={Sparkles}
              />
            </motion.div>
          </div>
        </FrostTransition>
      </Container>
    </div>
  );
}