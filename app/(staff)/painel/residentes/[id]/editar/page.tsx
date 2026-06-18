"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { editarResidente } from "@/lib/actions/residentes";
import { getMockResidente } from "@/lib/mock-data";

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

interface ResidenteData {
  id: string;
  nome_completo: string;
  nome_social: string | null;
  data_nascimento: string | null;
  cpf: string | null;
  rg: string | null;
  nis: string | null;
  naturalidade: string | null;
  numero_prontuario: string;
  fase_atual: number;
  status: string;
  data_entrada: string;
  data_saida: string | null;
  motivo_saida: string | null;
  tempo_situacao_rua: string | null;
  ultimo_endereco: string | null;
}

export default function EditarResidentePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [r, setR] = useState<ResidenteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    if (DEV_MODE) {
      const mock = getMockResidente(id);
      if (mock) setR(mock as ResidenteData);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    supabase
      .from("residentes")
      .select("id, nome_completo, nome_social, data_nascimento, cpf, rg, nis, naturalidade, numero_prontuario, fase_atual, status, data_entrada, data_saida, motivo_saida, tempo_situacao_rua, ultimo_endereco")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setR(data as ResidenteData);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="text-muted-foreground p-4">Carregando...</p>;
  if (!r) return <p className="text-muted-foreground p-4">Acolhido não encontrado.</p>;

  const nomeExibido = r.nome_social ?? r.nome_completo;

  if (salvo) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Dados atualizados</h2>
        <p className="text-sm text-gray-600">As alterações foram salvas no prontuário.</p>
        <Link
          href={`/painel/residentes/${id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 transition-colors min-h-[44px] mt-4"
        >
          Voltar ao prontuário
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => (fd.get(k) as string)?.trim() || undefined;

    if (DEV_MODE) { setSalvo(true); return; }

    setSalvando(true);
    const res = await editarResidente({
      id,
      nome_completo: fd.get("nome_completo") as string,
      nome_social: get("nome_social"),
      data_nascimento: get("data_nascimento"),
      cpf: get("cpf"),
      rg: get("rg"),
      nis: get("nis"),
      naturalidade: get("naturalidade"),
      tempo_situacao_rua: get("tempo_situacao_rua"),
      ultimo_endereco: get("ultimo_endereco"),
    });
    setSalvando(false);

    if ("error" in res) { toast.error(res.error); return; }
    toast.success("Dados atualizados com sucesso!");
    setSalvo(true);
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-5">
      <Link
        href={`/painel/residentes/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Prontuário
      </Link>

      <div>
        <p className="text-xs text-muted-foreground">Editando</p>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{nomeExibido}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{r.numero_prontuario}</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Identificação */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
          <h2 className="font-semibold text-gray-900">Identificação</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo</label>
            <input type="text" name="nome_completo" defaultValue={r.nome_completo} required
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome social <span className="text-xs text-muted-foreground">(opcional)</span>
            </label>
            <input type="text" name="nome_social" defaultValue={r.nome_social ?? ""}
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Data de nascimento</label>
              <input type="date" name="data_nascimento" defaultValue={r.data_nascimento ?? ""}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CPF</label>
              <input type="text" name="cpf" defaultValue={r.cpf ?? ""} placeholder="000.000.000-00" maxLength={14}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">RG</label>
              <input type="text" name="rg" defaultValue={r.rg ?? ""}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">NIS / CadÚnico</label>
              <input type="text" name="nis" defaultValue={r.nis ?? ""}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Naturalidade</label>
            <input type="text" name="naturalidade" defaultValue={r.naturalidade ?? ""} placeholder="Cidade/UF"
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        {/* Situação de rua */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
          <h2 className="font-semibold text-gray-900">Situação de rua</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tempo em situação de rua
            </label>
            <input type="text" name="tempo_situacao_rua" defaultValue={r.tempo_situacao_rua ?? ""} placeholder='Ex: "8 meses", "2 anos"'
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Último endereço conhecido</label>
            <input type="text" name="ultimo_endereco" defaultValue={r.ultimo_endereco ?? ""}
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        {/* Info somente leitura */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-2">
          <h2 className="font-semibold text-gray-700 text-sm">Informações do programa (somente leitura)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Prontuário</p>
              <p className="font-medium font-mono">{r.numero_prontuario}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fase</p>
              <p className="font-medium">Fase {r.fase_atual}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{r.status}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Entrada</p>
              <p className="font-medium">{r.data_entrada}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Para alterar fase ou status, use os controles no prontuário.
          </p>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors min-h-[48px] disabled:opacity-50"
          >
            <Save className="size-4" />
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
          <Link
            href={`/painel/residentes/${id}`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[48px]"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
