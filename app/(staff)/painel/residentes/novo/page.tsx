"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, ShieldCheck } from "lucide-react";

type Aba = "dados" | "lgpd";

export default function NovoResidentePage() {
  const [aba, setAba] = useState<Aba>("dados");
  const [lgpdAceito, setLgpdAceito] = useState(false);
  const [salvo, setSalvo] = useState(false);

  if (salvo) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <UserPlus className="size-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Acolhido cadastrado</h2>
        <p className="text-sm text-gray-600">
          O prontuário foi criado e o acolhido aparece na lista como Fase 1 — Acolhimento.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link
            href="/painel/residentes"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-muted px-5 py-2.5 text-sm font-medium hover:bg-muted/80 transition-colors min-h-[44px]"
          >
            Ver acolhidos
          </Link>
          <button
            onClick={() => { setSalvo(false); setAba("dados"); setLgpdAceito(false); }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 transition-colors min-h-[44px]"
          >
            Cadastrar outro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Voltar */}
      <Link
        href="/painel/residentes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Acolhidos
      </Link>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Novo Acolhido</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Cadastro inicial — Fase 1 (Acolhimento)</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1">
        {([["dados", "Dados Pessoais"], ["lgpd", "Consentimento LGPD"]] as [Aba, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setAba(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              aba === key
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-muted-foreground hover:text-gray-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!lgpdAceito) {
            setAba("lgpd");
            return;
          }
          setSalvo(true);
        }}
      >
        {/* === ABA DADOS === */}
        <div className={aba === "dados" ? "space-y-5" : "hidden"}>
          {/* Identificação */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
            <h2 className="font-semibold text-gray-900">Identificação</h2>

            <div>
              <label htmlFor="nome_completo" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nome completo <span className="text-red-500">*</span>
              </label>
              <input type="text" id="nome_completo" name="nome_completo" required
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div>
              <label htmlFor="nome_social" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nome social <span className="text-xs text-muted-foreground">(opcional)</span>
              </label>
              <input type="text" id="nome_social" name="nome_social"
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="data_nascimento" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Data de nascimento <span className="text-red-500">*</span>
                </label>
                <input type="date" id="data_nascimento" name="data_nascimento" required
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1.5">
                  CPF
                </label>
                <input type="text" id="cpf" name="cpf" placeholder="000.000.000-00" maxLength={14}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rg" className="block text-sm font-medium text-gray-700 mb-1.5">RG</label>
                <input type="text" id="rg" name="rg" placeholder="00.000.000-0"
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label htmlFor="nis" className="block text-sm font-medium text-gray-700 mb-1.5">NIS / Cadastro Único</label>
                <input type="text" id="nis" name="nis"
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <div>
              <label htmlFor="naturalidade" className="block text-sm font-medium text-gray-700 mb-1.5">
                Naturalidade (cidade/UF)
              </label>
              <input type="text" id="naturalidade" name="naturalidade" placeholder="Ex: Ribeirão Preto/SP"
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="estado_civil" className="block text-sm font-medium text-gray-700 mb-1.5">Estado civil</label>
                <select id="estado_civil" name="estado_civil"
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Selecionar…</option>
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="divorciado">Divorciado(a)</option>
                  <option value="viuvo">Viúvo(a)</option>
                  <option value="uniao_estavel">União estável</option>
                </select>
              </div>
              <div>
                <label htmlFor="escolaridade" className="block text-sm font-medium text-gray-700 mb-1.5">Escolaridade</label>
                <select id="escolaridade" name="escolaridade"
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Selecionar…</option>
                  <option value="sem_escolaridade">Sem escolaridade</option>
                  <option value="fundamental_incompleto">Fundamental incompleto</option>
                  <option value="fundamental_completo">Fundamental completo</option>
                  <option value="medio_incompleto">Médio incompleto</option>
                  <option value="medio_completo">Médio completo</option>
                  <option value="superior_incompleto">Superior incompleto</option>
                  <option value="superior_completo">Superior completo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Situação de rua */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
            <h2 className="font-semibold text-gray-900">Situação de rua</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tempo_rua_meses" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tempo em situação de rua (meses)
                </label>
                <input type="number" id="tempo_rua_meses" name="tempo_rua_meses" min={0}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label htmlFor="motivo_entrada" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Motivo de entrada
                </label>
                <select id="motivo_entrada" name="motivo_entrada"
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Selecionar…</option>
                  <option value="busca_espontanea">Busca espontânea</option>
                  <option value="encaminhamento_creas">Encaminhamento CREAS</option>
                  <option value="encaminhamento_cras">Encaminhamento CRAS</option>
                  <option value="encaminhamento_prefeitura">Encaminhamento Prefeitura</option>
                  <option value="encaminhamento_saude">Encaminhamento Saúde</option>
                  <option value="encaminhamento_policia">Encaminhamento Polícia</option>
                  <option value="familiar">Indicação familiar</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="motivo_situacao_rua" className="block text-sm font-medium text-gray-700 mb-1.5">
                Motivo da situação de rua (relato inicial)
              </label>
              <textarea id="motivo_situacao_rua" name="motivo_situacao_rua" rows={3}
                placeholder="Descrição sumária das circunstâncias que levaram à situação de rua..."
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
          </div>

          {/* Saúde */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
            <h2 className="font-semibold text-gray-900">Saúde</h2>
            <div>
              <label htmlFor="condicoes_saude" className="block text-sm font-medium text-gray-700 mb-1.5">
                Condições de saúde conhecidas
              </label>
              <input type="text" id="condicoes_saude" name="condicoes_saude" placeholder="Ex: hipertensão, diabetes..."
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label htmlFor="medicamentos" className="block text-sm font-medium text-gray-700 mb-1.5">
                Medicamentos em uso
              </label>
              <input type="text" id="medicamentos" name="medicamentos"
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label htmlFor="uso_substancias" className="block text-sm font-medium text-gray-700 mb-1.5">
                Uso de substâncias psicoativas
              </label>
              <select id="uso_substancias" name="uso_substancias"
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Selecionar…</option>
                <option value="nao">Não</option>
                <option value="alcool">Álcool</option>
                <option value="crack">Crack</option>
                <option value="multiplas">Múltiplas substâncias</option>
                <option value="em_tratamento">Em tratamento</option>
              </select>
            </div>
          </div>

          {/* Entrada */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
            <h2 className="font-semibold text-gray-900">Entrada no programa</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="data_entrada" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Data de entrada <span className="text-red-500">*</span>
                </label>
                <input type="date" id="data_entrada" name="data_entrada" required
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label htmlFor="quarto" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Quarto / leito
                </label>
                <input type="text" id="quarto" name="quarto" placeholder="Ex: Quarto 3, Leito 2"
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div>
              <label htmlFor="observacoes_entrada" className="block text-sm font-medium text-gray-700 mb-1.5">
                Observações da entrada
              </label>
              <textarea id="observacoes_entrada" name="observacoes_entrada" rows={3}
                placeholder="Estado geral na chegada, necessidades imediatas..."
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setAba("lgpd")}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors min-h-[48px]"
            >
              Próximo: Consentimento LGPD
            </button>
          </div>
        </div>

        {/* === ABA LGPD === */}
        <div className={aba === "lgpd" ? "space-y-5" : "hidden"}>
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="size-6 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h2 className="font-semibold text-blue-900">Consentimento de uso de dados pessoais</h2>
                <p className="text-xs text-blue-700 mt-0.5">Lei Geral de Proteção de Dados (LGPD) — Lei 13.709/2018</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 text-sm text-gray-700 space-y-3 leading-relaxed">
              <p>
                O <strong>Projeto Travessia</strong> coleta e utiliza seus dados pessoais para oferecer
                acompanhamento social, orientação e apoio durante sua estada no programa de acolhimento.
              </p>
              <p>
                Seus dados são usados para: identificação, saúde, acompanhamento da sua evolução no
                programa, contato com familiares (com sua autorização) e prestação de contas às
                autoridades responsáveis (Prefeitura, SUAS).
              </p>
              <p>
                Você pode, a qualquer momento, solicitar acesso, correção ou exclusão dos seus dados
                pessoais. Entre em contato com nossa equipe técnica ou com o nosso DPO.
              </p>
              <p>
                Seus dados são guardados com segurança e não são compartilhados com terceiros sem
                sua autorização, exceto quando exigido por lei.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Método de coleta do consentimento <span className="text-red-500">*</span>
              </label>
              <select name="lgpd_consent_method" required
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Selecionar método…</option>
                <option value="verbal_registrado">Verbal com testemunha (registrado pelo técnico)</option>
                <option value="escrito">Assinatura em papel</option>
                <option value="digital">Assinatura digital</option>
              </select>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={lgpdAceito}
                onChange={(e) => setLgpdAceito(e.target.checked)}
                className="mt-1 size-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-800">
                Confirmo que o acolhido recebeu e compreendeu as informações sobre uso de dados pessoais,
                e concordou com o cadastro no sistema do Projeto Travessia conforme o método selecionado acima.
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={!lgpdAceito}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="size-4" />
              Salvar cadastro
            </button>
            <button
              type="button"
              onClick={() => setAba("dados")}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[48px]"
            >
              Voltar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
