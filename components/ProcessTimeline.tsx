'use client';

import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    step: '01',
    title: 'Imersão',
    desc: 'Mergulhamos no seu contexto. Entendemos processos, dores e onde IA generativa gera valor real — seja em atendimento, gestão de crises, educação ou simulação.',
    color: '#1a5d3a',
  },
  {
    step: '02',
    title: 'Arquitetura',
    desc: 'Desenhamos a solução sob medida: agentes customizados, integrações com seus sistemas e soberania de dados. Tudo rodando em infraestrutura brasileira.',
    color: '#0f4027',
  },
  {
    step: '03',
    title: 'Implantação',
    desc: 'Deploy e ativação do agente em produção. Conectado aos seus canais (WhatsApp, web, API) e treinado com sua base de conhecimento.',
    color: '#97c459',
  },
  {
    step: '04',
    title: 'Evolução Contínua',
    desc: 'Monitoramento de métricas, feedback de usuários e melhorias contínuas. O agente aprende e evolui com cada interação.',
    color: '#2d7a4f',
  },
];

export function ProcessTimeline() {
  return (
    <div className="relative">
      {/* Connecting line — vertical on desktop */}
      <div
        className="absolute left-1/2 top-8 bottom-8 w-px -translate-x-1/2 hidden lg:block"
        style={{
          background: 'linear-gradient(to bottom, rgba(26,93,58,0.1), rgba(26,93,58,0.3), rgba(26,93,58,0.1))',
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-6">
        {steps.map((item, index) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className="relative flex flex-col items-center text-center"
          >
            {/* Circular node */}
            <div className="relative mb-6 z-10">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500"
                style={{
                  background: `${item.color}`,
                  color: '#fff',
                  boxShadow: `0 0 0 4px var(--background), 0 0 20px ${item.color}40`,
                }}
              >
                {item.step}
              </div>
            </div>

            {/* Text content */}
            <div className="pt-2">
              <h3 className="text-lg font-medium mb-2 text-foreground" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}