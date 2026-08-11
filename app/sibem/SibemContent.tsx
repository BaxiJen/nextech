'use client';

import React from 'react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { Landmark, ExternalLink, MessageSquare, Database, BarChart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const features = [
  { icon: MessageSquare, title: 'Consultas em linguagem natural', description: 'Empresários e pesquisadores fazem perguntas sobre a Lei do Bem em português comum e recebem respostas claras, sem jargão.' },
  { icon: Database, title: 'Base normativa integrada', description: 'A IA consulta a legislação completa, instruções normativas e portarias do MCTI para responder com precisão.' },
  { icon: BarChart, title: 'Análise de dados de P&D', description: 'Mapeamento e tratamento dos projetos submetidos ao sistema da Lei do Bem, apoiando a avaliação de incentivos fiscais à inovação.' },
];

export function SibemContent() {
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
            <div className="absolute inset-12 rounded-full border border-primary/10 animate-pulse" />
            <div className="absolute inset-20 rounded-full border border-[#97c459]/8 animate-pulse" style={{ animationDelay: '0.7s' }} />
            <div className="absolute inset-28 rounded-full border border-primary/5 animate-pulse" style={{ animationDelay: '1.4s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-center">
                  <Landmark className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 rounded-lg border border-[#97c459]/20 bg-[#97c459]/10 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-[#97c459]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            className="order-1 lg:order-2 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium border-primary/20 bg-primary/5" style={{ fontFamily: 'var(--font-geist-mono)' }}>
              <span className="text-[#97c459] mr-2 font-bold">MCTI</span> Lei do Bem
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]"
              style={{ fontFamily: 'var(--font-newsreader, serif)', fontWeight: 500, letterSpacing: '-0.03em' }}
            >
              SIBEM — Sistema de Informações da Lei do Bem
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Assistente de IA desenvolvido pela BaXiJen para o Ministério da Ciência, Tecnologia e Inovação. Tira dúvidas sobre a legislação de incentivo fiscal à inovação e analisa dados dos projetos de P&D submetidos ao sistema.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a href="https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/lei-do-bem/arquivos-2/chatbot-lei-do-em/" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gap-2">
                  Acessar SIBEM no MCTI
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <Link href="/contato">
                <Button variant="outline" size="lg">
                  Falar com a BaXiJen
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ====== O QUE É ====== */}
        <section className="mb-24">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-sm font-medium text-[#97c459] mb-3" style={{ fontFamily: 'var(--font-geist-mono)' }}>
              O PROJETO
            </div>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>
              IA a serviço da inovação brasileira
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A SIBEM é um sistema de informação baseado em inteligência artificial que ajuda empresas e pesquisadores a navegar a Lei do Bem (Lei nº 11.196/2005) — a principal legislação brasileira de incentivo fiscal à pesquisa, desenvolvimento e inovação. A BaXiJen desenvolveu a solução para o MCTI em parceria com o Centro de Inteligência de Dados da UFF (CID/UFF), unindo conhecimento técnico-normativo e engenharia de IA.
            </p>
          </motion.div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="group relative flex flex-col p-8 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(26,93,58,0.2)',
                  borderRadius: '16px',
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
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
                <h3 className="text-xl font-medium mb-3 text-foreground" style={{ fontFamily: 'var(--font-geist-sans)', fontWeight: 500 }}>
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ====== NA IMPRENSA ====== */}
        <section className="mb-24">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-2xl p-8 md:p-12" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(26,93,58,0.2)', borderRadius: '16px' }}>
              <div className="text-sm font-medium text-[#97c459] mb-3" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                NA IMPRENSA
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>
                "Lei do Bem: MCTI cria chatbot de IA para tirar dúvidas sobre a legislação"
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                A reportagem da Convergência Digital destacou o lançamento da SIBEM, com a participação do professor Eduardo Camilo, mentor da BaXiJen e coordenador do CID/UFF, explicando como a ferramenta facilita o acesso à informação sobre incentivos fiscais à inovação.
              </p>
              <a
                href="https://convergenciadigital.com.br/governo/lei-do-bem-mcti-cria-chatbot-ia-para-tirar-duvidas-sobre-a-legislacao/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium transition-all duration-300 group/link"
                style={{ color: '#97c459' }}
              >
                Ler reportagem completa
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
              </a>
            </div>
          </motion.div>
        </section>

        {/* ====== CTA ====== */}
        <motion.div
          className="rounded-2xl p-8 md:p-12 text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(26,93,58,0.2)', borderRadius: '16px' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-newsreader, serif)' }}>
            Quer levar IA para a sua instituição?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Desenvolvemos agentes de IA sob medida para órgãos públicos, instituições de pesquisa e empresas.
          </p>
          <Link href="/contato">
            <Button size="lg">Entrar em Contato</Button>
          </Link>
        </motion.div>
      </Container>
    </div>
  );
}