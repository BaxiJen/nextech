'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function FrostTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
    >
      {/* Chromatic aberration border glow */}
      <div className="relative">
        <div className="absolute -top-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
        <div className="absolute -top-1 left-1 right-0 h-px bg-gradient-to-r from-transparent via-green-400/10 to-transparent blur-[1px]" />
        <div className="absolute -top-1 -left-1 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/10 to-transparent blur-[1px]" />
        {children}
      </div>
    </motion.div>
  );
}