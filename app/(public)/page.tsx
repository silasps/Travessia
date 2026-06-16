import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart, Users, Home, Shield, FileText,
  MapPin, Mail, ExternalLink, ArrowRight,
  Star, CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Projeto Travessia — Acolhimento e Reinserção Social em Ribeirão Preto/SP",
  description:
    "ONG que oferece acolhimento institucional para homens em situação de rua em Ribeirão Preto, SP. Reinserção social com dignidade e cuidado integral.",
};

const PROJETOS = [
  {
    nome: "Projeto Travessia",
    tipo: "Acolhimento Institucional",
    descricao:
      "Abrigo com 50 vagas destinado a homens adultos em situação de rua, com acompanhamento psicossocial, regularização documental e plano individual de atendimento.",
    icon: Home,
    iconBg: "bg-sky-500",
  },
  {
    nome: "Pertencer — SAICA II",
    tipo: "Serviço de Acolhimento para Crianças e Adolescentes",
    descricao:
      "Atendimento residencial para crianças e adolescentes em situação de vulnerabilidade, garantindo proteção, convivência familiar e desenvolvimento integral.",
    icon: Heart,
    iconBg: "bg-rose-500",
  },
  {
    nome: "Casa Abrigo SRV",
    tipo: "Serviço Residencial de Vida",
    descricao:
      "Moradia assistida para pessoas com deficiência que necessitam de suporte para autonomia e inclusão social.",
    icon: Shield,
    iconBg: "bg-emerald-500",
  },
  {
    nome: "Projeto Criança Feliz",
    tipo: "Serviço de Visita Domiciliar",
    descricao:
      "Programa de visitas às famílias com crianças de 0 a 6 anos em situação de vulnerabilidade, fortalecendo vínculos e estimulando o desenvolvimento na primeira infância.",
    icon: Star,
    iconBg: "bg-amber-500",
  },
];

const NUMEROS = [
  { valor: "50", label: "vagas de acolhimento" },
  { valor: "30+", label: "profissionais dedicados" },
  { valor: "4", label: "programas sociais ativos" },
  { valor: "20+", label: "anos em Ribeirão Preto" },
];

const VALORES = [
  "Dignidade e respeito à pessoa humana",
  "Sigilo e proteção de dados (LGPD)",
  "Trabalho em rede com a assistência social do município",
  "Transparência na gestão dos recursos públicos",
  "Autonomia progressiva dos acolhidos",
  "Participação ativa da família no processo de reinserção",
];

