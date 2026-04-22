'use client';

import React from 'react';
import { Container } from '@/components/Container';
import { IceBlockCard } from '@/components/IceBlockCard';
import { FrostTransition } from '@/components/FrostTransition';
import { TeamMemberCard } from '@/components/TeamMemberCard';
import { teamMembers } from '@/lib/teamMembers';
import { Target, Eye, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function SobreContent() {
  return (
    <div className="space-y-24">
      {/* SEÇÃO 1: A BAXIJEN */}
      <section className="py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">A BaXiJen®</h1>
              <p className="text-xl text-muted-foreground">
                Tecnologia de ponta com foco em resolver problemas do mundo real.
              </p>
            </motion.div>

            {/* Dark gradient hero visual — replaces Unsplash */}
            <motion.div
              className="relative h-[400px] w-full mb-16 rounded-2xl overflow-hidden border border-white/5"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-cyan-500/10" />
              {/* Decorative glow orbs */}
              <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-primary/10 blur-3xl animate-pulse" />
              <div className="absolute bottom-1/3 right-1/3 w-56 h-56 rounded-full bg-cyan-500/8 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-32 h-32 rounded-full border border-primary/10" />
                <div className="absolute inset-0 m-auto w-20 h-20 rounded-full border border-cyan-500/8" />
              </div>
              {/* Center text overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-extrabold tracking-tighter bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                    巴西人
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 font-mono">tecnologia com visão global</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="max-w-none text-muted-foreground space-y-6 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p>
                Fundada em 06 de fevereiro de 2026, nascemos da necessidade de empresas que buscam mais do que apenas um site bonito. Na BaXiJen®, acreditamos que a tecnologia deve ser uma alavanca de crescimento e eficiência, não uma fonte de frustração.
              </p>
              <p>
                A BaXiJen® nasceu em um Google Meet, quando três jovens pesquisadores do COPPEAD apaixonados por tecnologia e inovação definiram o nome da empresa e decidiram transformar inquietação em ação. Formalmente constituída em 06 de abril de 2026, a empresa surgiu da percepção de que a lacuna entre a pesquisa avançada e as necessidades reais do mercado era significativa — e de que era hora de transformar conhecimento acadêmico em soluções concretas, práticas e impactantes. Durante o doutorado em Inteligência Artificial e Administração, percebemos que a lacuna entre a pesquisa avançada e as necessidades reais do mercado era significativa. Essa inquietação nos motivou a transformar conhecimento acadêmico em soluções concretas, práticas e impactantes.
              </p>
              <p>
                Unimos a velocidade e interatividade das interfaces modernas com a robustez e segurança de sistemas empresariais. Nossa abordagem é sempre técnica, pragmática e focada em resultados.
              </p>
            </motion.div>

            {/* Missão / Visão / Valores — IceBlockCards */}
            <FrostTransition>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <IceBlockCard
                    title="Missão"
                    description="Democratizar o acesso a sistemas de alta complexidade para empresas que buscam eficiência operacional."
                    href="#"
                    icon={Target}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <IceBlockCard
                    title="Visão"
                    description="Ser a principal parceira tecnológica de empresas que priorizam a inteligência e automação em seus processos."
                    href="#"
                    icon={Eye}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <IceBlockCard
                    title="Valores"
                    description="Transparência técnica, código limpo, compromisso com prazos e foco total no valor gerado ao cliente."
                    href="#"
                    icon={ShieldCheck}
                  />
                </motion.div>
              </div>
            </FrostTransition>
          </div>
        </Container>
      </section>

      {/* SEÇÃO 2: EQUIPE */}
      <FrostTransition>
        <section className="py-24 bg-muted/30">
          <Container>
            <div className="max-w-6xl mx-auto space-y-12">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-4">Equipe</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Profissionais especializados em suas áreas, unindo expertise técnica e visão estratégica para entregar soluções de excelência.
                </p>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {teamMembers.map((member, i) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <TeamMemberCard member={member} />
                  </motion.div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </FrostTransition>

      {/* CTA FINAL */}
      <FrostTransition>
        <section className="py-24">
          <Container>
            <motion.div
              className="rounded-3xl p-12 text-center space-y-8 max-w-3xl mx-auto"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0,229,255,0.1)',
                boxShadow: '0 0 40px rgba(0,229,255,0.04)',
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-3xl font-bold">Quer conversar sobre um projeto ou ideia?</h3>
              <p className="text-muted-foreground">
                Para discutir viabilidade técnica ou propostas de desenvolvimento especializado, entre em contato direto.
              </p>
              <div className="flex justify-center">
                <a
                  href="https://wa.me/5521933009048?text=Olá%20Marcus,%20venho%20pelo%20site%20e%20gostaria%20de%20conversar%20sobre%20um%20projeto."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-lg shadow-lg scale-100 hover:scale-[1.05] transition-all"
                >
                  Falar no WhatsApp
                </a>
              </div>
            </motion.div>
          </Container>
        </section>
      </FrostTransition>
    </div>
  );
}