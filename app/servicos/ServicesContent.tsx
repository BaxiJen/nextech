'use client';

import React from 'react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { IceBlockCard } from '@/components/IceBlockCard';
import { FrostTransition } from '@/components/FrostTransition';
import {
  Globe,
  MessageSquare,
  Layout,
  Smartphone,
  Search,
  Database,
  Zap,
  Bot,
  Cpu,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const services = [
  { title: 'BXat — Agente Completo', description: 'O cérebro da sua empresa. IA que centraliza informações, aprende e atende 24/7.', href: '/bxat', icon: Bot },
  { title: 'Agentes de WhatsApp', description: 'Agentes inteligentes com linguagem natural para vendas e suporte avançado.', href: '/bxat', icon: MessageSquare },
  { title: 'Sites Express', description: 'Site profissional ultra-rápido com chatbot integrado. Entrega em tempo recorde.', href: '/sites-express', icon: Zap },
  { title: 'Sistemas sob Medida', description: 'Criamos sistemas que se adaptam ao seu negócio. Soluções escaláveis e seguras.', href: '/sistemas-web', icon: Layout },
  { title: 'Chatbots Oficiais', description: 'Integração oficial com API do WhatsApp para automação de fluxos padrão.', href: '/chatbots-whatsapp', icon: MessageSquare },
  { title: 'Sites de Alta Performance', description: 'Landing pages e sites institucionais otimizados para máxima conversão.', href: '/', icon: Globe },
  { title: 'Sistemas de Gestão (ERP)', description: 'Dashboards e painéis administrativos para controle total da sua operação.', href: '/sistemas-web', icon: Database },
  { title: 'SEO e Visibilidade', description: 'Otimização técnica para garantir que sua empresa seja encontrada no Google.', href: '/', icon: Search },
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
            {/* Animated badge */}
            <motion.div
              className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-md border-primary/20 bg-background/50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="text-primary mr-2 font-bold">9</span> Soluções para sua empresa
            </motion.div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Nossos Serviços</h1>
            <p className="text-xl text-muted-foreground">
              Soluções completas para transformar a presença digital da sua empresa e otimizar processos internos.
            </p>
          </div>
          {/* Dark gradient hero visual — replaces Unsplash */}
          <div className="relative h-[250px] lg:h-[300px] w-full rounded-2xl overflow-hidden border border-white/5">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-cyan-500/10" />
            {/* Decorative glow orbs */}
            <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-primary/15 blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-primary/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-cyan-500/5" />
            {/* Center icon cluster */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl border border-white/10 backdrop-blur-md bg-white/5 flex items-center justify-center">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 rounded-lg border border-cyan-500/20 backdrop-blur-sm bg-cyan-500/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 rounded-lg border border-purple-500/20 backdrop-blur-sm bg-purple-500/10 flex items-center justify-center">
                  <Layout className="h-4 w-4 text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Service Cards */}
        <FrostTransition>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <IceBlockCard
                  title={service.title}
                  description={service.description}
                  href={service.href}
                  icon={service.icon}
                />
              </motion.div>
            ))}
          </div>
        </FrostTransition>

        {/* CTA */}
        <FrostTransition>
          <motion.div
            className="mt-20 rounded-2xl p-8 md:p-12 text-center frost-glass"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">Precisa de uma solução sob medida?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Nossa equipe técnica está pronta para analisar seu projeto e propor a melhor arquitetura.
            </p>
            <Link href="/contato">
              <Button size="lg">Entrar em Contato</Button>
            </Link>
          </motion.div>
        </FrostTransition>
      </Container>
    </div>
  );
}