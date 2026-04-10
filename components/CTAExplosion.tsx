'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function CTAExplosion() {
  const [isExploding, setIsExploding] = useState(false);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 200,
    y: (Math.random() - 0.5) * 200,
    scale: 0.5 + Math.random() * 1,
    color: ['#3D9942', '#00E5FF', '#7C4DFF', '#FFAB00'][i % 4],
    delay: Math.random() * 0.3,
  }));

  return (
    <section className="py-20 border-t relative overflow-hidden bg-background/80 backdrop-blur-xl">
      <div className="relative z-10">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="relative rounded-3xl p-8 md:p-16 text-center space-y-8 overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-cyan-500/10 rounded-3xl" />
            <div className="absolute inset-0 border border-primary/20 rounded-3xl" />

            {/* Particle explosion on hover */}
            {isExploding && (
              <div className="absolute inset-0 pointer-events-none">
                {particles.map((p) => (
                  <motion.div
                    key={p.id}
                    className="absolute left-1/2 top-1/2 rounded-full"
                    style={{ width: 6 * p.scale, height: 6 * p.scale, background: p.color }}
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{ x: p.x, y: p.y, opacity: 0 }}
                    transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
                  />
                ))}
              </div>
            )}

            <div className="relative z-10 space-y-6">
              <motion.h2
                className="text-3xl md:text-5xl font-bold tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Sua empresa está pronta para o próximo nível?
              </motion.h2>
              <motion.p
                className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Combinamos inovação e conectividade para resolver seus desafios. Vamos conversar sobre o seu projeto?
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link
                  href="https://wa.me/5521933009048"
                  target="_blank"
                  className="inline-block"
                  onMouseEnter={() => setIsExploding(true)}
                  onMouseLeave={() => setIsExploding(false)}
                >
                  <button className="relative bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-medium hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 hover:shadow-primary/40">
                    Solicitar Orçamento no WhatsApp
                    {/* Button glow ring */}
                    <div className="absolute inset-0 rounded-xl border border-white/10" />
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}