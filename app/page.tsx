'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { TypeWriter } from '@/components/TypeWriter';
import { IceBlockCard } from '@/components/IceBlockCard';
import { ProcessTimeline } from '@/components/ProcessTimeline';
import { MorphParticles } from '@/components/MorphParticles';
import { FrostTransition } from '@/components/FrostTransition';
import { CTAExplosion } from '@/components/CTAExplosion';
import {
  Globe,
  MessageSquare,
  Layout,
  Settings,
  ShieldCheck,
  Zap,
  BarChart,
  Bot,
  Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';

// Dynamic import for 3D scene (SSR disabled)
const HeroScene = dynamic(
  () => import('@/components/three/HeroScene').then((mod) => ({ default: mod.HeroScene })),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-muted/30" /> }
);

// Check if device can handle WebGL
function canUseWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

// Static hero fallback for low-end devices
function StaticHero() {
  return (
    <div className="absolute inset-0 z-0">
      {/* Gradient background with subtle animated pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-muted/30" />
      {/* Decorative floating elements */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/5 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-cyan-500/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-primary/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-cyan-500/5" />
    </div>
  );
}

export default function Home() {
  const [use3D, setUse3D] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUse3D(canUseWebGL());
  }, []);

  const faqs = [
    { q: "Quanto tempo demora para meu site ficar pronto?", a: "No serviço 'Sites Express', entregamos em até 72 horas. Projetos de sistemas complexos podem levar de 2 a 8 semanas, dependendo da necessidade." },
    { q: "O agente de IA funciona 24 horas?", a: "Sim! Nossos agentes baseados em OpenAI funcionam ininterruptamente, atendendo e qualificando seus contatos mesmo enquanto você dorme." },
    { q: "Vocês cuidam da hospedagem?", a: "Sim. Nossas soluções de sites estáticos já incluem 1 ano de hospedagem gratuita com certificado SSL." },
    { q: "Como funciona a manutenção dos sistemas?", a: "Oferecemos pacotes mensais de suporte e evolução para garantir que seu sistema Django ou Next.js esteja sempre atualizado e seguro." },
    { q: "Posso integrar o chatbot com meu sistema atual?", a: "Com certeza. Nossas automações podem ser conectadas via API com CRMs, Planilhas Google ou qualquer software que você já utilize." }
  ];

  return (
    <>
      {/* ====== HERO SECTION ====== */}
      <section className="relative py-24 md:py-40 overflow-hidden bg-background min-h-[80vh] flex items-center">
        {/* 3D Scene or Static Fallback */}
        {mounted && use3D ? <HeroScene /> : <StaticHero />}

        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background z-10" />

        <Container className="relative z-20">
          <motion.div
            className="flex flex-col items-center text-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-md border-primary/20 bg-background/50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="text-primary mr-2 font-bold">巴西人</span> Tecnologia inteligente feita no Brasil
            </motion.div>

            {/* Main heading with TypeWriter */}
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-5xl font-sans leading-[1.1]">
              <TypeWriter
                text="Inovação e tecnologia para transformar seu negócio"
                className="text-foreground"
                speed={50}
              />
            </h1>

            {/* CTA Buttons with glow */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Link href="https://wa.me/5521933009048" target="_blank">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                  Falar no WhatsApp
                </Button>
              </Link>
              <Link href="/servicos">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg backdrop-blur-sm">
                  Ver Serviços
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* ====== SERVICES (ICE BLOCKS) ====== */}
      <FrostTransition>
        <section className="py-20 bg-muted/30">
          <Container>
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4 font-sans">Serviços Principais</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Soluções tecnológicas focadas em resultados reais e eficiência operacional.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <IceBlockCard
                title="BXat — Agente Completo"
                description="O cérebro da sua empresa. IA que centraliza tudo, aprende e atende 24/7. Powered by OpenClaw."
                href="/bxat"
                icon={Cpu}
              />
              <IceBlockCard
                title="Sites Express"
                description="Site profissional ultra-rápido com chatbot integrado. Entrega em tempo recorde para seu negócio."
                href="/sites-express"
                icon={Zap}
              />
              <IceBlockCard
                title="Agentes de WhatsApp"
                description="IA generativa para atendimento humano e conversacional 24/7 sem scripts engessados."
                href="/agentes-ia"
                icon={Bot}
              />
              <IceBlockCard
                title="Chatbots Oficiais"
                description="Integração com API do WhatsApp para automação de vendas e suporte inteligente."
                href="/chatbots-whatsapp"
                icon={MessageSquare}
              />
              <IceBlockCard
                title="Sistemas sob Medida"
                description="Backend robusto e interfaces modernas para gerenciar seu negócio com total controle."
                href="/sistemas-web"
                icon={Layout}
              />
            </div>
          </Container>
        </section>
      </FrostTransition>

      {/* ====== PROCESS TIMELINE (CRYSTAL GROWTH) ====== */}
      <FrostTransition>
        <section className="py-20">
          <Container>
            <div className="text-center mb-16">
              <motion.h2
                className="text-3xl font-bold tracking-tight md:text-4xl mb-4 font-sans"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Como Funciona
              </motion.h2>
              <motion.p
                className="text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Nosso processo é direto e focado na entrega de valor contínuo para o seu negócio.
              </motion.p>
            </div>
            <ProcessTimeline />
          </Container>
        </section>
      </FrostTransition>

      {/* ====== DIFFERENTIALS (MORPH PARTICLES) ====== */}
      <FrostTransition>
        <section className="py-20 bg-muted/50">
          <Container>
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4 font-sans">Por que escolher a BaXiJen?</h2>
            </motion.div>
            <MorphParticles />
          </Container>
        </section>
      </FrostTransition>

      {/* ====== FAQ (FROST GLASS) ====== */}
      <FrostTransition>
        <section className="py-20">
          <Container>
            <div className="max-w-3xl mx-auto">
              <motion.h2
                className="text-3xl font-bold tracking-tight text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Perguntas Frequentes
              </motion.h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <motion.div
                    key={i}
                    className="group p-6 rounded-2xl transition-all duration-300 cursor-default backdrop-blur-sm"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    whileHover={{
                      background: 'rgba(0,229,255,0.03)',
                      borderColor: 'rgba(0,229,255,0.15)',
                      boxShadow: '0 0 20px rgba(0,229,255,0.05)',
                    }}
                  >
                    <h3 className="text-lg font-bold mb-2 flex gap-3 text-foreground">
                      <span className="text-primary font-mono">?</span> {faq.q}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </FrostTransition>

      {/* ====== CTA (EXPLOSION) ====== */}
      <CTAExplosion />
    </>
  );
}