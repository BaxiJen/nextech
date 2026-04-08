'use client';

import React from 'react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { IceBlockCard } from '@/components/IceBlockCard';
import { FrostTransition } from '@/components/FrostTransition';
import { Mail, MessageCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export function ContatoContent() {
  return (
    <div className="py-20">
      <Container>
        {/* Hero with dark gradient + glow orbs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            className="text-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold tracking-tight mb-4">Fale Conosco</h1>
            <p className="text-xl text-muted-foreground">
              Estamos prontos para ouvir seus desafios e propor a solução tecnológica ideal.
            </p>
          </motion.div>

          {/* Dark gradient visual — replaces Unsplash */}
          <motion.div
            className="relative h-[250px] lg:h-[300px] w-full rounded-2xl overflow-hidden border border-white/5"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-cyan-500/10" />
            {/* Decorative glow orbs */}
            <div className="absolute top-1/3 left-1/3 w-36 h-36 rounded-full bg-primary/10 blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-44 h-44 rounded-full bg-cyan-500/8 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
            {/* Connection lines */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-primary/15" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-cyan-500/8" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full border border-purple-500/5" />
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl border border-white/10 backdrop-blur-md bg-white/5 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Contact Info + CTA */}
        <FrostTransition>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Cards — IceBlockCards */}
            <div className="space-y-6">
              <motion.h2
                className="text-2xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Informações de Contato
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <IceBlockCard
                  title="WhatsApp"
                  description="+55 (21) 93300-9048"
                  href="https://wa.me/5521933009048"
                  icon={MessageCircle}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <IceBlockCard
                  title="E-mail"
                  description="nextmetal@gmail.com"
                  href="mailto:nextmetal@gmail.com"
                  icon={Mail}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <IceBlockCard
                  title="Localização"
                  description="Escritório Remoto — Atendimento Nacional"
                  href="#"
                  icon={MapPin}
                />
              </motion.div>
            </div>

            {/* CTA — glassmorphism card */}
            <motion.div
              className="flex flex-col items-center justify-center text-center space-y-6 p-8 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0,229,255,0.12)',
                boxShadow: '0 0 30px rgba(0,229,255,0.05)',
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold">Inicie seu projeto hoje</h2>
              <p className="text-muted-foreground">
                A forma mais rápida de falar conosco e obter um orçamento inicial é através do nosso WhatsApp oficial.
              </p>
              <a href="https://wa.me/5521933009048" target="_blank" className="w-full">
                <Button size="lg" className="w-full py-8 text-xl">
                  Abrir WhatsApp agora
                </Button>
              </a>
              <p className="text-xs text-muted-foreground">
                Tempo médio de resposta: menos de 1 hora em horário comercial.
              </p>
            </motion.div>
          </div>
        </FrostTransition>
      </Container>
    </div>
  );
}