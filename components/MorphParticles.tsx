'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Settings, BarChart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface DifferentialItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
  shape: 'lightning' | 'shield' | 'gear' | 'chart';
}

const differentials: DifferentialItem[] = [
  { icon: Zap, title: 'Performance', desc: 'Sites extremamente rápidos com Next.js.', color: '#00E5FF', shape: 'lightning' },
  { icon: ShieldCheck, title: 'Segurança', desc: 'Sistemas robustos e protegidos com Django.', color: '#3D9942', shape: 'shield' },
  { icon: Settings, title: 'Automação', desc: 'Processos repetitivos executados por IA.', color: '#7C4DFF', shape: 'gear' },
  { icon: BarChart, title: 'Resultados', desc: 'Tecnologia que gera conversão e lucro.', color: '#FFAB00', shape: 'chart' },
];

// SVG morph shapes for each differential
function MorphIcon({ shape, color, isActive }: { shape: string; color: string; isActive: boolean }) {
  const paths: Record<string, string> = {
    lightning: 'M13 2L3 14h7l-2 10 10-12h-7l2-10z',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    gear: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.6.77 1.09 1.51 1.32H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
    chart: 'M18 20V10M12 20V4M6 20v-6',
  };

  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={isActive ? 2 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-all duration-500"
    >
      {shape === 'lightning' && <path d={paths.lightning} fill={isActive ? `${color}20` : 'none'} />}
      {shape === 'shield' && <path d={paths.shield} fill={isActive ? `${color}20` : 'none'} />}
      {shape === 'gear' && <path d={paths.gear} fill={isActive ? `${color}20` : 'none'} />}
      {shape === 'chart' && <path d={paths.chart} strokeWidth={isActive ? 3 : 1.5} />}
      {/* Glow effect on hover */}
      {isActive && (
        <circle cx="12" cy="12" r="10" fill={`${color}08`} stroke={`${color}30`} strokeWidth="0.5" />
      )}
    </svg>
  );
}

export function MorphParticles() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
      {differentials.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="flex flex-col items-center text-center group cursor-default"
          onMouseEnter={() => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <div
            className="mb-5 w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500"
            style={{
              background: activeIndex === index ? `${item.color}15` : 'rgba(255,255,255,0.03)',
              boxShadow: activeIndex === index ? `0 0 30px ${item.color}20, inset 0 0 20px ${item.color}10` : 'none',
              border: `1px solid ${activeIndex === index ? `${item.color}40` : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            <MorphIcon shape={item.shape} color={item.color} isActive={activeIndex === index} />
          </div>
          <h3 className="font-bold mb-2 text-foreground">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}