'use client';

import React, { useState } from 'react';
import { Container } from '@/components/Container';
import { ArrowRight, CheckCircle2, Mail, User, Building2, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const profissoes = [
  { value: '', label: 'Selecione...' },
  { value: 'professor', label: 'Professor(a)' },
  { value: 'pesquisador', label: 'Pesquisador(a)' },
  { value: 'empreendedor', label: 'Empreendedor(a)' },
  { value: 'empresario', label: 'Empresário(a)' },
  { value: 'prestador_servicos', label: 'Prestador(a) de Serviços' },
  { value: 'gestor_publico', label: 'Gestor(a) Público(a)' },
  { value: 'estudante_graduacao', label: 'Estudante de Graduação' },
  { value: 'estudante_pos', label: 'Estudante de Pós-graduação' },
  { value: 'consultor', label: 'Consultor(a)' },
  { value: 'investidor', label: 'Investidor(a)' },
  { value: 'jornalista', label: 'Jornalista / Comunicação' },
  { value: 'ti_profissional', label: 'Profissional de TI / Dados' },
  { value: 'advogado', label: 'Advogado(a)' },
  { value: 'engenheiro', label: 'Engenheiro(a)' },
  { value: 'medico', label: 'Profissional da Saúde' },
  { value: 'outro', label: 'Outro' },
];

export function SbpcCadastroContent() {
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    sobrenome: '',
    profissao: '',
    instituicao: '',
    autorizacao: false,
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const payload = {
      email: formData.email,
      nome: formData.nome,
      sobrenome: formData.sobrenome,
      profissao: formData.profissao,
      instituicao: formData.instituicao || null,
      autorizacao_zhipu: formData.autorizacao,
      timestamp: new Date().toISOString(),
      evento: 'sbpc_2026',
      parceria: 'baxi_zhipu',
    };

    try {
      // === INTEGRAR COM BACKEND AQUI ===
      // Ex: await fetch('/api/cadastro-sbpc', { method: 'POST', body: JSON.stringify(payload) })
      console.log('Payload cadastro SBPC:', payload);

      // Fallback: salva no localStorage
      const cadastros = JSON.parse(localStorage.getItem('cadastros_sbpc') || '[]');
      cadastros.push(payload);
      localStorage.setItem('cadastros_sbpc', JSON.stringify(cadastros));

      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto text-center"
          >
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Pré-registro confirmado!</h1>
            <p className="text-lg text-white/70 mb-2">
              {formData.nome} {formData.sobrenome}, seu cadastro foi realizado com
              sucesso.
            </p>
            <p className="text-sm text-white/50">
              {formData.autorizacao
                ? 'Você autorizou o compartilhamento com a Zhipu AI. '
                : ''}
              Bem-vindo(a) à SBPC 2026! Em breve você poderá conversar com a IA
              BaXi ao vivo.
            </p>
          </motion.div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-16">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          {/* Logos */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <span className="text-3xl font-bold text-[#2d5a87]">BaXi</span>
            <span className="text-xl text-white/40">×</span>
            <span className="text-3xl font-bold text-[#c8102e]">Zhipu</span>
          </div>

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Bem-vindo(a) 👋</h1>
            <p className="text-sm text-white/60 leading-relaxed">
              Faça seu pré-registro para a SBPC 2026 e converse com a IA BaXi ao
              vivo. É rápido — menos de 1 minuto.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white/[0.03] border border-white/10 rounded-2xl p-8"
          >
            {/* E-mail */}
            <div>
              <label className="block text-sm font-medium mb-2">
                E-mail <span className="text-[#c8102e]">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#2d5a87] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Nome + Sobrenome */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Nome <span className="text-[#c8102e]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    placeholder="Maria"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#2d5a87] focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Sobrenome <span className="text-[#c8102e]">*</span>
                </label>
                <input
                  type="text"
                  name="sobrenome"
                  value={formData.sobrenome}
                  onChange={handleChange}
                  required
                  placeholder="Silva"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#2d5a87] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Profissão */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Profissão <span className="text-[#c8102e]">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
                <select
                  name="profissao"
                  value={formData.profissao}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#2d5a87] focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  {profissoes.map((p) => (
                    <option key={p.value} value={p.value} className="bg-[#0f1923] text-white">
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Empresa/Instituição */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Empresa / Instituição
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  name="instituicao"
                  value={formData.instituicao}
                  onChange={handleChange}
                  placeholder="Ex: UFF, Petrobras, Minha Startup..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#2d5a87] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Termo de aceite */}
            <div className="flex items-start gap-3 p-4 bg-white/[0.03] border border-white/10 rounded-lg">
              <input
                type="checkbox"
                name="autorizacao"
                id="autorizacao"
                checked={formData.autorizacao}
                onChange={handleChange}
                className="mt-1 accent-[#2d5a87] cursor-pointer"
              />
              <label
                htmlFor="autorizacao"
                className="text-xs text-white/60 leading-relaxed cursor-pointer"
              >
                <strong className="text-white">
                  Quer receber novidades da Zhipu AI?
                </strong>
                <br />
                A Zhipu AI é parceira da BaXiJen e uma das líderes mundiais em
                inteligência artificial. Ao marcar esta opção, você autoriza o
                compartilhamento do seu e-mail e perfil com a Zhipu para receber
                conteúdos, convites e oportunidades relacionadas a IA. Seus
                dados não serão vendidos a terceiros. Você pode cancelar a
                qualquer momento.
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3.5 bg-gradient-to-r from-[#1a3a5c] to-[#2d5a87] text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {status === 'loading' ? (
                'Enviando...'
              ) : (
                <>
                  Confirmar pré-registro
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {status === 'error' && (
              <p className="text-sm text-red-400 text-center">
                Algo deu errado. Tente novamente ou entre em contato via
                contato@baxi.ia.br
              </p>
            )}
          </form>

          <p className="text-center mt-6 text-xs text-white/40">
            BaXiJen × Zhipu AI — SBPC 2026 · Niterói, RJ
          </p>
        </motion.div>
      </Container>
    </div>
  );
}