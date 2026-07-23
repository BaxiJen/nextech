'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface BuritiCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  className?: string;
}

export function BuritiCard({
  title,
  description,
  href,
  icon: Icon,
  className,
}: BuritiCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'group relative flex flex-col p-8 rounded-2xl cursor-pointer transition-all duration-300',
        className
      )}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${isHovered ? 'rgba(26,93,58,0.5)' : 'rgba(26,93,58,0.2)'}`,
        borderRadius: '16px',
        boxShadow: isHovered ? '0 0 24px rgba(26,93,58,0.12)' : 'none',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative z-10">
        <div
          className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300"
          style={{
            background: 'rgba(26,93,58,0.12)',
            border: '1px solid rgba(26,93,58,0.15)',
          }}
        >
          <Icon className="h-7 w-7" style={{ color: '#97c459' }} />
        </div>
        <h3 className="text-xl font-medium mb-3 text-foreground" style={{ fontFamily: 'var(--font-geist-sans)', fontWeight: 500 }}>
          {title}
        </h3>
        <p className="text-muted-foreground mb-6 leading-relaxed text-sm">{description}</p>
        {href && (
          <Link
            href={href}
            className="inline-flex items-center text-sm font-medium transition-all duration-300 group/link"
            style={{ color: isHovered ? '#97c459' : 'var(--muted-foreground)' }}
          >
            Saiba mais
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
          </Link>
        )}
      </div>
    </div>
  );
}