const FASES = [
  { num: 1, nome: "Acolhimento e\nEstabilização", desc: "Adaptação, avaliação de saúde e construção de vínculo com a equipe técnica." },
  { num: 2, nome: "Reorganização", desc: "Regularização de documentos, tratamento de saúde e início do Plano Individual (PIA)." },
  { num: 3, nome: "Autonomia\nProgressiva", desc: "Busca por trabalho e moradia, gestão financeira e fortalecimento da rede de apoio." },
  { num: 4, nome: "Preparação para\nDesligamento", desc: "Consolidação da autonomia e encaminhamentos formalizados para a vida independente." },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-sky-500 to-sky-600 text-white overflow-hidden">
        {/* Decoração */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-white" />
          <div className="absolute -bottom-40 -right-24 w-[36rem] h-[36rem] rounded-full bg-white" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-24 text-center space-y-7">
          {/* Badge localidade */}
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium text-sky-50">
            <MapPin className="size-3.5" />
            Ribeirão Preto — São Paulo
          </div>

          {/* Logo mark */}
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl font-bold tracking-tight">PT</span>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
              Atravessando a rua em direção<br className="hidden sm:block" />
              a uma vida digna
            </h1>
            <p className="text-lg sm:text-xl text-sky-100 max-w-2xl mx-auto leading-relaxed">
              O Projeto Travessia oferece acolhimento integral, cuidado psicossocial e
              reinserção social para homens em situação de rua em Ribeirão Preto/SP.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/transparencia"
              className="inline-flex items-center gap-2 bg-white text-sky-700 font-semibold px-6 py-3 rounded-xl hover:bg-sky-50 transition-colors min-h-[48px] shadow-sm"
            >
              <FileText className="size-4" />
              Portal da Transparência
            </Link>
            <a
              href="#sobre"
              className="inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/25 transition-colors min-h-[48px]"
            >
              Conheça nossa história
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── NÚMEROS ── */}
      <section className="bg-sky-600 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {NUMEROS.map((n) => (
            <div key={n.label}>
              <p className="text-3xl sm:text-4xl font-bold">{n.valor}</p>
              <p className="text-sm text-sky-100 mt-1">{n.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOBRE NÓS ── */}
      <section id="sobre" className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Sobre o Projeto Travessia</h2>
            <div className="w-10 h-1 bg-sky-500 rounded-full mx-auto" />
          </div>

          <div className="grid sm:grid-cols-2 gap-10 items-start">
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                O <strong className="text-gray-900">Projeto Travessia</strong> é uma Organização
                da Sociedade Civil (OSC) sediada em Ribeirão Preto, interior de São Paulo,
                dedicada ao atendimento de pessoas em situação de vulnerabilidade social extrema.
              </p>
              <p>
                Nosso principal programa é o{" "}
                <strong className="text-gray-900">Serviço de Acolhimento Institucional</strong>{" "}
                para homens adultos em situação de rua — uma casa com 50 vagas onde cada pessoa
                recebe moradia, alimentação, cuidados de saúde e acompanhamento de uma equipe
                multidisciplinar formada por assistentes sociais, psicólogos e cuidadores.
              </p>
              <p>
                A parceria formal com a{" "}
                <strong className="text-gray-900">
                  Secretaria de Desenvolvimento Social do Estado de São Paulo (SEDS)
                </strong>{" "}
                e com a Prefeitura de Ribeirão Preto garante o financiamento e a supervisão
                técnica dos nossos serviços.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Nossos valores
              </p>
              <ul className="space-y-2.5">
                {VALORES.map((v) => (
                  <li key={v} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="size-4 text-sky-500 shrink-0 mt-0.5" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FASES ── */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">O processo de acolhimento</h2>
            <div className="w-10 h-1 bg-sky-500 rounded-full mx-auto" />
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              Cada acolhido percorre um caminho estruturado em fases, com metas claras e
              acompanhamento individualizado.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FASES.map((fase) => (
              <div key={fase.num} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 hover:border-sky-200 hover:shadow-sm transition-all">
                <div className="w-8 h-8 rounded-full bg-sky-500 text-white text-sm font-bold flex items-center justify-center">
                  {fase.num}
                </div>
                <p className="font-semibold text-gray-900 leading-snug whitespace-pre-line">{fase.nome}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{fase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAMAS ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Nossos programas</h2>
            <div className="w-10 h-1 bg-sky-500 rounded-full mx-auto" />
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              Além do acolhimento para adultos, atuamos em diferentes frentes da proteção social.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {PROJETOS.map((p) => (
              <div
                key={p.nome}
                className="rounded-2xl border border-gray-100 p-5 space-y-3 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className={`w-10 h-10 rounded-xl ${p.iconBg} flex items-center justify-center`}>
                  <p.icon className="size-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{p.nome}</p>
                  <p className="text-xs text-sky-600 font-medium mt-0.5">{p.tipo}</p>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{p.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA TRANSPARÊNCIA ── */}
      <section className="py-16 px-4 bg-sky-50 border-y border-sky-100">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto">
            <FileText className="size-6 text-sky-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Portal da Transparência</h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed text-sm sm:text-base">
            Publicamos todos os documentos exigidos por lei — estatutos, atas, termos de
            colaboração, prestações de contas e balancetes financeiros — de forma aberta
            e acessível a qualquer cidadão.
          </p>
          <Link
            href="/transparencia"
            className="inline-flex items-center gap-2 bg-sky-500 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-sky-600 transition-colors min-h-[48px]"
          >
            <FileText className="size-4" />
            Acessar documentos públicos
            <ExternalLink className="size-3.5 opacity-70" />
          </Link>
        </div>
      </section>

      {/* ── CONTATO ── */}
      <section id="contato" className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Entre em contato</h2>
            <div className="w-10 h-1 bg-sky-500 rounded-full mx-auto" />
          </div>

          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center mx-auto">
                <MapPin className="size-5 text-sky-500" />
              </div>
              <p className="font-semibold text-gray-900">Endereço</p>
              <p className="text-sm text-gray-500">Ribeirão Preto — SP</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center mx-auto">
                <Mail className="size-5 text-sky-500" />
              </div>
              <p className="font-semibold text-gray-900">E-mail</p>
              <a
                href="mailto:contato@projetotravessia.org.br"
                className="text-sm text-sky-600 hover:underline"
              >
                contato@projetotravessia.org.br
              </a>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center mx-auto">
                <Users className="size-5 text-sky-500" />
              </div>
              <p className="font-semibold text-gray-900">Parcerias</p>
              <p className="text-sm text-gray-500">SEDS-SP · Prefeitura de Ribeirão Preto</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 text-center space-y-1">
            <p className="text-sm text-gray-600">
              <strong>Encaminhamentos sociais</strong> devem ser realizados pelo{" "}
              <strong>CREAS</strong> ou <strong>CRAS</strong> do município.
            </p>
            <p className="text-xs text-gray-400">
              O acolhimento é uma política pública — não aceitamos encaminhamentos diretos sem avaliação da rede socioassistencial.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
