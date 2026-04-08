'use client';

import React from 'react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { IceBlockCard } from '@/components/IceBlockCard';
import { FrostTransition } from '@/components/FrostTransition';
import { Zap, Layout, Globe, Bot, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const checklistItems = [
  'Carregamento instantâneo para melhor SEO.',
  'Chatbot de captura de contatos integrado.',
  'Hospedagem inclusa e certificado SSL.',
  'Totalmente responsivo e otimizado para mobile.',
];

export function SitesExpressContent() {
  return (
    <div className="py-20">
      <Container>
        {/* Hero with browser mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Animated badge */}
            <motion.div
              className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-md border-primary/20 bg-background/50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Entrega em até 7 dias
            </motion.div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Sites Estáticos Express</h1>
            <p className="text-lg text-muted-foreground">
              Sua empresa online com velocidade máxima, segurança total e um chatbot inteligente integrado para capturar leads 24h.
            </p>
            <div className="space-y-4">
              {checklistItems.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                >
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
            <div className="pt-4">
              <Link href="https://wa.me/5521933009048" target="_blank">
                <Button size="lg">Solicitar meu Site</Button>
              </Link>
            </div>
          </motion.div>

          {/* CSS Browser Mockup — replaces Unsplash */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ boxShadow: '0 0 40px rgba(0,229,255,0.08)' }}>
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
                <div className="flex-1 mx-4">
                  <div className="h-6 rounded-md bg-white/5 border border-white/5 px-3 flex items-center">
                    <span className="text-[10px] text-muted-foreground font-mono">baxijen.tech</span>
                  </div>
                </div>
              </div>
              {/* Browser content area */}
              <div className="aspect-video bg-gradient-to-br from-background via-primary/5 to-cyan-500/5 relative p-6">
                {/* Fake navbar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-primary/30" />
                    <div className="h-2 w-16 bg-white/10 rounded" />
                  </div>
                  <div className="flex gap-3">
                    <div className="h-2 w-12 bg-white/5 rounded" />
                    <div className="h-2 w-12 bg-white/5 rounded" />
                    <div className="h-2 w-12 bg-white/5 rounded" />
                  </div>
                </div>
                {/* Fake hero */}
                <div className="space-y-3 mb-8">
                  <div className="h-3 w-3/4 bg-white/8 rounded" />
                  <div className="h-3 w-1/2 bg-white/5 rounded" />
                  <div className="h-8 w-32 bg-primary/20 rounded-lg mt-4" />
                </div>
                {/* Fake cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-16 bg-white/3 rounded-lg border border-white/5" />
                  <div className="h-16 bg-white/3 rounded-lg border border-white/5" />
                  <div className="h-16 bg-white/3 rounded-lg border border-white/5" />
                </div>

                {/* Chatbot overlay — frost glass mini-card */}
                <div
                  className="absolute bottom-4 right-4 p-4 rounded-xl border max-w-[200px]"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(12px)',
                    borderColor: 'rgba(0,229,255,0.15)',
                    boxShadow: '0 0 20px rgba(0,229,255,0.08)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2 text-primary font-bold text-xs uppercase">
                    <Bot className="h-4 w-4" /> Chatbot Ativo
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">&quot;Olá! Gostaria de um orçamento para seu novo site?&quot;</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <FrostTransition>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <IceBlockCard
                title="Sites Express"
                description="Sites estáticos são imbatíveis em velocidade, garantindo a melhor experiência ao usuário."
                href="/sites-express"
                icon={Zap}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <IceBlockCard
                title="Agentes de WhatsApp"
                description="Interface limpa, moderna e profissional alinhada à identidade da sua marca."
                href="/sites-express"
                icon={Layout}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <IceBlockCard
                title="Chatbots Oficiais"
                description="Otimização técnica rigorosa para que sua empresa apareça nas buscas."
                href="/sites-express"
                icon={Globe}
              />
            </motion.div>
          </div>
        </FrostTransition>
      </Container>
    </div>
  );
}