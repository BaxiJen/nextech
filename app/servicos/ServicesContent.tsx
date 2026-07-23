'use client';

import React from 'react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { BuritiCard } from '@/components/BuritiCard';
import {
  MessageSquare,
  Smartphone,
  Zap,
  Bot,
  Cpu,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const services = [
  { title: 'BXat — Agente Completo', description: 'O cérebro da sua empresa. IA que centraliza informações, aprende e atende 24/7. Powered by BaXi.', href: '/bxat', icon: Bot },
  { title: 'Agentes de WhatsApp', description: 'Agentes inteligentes com linguagem natural para vendas e suporte avançado.', href: '/bxat', icon: MessageSquare },
];

export function ServicesContent() {
  return (
    <div className="py-20">
      <Container>
        {/* Hero */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            {/* Eyebrow */}
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium mb-6 border-primary/20 bg-primary/5" style={{ fontFamily: 'var(--font-geist-mono)' }}>
              <span className="text-[#97c459] mr-2 font-bold">02</span> Soluções para sua empresa
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>Nossos Serviços</h1>
            <p className="text-xl text-muted-foreground">
              Soluções completas para transformar a presença digital da sua empresa e otimizar processos internos.
            </p>
          </div>
          {/* Hero visual */}
          <div className="relative h-[250px] lg:h-[300px] w-full rounded-2xl overflow-hidden border border-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/5" />
            <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-primary/15 blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-[#97c459]/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-primary/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-primary/5" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-center">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 rounded-lg border border-[#97c459]/20 bg-[#97c459]/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-[#97c459]" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-center">
                  <Cpu className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Service Cards */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <BuritiCard
                  title={service.title}
                  description={service.description}
                  href={service.href}
                  icon={service.icon}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className="mt-20 rounded-2xl p-8 md:p-12 text-center buriti-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>Precisa de uma solução sob medida?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Nossa equipe técnica está pronta para analisar seu projeto e propor a melhor arquitetura.
          </p>
          <Link href="/contato">
            <Button size="lg">Entrar em Contato</Button>
          </Link>
        </motion.div>
      </Container>
    </div>
  );
}