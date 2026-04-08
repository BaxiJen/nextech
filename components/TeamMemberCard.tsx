'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Linkedin } from 'lucide-react';
import { TeamMember } from '@/lib/types';

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex flex-col space-y-6 rounded-2xl p-8 transition-all duration-500"
      style={{
        background: isHovered ? 'rgba(0,229,255,0.05)' : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${isHovered ? 'rgba(0,229,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: isHovered ? '0 0 30px rgba(0,229,255,0.08)' : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
        <Image
          src={member.photo}
          alt={member.name}
          fill
          className="object-cover object-top"
        />
      </div>
      <div className="space-y-3">
        <h3 className="text-2xl font-bold">{member.name}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {member.headline}
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Competências
        </p>
        <div className="flex flex-wrap gap-2">
          {member.skills.map((skill, index) => (
            <span
              key={index}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                background: isHovered ? 'rgba(0,229,255,0.08)' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
      <a
        href={member.linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-[#0077B5] transition-colors font-medium text-sm"
      >
        <Linkedin className="h-4 w-4" />
        <span>Perfil LinkedIn</span>
      </a>
    </div>
  );
}