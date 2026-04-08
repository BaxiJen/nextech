'use client';

import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    step: '01',
    title: 'Diagnóstico',
    desc: 'Analisamos seus processos e identificamos gargalos que podem ser resolvidos com tecnologia.',
    color: '#00E5FF',
    height: 40,
  },
  {
    step: '02',
    title: 'Planejamento',
    desc: 'Desenhamos a arquitetura ideal (Next.js/Django) focada na sua necessidade específica.',
    color: '#3D9942',
    height: 65,
  },
  {
    step: '03',
    title: 'Desenvolvimento',
    desc: 'Codificamos a solução com foco em qualidade, segurança e escalabilidade.',
    color: '#7C4DFF',
    height: 90,
  },
  {
    step: '04',
    title: 'Suporte e Evolução',
    desc: 'Acompanhamos o pós-lançamento garantindo que tudo funcione perfeitamente.',
    color: '#FFAB00',
    height: 100,
  },
];

export function ProcessTimeline() {
  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent -translate-x-1/2 hidden lg:block" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6">
        {steps.map((item, index) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className="relative flex flex-col items-center text-center"
          >
            {/* Crystal growth visualization */}
            <div className="relative mb-6">
              {/* Crystal shape */}
              <motion.div
                className="relative"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.15, ease: 'easeOut' }}
                style={{ transformOrigin: 'bottom' }}
              >
                <div
                  className="w-16 mx-auto relative"
                  style={{ height: `${item.height}px` }}
                >
                  {/* Main crystal body */}
                  <div
                    className="absolute inset-0 rounded-t-lg"
                    style={{
                      background: `linear-gradient(to top, ${item.color}20, ${item.color}60)`,
                      clipPath: 'polygon(15% 100%, 85% 100%, 100% 30%, 60% 0%, 40% 0%, 0% 30%)',
                    }}
                  />
                  {/* Crystal glow */}
                  <div
                    className="absolute inset-0 rounded-t-lg blur-sm opacity-40"
                    style={{
                      background: `linear-gradient(to top, transparent, ${item.color}40)`,
                      clipPath: 'polygon(15% 100%, 85% 100%, 100% 30%, 60% 0%, 40% 0%, 0% 30%)',
                    }}
                  />
                </div>
              </motion.div>

              {/* Step number */}
              <div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: item.color, color: '#000' }}
              >
                {item.step}
              </div>
            </div>

            {/* Text content */}
            <div className="pt-4">
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}