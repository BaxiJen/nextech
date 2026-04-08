'use client';

import React from 'react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { IceBlockCard } from '@/components/IceBlockCard';
import { FrostTransition } from '@/components/FrostTransition';
import { Database, Shield, Server, Layout, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const features = [
  { icon: Server, title: 'Back-end Robusto', desc: 'Frameworks de alta performance que garantem segurança e escalabilidade desde o primeiro dia de operação.' },
  { icon: Layout, title: 'Interfaces Modernas', desc: 'Painéis administrativos rápidos, intuitivos e totalmente responsivos para que você controle tudo de qualquer lugar.' },
  { icon: Database, title: 'Dados Estruturados', desc: 'Modelagem de banco de dados profissional para garantir a integridade e a velocidade das suas informações.' },
  { icon: Shield, title: 'Segurança em Primeiro Lugar', desc: 'Proteção contra vulnerabilidades comuns da web e conformidade com as melhores práticas de desenvolvimento.' },
];

const checklistItems = [
  'Dashboard de indicadores em tempo real.',
  'Gestão de usuários e permissões.',
  'Relatórios automatizados e exportáveis.',
  'API para integração com apps.',
  'Backup automático e segurança TLS.',
];

export function SistemasWebContent() {
  return (
    <div className="py-20">
      <Container>
        {/* Hero with terminal/code visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold tracking-tight mb-6">Sistemas Web sob Medida</h1>
            <p className="text-xl text-muted-foreground">
              Desenvolvemos o &quot;cérebro&quot; digital da sua empresa com as tecnologias mais modernas e seguras do mercado.
            </p>
          </motion.div>

          {/* CSS Terminal/Code visualization — replaces Unsplash */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div
              className="relative h-[250px] lg:h-[400px] w-full rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(0,229,255,0.12)',
                boxShadow: '0 0 40px rgba(0,229,255,0.06)',
              }}
            >
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
                <span className="ml-3 text-[11px] text-muted-foreground font-mono">baxijen — sistema — bash</span>
              </div>
              {/* Code lines */}
              <div className="p-5 font-mono text-xs space-y-2.5 overflow-hidden">
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="text-muted-foreground/40 select-none">01</span>
                  <span className="text-green-400/70">from</span>
                  <span className="text-cyan-400/70"> baxijen.core</span>
                  <span className="text-green-400/70"> import</span>
                  <span className="text-amber-400/70"> SistemaWeb</span>
                </motion.div>
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <span className="text-muted-foreground/40 select-none">02</span>
                  <span className="text-muted-foreground/30"># Inicializar sistema</span>
                </motion.div>
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <span className="text-muted-foreground/40 select-none">03</span>
                  <span className="text-purple-400/70">sistema</span>
                  <span className="text-foreground/50"> = </span>
                  <span className="text-cyan-400/70">SistemaWeb</span>
                  <span className="text-foreground/50">(</span>
                </motion.div>
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  <span className="text-muted-foreground/40 select-none">04</span>
                  <span className="text-foreground/30 pl-4">db=</span>
                  <span className="text-amber-400/70">&quot;postgresql&quot;</span>
                  <span className="text-foreground/30">,</span>
                </motion.div>
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                >
                  <span className="text-muted-foreground/40 select-none">05</span>
                  <span className="text-foreground/30 pl-4">cache=</span>
                  <span className="text-amber-400/70">&quot;redis&quot;</span>
                  <span className="text-foreground/30">,</span>
                </motion.div>
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  <span className="text-muted-foreground/40 select-none">06</span>
                  <span className="text-foreground/30 pl-4">auth=</span>
                  <span className="text-amber-400/70">&quot;jwt&quot;</span>
                </motion.div>
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.7 }}
                >
                  <span className="text-muted-foreground/40 select-none">07</span>
                  <span className="text-foreground/50">)</span>
                </motion.div>
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.0 }}
                >
                  <span className="text-muted-foreground/40 select-none">08</span>
                  <span className="text-purple-400/70">sistema</span>
                  <span className="text-foreground/50">.</span>
                  <span className="text-cyan-400/70">deploy</span>
                  <span className="text-foreground/50">()</span>
                </motion.div>
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.3 }}
                >
                  <span className="text-muted-foreground/40 select-none">09</span>
                  <span className="text-green-400/60">✓ Sistema online em</span>
                  <span className="text-amber-400/60"> 0.8s</span>
                </motion.div>
              </div>
              {/* Cursor blink */}
              <div className="absolute bottom-5 left-5 flex items-center gap-2">
                <span className="text-primary/60 font-mono text-xs">$</span>
                <div className="w-2 h-4 bg-primary/60 animate-pulse" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features + Sidebar */}
        <FrostTransition>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-20">
            <div className="space-y-8">
              {features.map((item, i) => (
                <motion.div
                  key={item.title}
                  className="flex gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div
                    className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl"
                    style={{
                      background: 'rgba(0,229,255,0.08)',
                      border: '1px solid rgba(0,229,255,0.15)',
                    }}
                  >
                    <item.icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sidebar — glassmorphism card */}
            <motion.div
              className="sticky top-24 p-8 rounded-2xl"
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
              <h3 className="text-xl font-bold mb-4">O que entregamos:</h3>
              <ul className="space-y-3 mb-8">
                {checklistItems.map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">{item}</span>
                  </motion.li>
                ))}
              </ul>
              <Link href="/contato" className="block w-full">
                <Button className="w-full" size="lg">Solicitar Projeto</Button>
              </Link>
            </motion.div>
          </div>
        </FrostTransition>
      </Container>
    </div>
  );
}