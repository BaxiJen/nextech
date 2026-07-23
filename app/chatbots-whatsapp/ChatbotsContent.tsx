'use client';

import React from 'react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { BuritiCard } from '@/components/BuritiCard';
import { Clock, Zap, Users, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const checklistItems = [
  'Atendimento 24 horas por dia, 7 dias por semana.',
  'Qualificação automática de leads antes do humano assumir.',
  'Integração direta com seu CRM ou Planilha.',
  'Respostas instantâneas e menus interativos.',
];

export function ChatbotsContent() {
  return (
    <div className="py-20">
      <Container>
        {/* Hero with CSS chat simulation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-sm font-medium text-[#97c459] mb-2" style={{ fontFamily: 'var(--font-geist-mono)' }}>
              WHATSAPP BUSINESS
            </div>
            <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>Chatbots para WhatsApp</h1>
            <p className="text-lg text-muted-foreground">
              Automatize seu atendimento, reduza o tempo de resposta e nunca mais perca uma oportunidade de venda.
            </p>
            <div className="space-y-4 pt-4">
              {checklistItems.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                >
                  <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
            <div className="pt-6">
              <Link href="https://wa.me/5521933009048" target="_blank">
                <Button size="lg">Quero uma Automação</Button>
              </Link>
            </div>
          </motion.div>

          {/* CSS Chat Simulation */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div
              className="relative aspect-square rounded-2xl overflow-hidden p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(26,93,58,0.05) 0%, rgba(151,196,89,0.05) 50%, rgba(26,93,58,0.03) 100%)',
                border: '1px solid rgba(26,93,58,0.15)',
              }}
            >
              {/* Chat header */}
              <div
                className="flex items-center gap-3 mb-6 p-3 rounded-xl border border-primary/15"
                style={{ background: 'rgba(26,93,58,0.05)' }}
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">BaXiJen Bot</div>
                  <div className="text-[10px] text-[#97c459]">Online</div>
                </div>
              </div>

              {/* Chat messages */}
              <div className="space-y-3">
                {/* Bot message — left */}
                <motion.div
                  className="max-w-[75%]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div
                    className="p-3 rounded-xl rounded-tl-sm text-sm border border-primary/15"
                    style={{ background: 'rgba(26,93,58,0.06)' }}
                  >
                    Olá! Como posso ajudar?
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-1 ml-1">10:32</div>
                </motion.div>

                {/* User message — right */}
                <motion.div
                  className="max-w-[75%] ml-auto"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  <div
                    className="p-3 rounded-xl rounded-tr-sm text-sm text-white"
                    style={{
                      background: 'rgba(26,93,58,0.25)',
                      border: '1px solid rgba(26,93,58,0.3)',
                    }}
                  >
                    Quero um orçamento para um site!
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-1 text-right mr-1">10:32</div>
                </motion.div>

                {/* Bot reply — left */}
                <motion.div
                  className="max-w-[80%]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.5 }}
                >
                  <div
                    className="p-3 rounded-xl rounded-tl-sm text-sm border border-primary/15"
                    style={{ background: 'rgba(151,196,89,0.08)' }}
                  >
                    <span className="font-semibold text-[#97c459]">BaXiJen Bot:</span> Ótimo! Vou conectar você com um especialista. Enquanto isso, qual tipo de projeto você tem em mente?
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-1 ml-1">10:33</div>
                </motion.div>

                {/* Typing indicator */}
                <motion.div
                  className="flex items-center gap-1 ml-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.2 }}
                >
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </motion.div>
              </div>

              {/* Input bar */}
              <div
                className="absolute bottom-6 left-6 right-6 p-3 rounded-xl flex items-center gap-2 border border-primary/15"
                style={{ background: 'rgba(26,93,58,0.05)' }}
              >
                <div className="flex-1 text-[11px] text-muted-foreground">Digite sua mensagem...</div>
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-[10px]">→</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <BuritiCard
              title="Chatbots Oficiais"
              description="Não deixe seu cliente esperando. O bot responde no ato conforme a sua regra."
              href="/chatbots-whatsapp"
              icon={Clock}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <BuritiCard
              title="Agentes de WhatsApp"
              description="Passe para o atendimento humano apenas o que já está qualificado."
              href="/chatbots-whatsapp"
              icon={Users}
            />
          </motion.div>
        </div>
      </Container>
    </div>
  );
}