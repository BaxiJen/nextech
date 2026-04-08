'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Bot, MessageSquare, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface IceBlockCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accentColor?: string;
  className?: string;
}

const accentColors = {
  'Sites Express': { bg: 'rgba(0,229,255,0.08)', border: 'rgba(0,229,255,0.3)', glow: '0 0 20px rgba(0,229,255,0.15)' },
  'Agentes de WhatsApp': { bg: 'rgba(61,153,66,0.08)', border: 'rgba(61,153,66,0.3)', glow: '0 0 20px rgba(61,153,66,0.15)' },
  'Chatbots Oficiais': { bg: 'rgba(124,77,255,0.08)', border: 'rgba(124,77,255,0.3)', glow: '0 0 20px rgba(124,77,255,0.15)' },
  'Sistemas sob Medida': { bg: 'rgba(255,171,0,0.08)', border: 'rgba(255,171,0,0.3)', glow: '0 0 20px rgba(255,171,0,0.15)' },
};

export function IceBlockCard({
  title,
  description,
  href,
  icon: Icon,
  className,
}: IceBlockCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = accentColors[title as keyof typeof accentColors] || accentColors['Sites Express'];

  return (
    <div
      className={cn(
        'group relative flex flex-col p-8 rounded-2xl cursor-pointer transition-all duration-500',
        'border backdrop-blur-xl',
        className
      )}
      style={{
        background: isHovered ? colors.bg : 'rgba(255,255,255,0.03)',
        borderColor: isHovered ? colors.border : 'rgba(255,255,255,0.08)',
        boxShadow: isHovered ? colors.glow : 'none',
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Frost overlay on hover */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none',
          'bg-gradient-to-br from-white/5 via-transparent to-white/5'
        )}
        style={{ opacity: isHovered ? 1 : 0 }}
      />

      {/* Ice crack lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500"
        viewBox="0 0 300 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M150 0 L160 80 L140 120 L155 200 L145 250 L160 320 L150 400" stroke="currentColor" strokeWidth="0.5" />
        <path d="M160 80 L200 60 L230 90" stroke="currentColor" strokeWidth="0.3" />
        <path d="M140 120 L100 110 L80 130" stroke="currentColor" strokeWidth="0.3" />
        <path d="M155 200 L190 210 L210 190" stroke="currentColor" strokeWidth="0.3" />
        <path d="M145 250 L110 260 L90 240" stroke="currentColor" strokeWidth="0.3" />
      </svg>

      <div className="relative z-10">
        <div
          className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-500"
          style={{
            background: isHovered ? colors.border : 'rgba(255,255,255,0.05)',
            boxShadow: isHovered ? colors.glow : 'none',
          }}
        >
          <Icon className="h-7 w-7 text-foreground" style={{ color: isHovered ? colors.border : undefined }} />
        </div>
        <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>
        <Link
          href={href}
          className="inline-flex items-center text-sm font-semibold transition-all duration-300 group/link"
          style={{ color: isHovered ? colors.border : undefined }}
        >
          Saiba mais
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}