'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { BuritiCard } from '@/components/BuritiCard';
import { ProcessTimeline } from '@/components/ProcessTimeline';
import {
  Cpu,
  Bot
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const faqs = [
    { q: "Meus dados ficam no Brasil?", a: "Sim. Nossos modelos rodam em infraestrutura brasileira. Nenhum dado sensível sai do país. Soberania de dados não é promessa, é arquitetura." },
    { q: "O agente de IA funciona 24 horas?", a: "Sim! Nossos agentes de IA funcionam ininterruptamente, atendendo e qualificando seus contatos mesmo enquanto você dorme." },
    { q: "Qual a diferença entre o BXat e um chatbot comum?", a: "Chatbots comuns seguem árvores de decisão pré-programadas e travam quando o cliente sai do roteiro. O BXat entende linguagem natural, lembra o histórico de cada conversa, consulta seus sistemas em tempo real (CRM, planilhas, estoque) e toma decisões com autonomia. Em vez de perguntas e respostas fixas, ele raciocina e age como um atendente humano treinado." },
    { q: "Posso integrar com meus sistemas?", a: "Com certeza. O BXat conecta via API com CRMs, planilhas, bancos de dados e qualquer sistema que sua empresa já utiliza." },
    { q: "Como começar?", a: "Fale com a gente pelo WhatsApp ou pelo formulário de contato. Entendemos sua dor e configuramos um agente personalizado para seu negócio." }
  ];

  return (
    <>
      {/* ====== HERO SECTION ====== */}
      <section className="relative py-24 md:py-40 min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background z-10" />

        <Container className="relative z-20">
          <motion.div
            className="flex flex-col items-center text-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Eyebrow */}
            <motion.p
              className="text-sm font-mono uppercase tracking-[0.15em]"
              style={{ color: '#97c459', fontFamily: 'var(--font-geist-mono)' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Soberania de Dados
            </motion.p>

            {/* Headline — Newsreader serif */}
            <h1
              className="text-5xl md:text-7xl max-w-5xl leading-[1.05]"
              style={{
                fontFamily: 'var(--font-newsreader)',
                fontWeight: 500,
                letterSpacing: '-0.035em',
                color: 'var(--foreground)',
              }}
            >
              IA que pensa, lembra e resolve.
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-foreground/70 max-w-2xl" style={{ fontFamily: 'var(--font-geist-sans)' }}>
              Agentes autônomos para empresas brasileiras. Dados no Brasil. Decisões em tempo real.
            </p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Link href="/contato">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                  Falar com a BaXiJen
                </Button>
              </Link>
              <Link href="/bxat">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg">
                  Conhecer o BXat
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* ====== SERVICES ====== */}
      <section className="py-20">
        <Container>
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className="text-3xl md:text-4xl mb-4"
              style={{
                fontFamily: 'var(--font-newsreader)',
                fontWeight: 500,
                letterSpacing: '-0.025em',
              }}
            >
              IA soberana para negócios brasileiros
            </h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Agentes que pensam, lembram e evoluem. Seus dados ficam no Brasil.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <BuritiCard
              title="BXat — Agente de IA Completo"
              description="O cérebro da sua empresa. IA que centraliza informações, aprende com cada interação e atende 24/7. Soberania de dados garantida."
              href="/bxat"
              icon={Cpu}
            />
            <BuritiCard
              title="Agentes de WhatsApp"
              description="IA generativa para atendimento humano e conversacional 24/7. Direto no WhatsApp do seu cliente."
              href="/agentes-ia"
              icon={Bot}
            />
          </div>
        </Container>
      </section>

      {/* ====== PROCESS TIMELINE ====== */}
      <section className="py-20">
        <Container>
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl mb-4"
              style={{
                fontFamily: 'var(--font-newsreader)',
                fontWeight: 500,
                letterSpacing: '-0.025em',
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Como Funciona
            </motion.h2>
            <motion.p
              className="text-foreground/70 max-w-2xl mx-auto"
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

      {/* ====== FAQ ====== */}
      <section className="py-20">
        <Container>
          <div className="max-w-3xl mx-auto">
            <motion.h2
              className="text-3xl md:text-4xl text-center mb-12"
              style={{
                fontFamily: 'var(--font-newsreader)',
                fontWeight: 500,
                letterSpacing: '-0.025em',
              }}
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
                  className="group p-6 rounded-2xl transition-all duration-300 cursor-default"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  whileHover={{
                    borderColor: 'rgba(26,93,58,0.3)',
                    boxShadow: '0 0 20px rgba(26,93,58,0.06)',
                  }}
                >
                  <h3 className="text-lg font-bold mb-2 flex gap-3 text-foreground">
                    <span className="font-mono" style={{ color: '#97c459' }}>?</span> {faq.q}
                  </h3>
                  <p className="text-foreground/70 text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ====== CTA FINAL ====== */}
      <section className="py-20 border-t relative overflow-hidden">
        {/* Subtle green gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(26,93,58,0.03), rgba(26,93,58,0.05), rgba(26,93,58,0.02))',
          }}
        />
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <motion.h2
              className="text-3xl md:text-5xl"
              style={{
                fontFamily: 'var(--font-newsreader)',
                fontWeight: 500,
                letterSpacing: '-0.025em',
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Comece hoje
            </motion.h2>
            <motion.p
              className="text-lg text-foreground/70 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Fale com a gente e descubra como um agente de IA pode transformar seu atendimento.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <a
                href="https://wa.me/5521933009048"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                  Falar no WhatsApp
                </Button>
              </a>
              <a
                href="mailto:contato@baxi.ia.br"
              >
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg">
                  Enviar e-mail
                </Button>
              </a>
            </motion.div>
          </div>
        </Container>
      </section>
    </>
  );
}