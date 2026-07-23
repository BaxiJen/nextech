'use client';

import React from 'react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { BuritiCard } from '@/components/BuritiCard';
import { Bot, Brain, Cpu, Eye, MessageSquare, Shield, Zap, BarChart, Users, Globe, Headphones, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const capabilities = [
  { icon: Brain, title: 'Compreensão Total', description: 'Entende o contexto do seu negócio, histórico de conversas e intenção do cliente como nenhum bot consegue.' },
  { icon: MessageSquare, title: 'Comunicação Humana', description: 'Responde de forma natural e empática, mantendo o tom de voz da sua marca em cada interação.' },
  { icon: BarChart, title: 'Inteligência Centralizada', description: 'Conecta-se aos seus sistemas — CRM, planilhas, banco de dados — e unifica as informações em um único ponto de contato.' },
  { icon: Shield, title: 'Segurança e Privacidade', description: 'Dados criptografados, controle total de acesso e conformidade com LGPD. Seus dados ficam no Brasil.' },
  { icon: Zap, title: 'Disponível 24/7', description: 'Nunca perde uma oportunidade. Atende, qualifica e converte mesmo fora do horário comercial.' },
  { icon: Eye, title: 'Aprendizado Contínuo', description: 'Cada conversa o torna mais inteligente. Evolui automaticamente com base nas interações reais do seu negócio.' },
];

const useCases = [
  { title: 'Vendas & Qualificação', description: 'Recebe leads, qualifica automaticamente e encaminha para o time certo. Converte mesmo enquanto você dorme.', icon: BarChart },
  { title: 'Suporte ao Cliente', description: 'Resolve dúvidas, acompanha pedidos e escalona problemas complexos, reduzindo o volume de tickets de suporte.', icon: Headphones },
  { title: 'Onboarding & Treinamento', description: 'Orienta novos clientes e funcionários de forma personalizada. Ninguém fica perdido.', icon: Users },
  { title: 'Gestão & Relatórios', description: 'Centraliza informações de múltiplos sistemas e gera insights acionáveis para decisões rápidas.', icon: Globe },
];

const differentials = [
  'Não é um chatbot comum — é um agente que raciocina, decide e age.',
  'Conecta WhatsApp, Email, Instagram e mais em um único cérebro.',
  'Memória de longo prazo: lembra de cada cliente e cada conversa.',
  'Personalizado para o seu negócio — não é genérico, é seu.',
  'Infraestrutura brasileira: baixa latência, dados protegidos, suporte em português.',
  'Evolui com seu negócio: quanto mais usa, mais inteligente fica.',
];

export function BXatContent() {
  return (
    <div className="py-20">
      <Container>
        {/* ====== HERO ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          {/* Visual */}
          <motion.div
            className="order-2 lg:order-1 relative aspect-square rounded-2xl overflow-hidden border border-primary/10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at 40% 50%, rgba(26,93,58,0.2) 0%, rgba(151,196,89,0.1) 35%, rgba(26,93,58,0.03) 60%, transparent 80%)',
              }}
            />
            {/* Orbital rings */}
            <div className="absolute inset-12 rounded-full border border-primary/10 animate-pulse" />
            <div className="absolute inset-20 rounded-full border border-[#97c459]/8 animate-pulse" style={{ animationDelay: '0.7s' }} />
            <div className="absolute inset-28 rounded-full border border-primary/5 animate-pulse" style={{ animationDelay: '1.4s' }} />
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-3xl border border-primary/20 bg-primary/5 flex items-center justify-center">
                <Cpu className="h-16 w-16 text-primary animate-pulse" />
              </div>
            </div>
            {/* Floating data points */}
            <div className="absolute top-8 right-8 flex items-center gap-2 text-xs font-mono text-[#97c459]/70">
              <div className="w-2 h-2 rounded-full bg-[#97c459]/40 animate-pulse" />
              <span>context: active</span>
            </div>
            <div className="absolute bottom-12 left-8 flex items-center gap-2 text-xs font-mono text-primary/70">
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <span>memory: persistent</span>
            </div>
            <div className="absolute top-1/3 left-6 flex items-center gap-2 text-xs font-mono text-[#97c459]/50">
              <div className="w-1.5 h-1.5 rounded-full bg-[#97c459]/30 animate-pulse" style={{ animationDelay: '1s' }} />
              <span>learning: continuous</span>
            </div>
            {/* Corner badge */}
            <div className="absolute top-6 left-6 flex items-center gap-3 text-foreground/80">
              <Cpu className="h-6 w-6 text-primary" />
              <span className="font-semibold tracking-wide text-sm">BXat — Agente Completo</span>
            </div>
          </motion.div>

          <motion.div
            className="order-1 lg:order-2 space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium border-primary/20 bg-primary/5 text-primary"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Sparkles className="h-4 w-4 mr-2" /> Powered by BaXi — A IA do Brasil
            </motion.div>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl leading-tight" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>
              Seu negócio, um único cérebro.
              <span className="block text-primary mt-2">Inteligência que centraliza tudo.</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">
              O <strong>BXat</strong> não é um chatbot. É um <strong>agente de IA completo</strong> que entende seu negócio, conecta todos os seus sistemas e conversa com seus clientes como um humano — 24 horas por dia, 7 dias por semana.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link href="/contato">
                <Button size="lg" className="flex gap-2 h-14 px-8 text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                  <MessageSquare className="h-5 w-5" /> Falar com a BaXiJen
                </Button>
              </Link>
              <Link href="https://baxi.ia.br" target="_blank" title="Ambiente de acesso ao BXat — cadastro necessário">
                <Button variant="outline" size="lg" className="flex gap-2 h-14 px-8 text-lg">
                  Conhecer o BXat <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ====== QUOTE SECTION ====== */}
        <motion.div
          className="rounded-3xl p-8 md:p-12 mb-24 text-center buriti-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold italic" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>&quot;Chega de ferramentas dispersas. Um agente. Um cérebro. Tudo centralizado.&quot;</h2>
            <p className="text-muted-foreground">
              Enquanto chatbots tradicionais seguem scripts rígidos, o BXat raciocina, aprende e age de forma autônoma — conectando WhatsApp, email, CRM e qualquer sistema que sua empresa já utiliza.
            </p>
          </div>
        </motion.div>

        {/* ====== CAPABILITIES GRID ====== */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-sm font-medium text-[#97c459] mb-3" style={{ fontFamily: 'var(--font-geist-mono)' }}>CAPACIDADES</div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>O que o BXat faz de diferente?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Mais do que automatizar respostas. O BXat centraliza informações, aprende com cada interação e toma decisões inteligentes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <BuritiCard
                title={cap.title}
                description={cap.description}
                href=""
                icon={cap.icon}
              />
            </motion.div>
          ))}
        </div>

        {/* ====== USE CASES ====== */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-sm font-medium text-[#97c459] mb-3" style={{ fontFamily: 'var(--font-geist-mono)' }}>APLICAÇÕES</div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>Onde o BXat brilha?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            De vendas a suporte, de onboarding a gestão — um agente que se adapta ao que seu negócio precisa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {useCases.map((uc, i) => (
            <motion.div
              key={uc.title}
              className="rounded-2xl p-8 buriti-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-center">
                  <uc.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{uc.title}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{uc.description}</p>
            </motion.div>
          ))}
        </div>

        {/* ====== DIFFERENTIALS ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-sm font-medium text-[#97c459] mb-3" style={{ fontFamily: 'var(--font-geist-mono)' }}>DIFERENCIAIS</div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>Por que o BXat é diferente?</h2>
            <p className="text-muted-foreground text-lg">
              Chatbots seguem scripts. O BXat <strong>pensa, lembra e evolui</strong>. É a diferença entre um atendente robótico e um parceiro de negócios inteligente.
            </p>
            <div className="space-y-4 pt-4">
              {differentials.map((diff, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground/90">{diff}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right side visual */}
          <motion.div
            className="relative rounded-2xl overflow-hidden border border-primary/10 aspect-square"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at 60% 50%, rgba(26,93,58,0.15) 0%, rgba(151,196,89,0.08) 40%, transparent 70%)',
              }}
            />
            {/* Central hub icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-center">
                  <Cpu className="h-12 w-12 text-primary" />
                </div>
                {/* Orbiting icons */}
                <div className="absolute -top-8 -left-8 w-10 h-10 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-center animate-pulse">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="absolute -top-8 -right-8 w-10 h-10 rounded-lg border border-[#97c459]/20 bg-[#97c459]/5 flex items-center justify-center animate-pulse" style={{ animationDelay: '0.5s' }}>
                  <BarChart className="h-5 w-5 text-[#97c459]" />
                </div>
                <div className="absolute -bottom-8 -left-8 w-10 h-10 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-center animate-pulse" style={{ animationDelay: '1s' }}>
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="absolute -bottom-8 -right-8 w-10 h-10 rounded-lg border border-[#97c459]/20 bg-[#97c459]/5 flex items-center justify-center animate-pulse" style={{ animationDelay: '1.5s' }}>
                  <Shield className="h-5 w-5 text-[#97c459]" />
                </div>
                {/* Connection lines */}
                <div className="absolute top-0 left-1/2 w-px h-8 bg-gradient-to-b from-primary/30 to-transparent" />
                <div className="absolute bottom-0 left-1/2 w-px h-8 bg-gradient-to-t from-primary/30 to-transparent" />
                <div className="absolute left-0 top-1/2 h-px w-8 bg-gradient-to-r from-primary/30 to-transparent" />
                <div className="absolute right-0 top-1/2 h-px w-8 bg-gradient-to-l from-primary/30 to-transparent" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ====== CTA ====== */}
        <motion.div
          className="rounded-3xl p-8 md:p-16 text-center buriti-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium border-primary/20 bg-primary/5 text-primary mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Sparkles className="h-4 w-4 mr-2" /> Pronto para transformar seu negócio?
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>Centralize. Automatize. Evolua.</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-lg">
            O BXat está pronto para ser o cérebro da sua empresa. Comece hoje mesmo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contato">
              <Button size="lg" className="flex gap-2 h-14 px-8 text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                <MessageSquare className="h-5 w-5" /> Falar com a BaXiJen
              </Button>
            </Link>
            <Link href="https://baxi.ia.br" target="_blank" title="Ambiente de acesso ao BXat — cadastro necessário">
              <Button variant="outline" size="lg" className="flex gap-2 h-14 px-8 text-lg">
                Conhecer o BXat <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* ====== FOOTER LEGAL ====== */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/bxat/privacy" className="hover:text-foreground transition-colors">
              Política de Privacidade
            </Link>
            <span className="text-border">|</span>
            <Link href="/bxat/terms" className="hover:text-foreground transition-colors">
              Termos de Uso
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} BaXiJen. Todos os direitos reservados.
          </p>
        </div>
      </Container>
    </div>
  );
}