"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Plus, Mail, Lock, User, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { convidarStaff } from "@/lib/actions/convidar-staff";
import type { StaffRole } from "@/types/database";

const PAPEIS: { value: StaffRole; label: string; desc: string }[] = [
  { value: "coordenacao", label: "Coordenação", desc: "Avalia ocorrências, gerencia equipe, relatórios" },
  { value: "tecnico", label: "Técnico", desc: "Prontuários, PIA, evolução, encaminhamentos" },
  { value: "cuidador", label: "Cuidador", desc: "Registra ocorrências, visualiza dados básicos" },
];

type MetodoAcesso = "convite" | "senha";

export function ConvidarStaffModal() {
  const [open, setOpen] = useState(false);
  const [papel, setPapel] = useState<StaffRole>("tecnico");
  const [metodo, setMetodo] = useState<MetodoAcesso>("senha");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string).trim();
    const nomeCompleto = (fd.get("nome_completo") as string).trim();
    const cargo = (fd.get("cargo") as string)?.trim() || undefined;
    const senha = metodo === "senha" ? (fd.get("senha") as string)?.trim() : undefined;

    if (!email || !nomeCompleto) {
      toast.error("Preencha o nome e o e-mail.");
      return;
    }
    if (metodo === "senha" && (!senha || senha.length < 6)) {
      toast.error("A senha precisa ter ao menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const res = await convidarStaff({ email, nomeCompleto, cargo, papel, senha });
    setLoading(false);

    if ("error" in res) {
      toast.error(res.error);
      return;
    }

    toast.success(
      metodo === "convite"
        ? `Convite enviado para ${email}!`
        : `Conta criada para ${nomeCompleto}. Comunique a senha.`
    );
    setOpen(false);
    setPapel("tecnico");
    setMetodo("senha");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2 bg-sky-500 hover:bg-sky-600 text-white min-h-[44px]" />
        }
      >
        <Plus className="size-4" />
        Convidar funcionário
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-4 text-sky-500" />
            Convidar Funcionário
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="inv_nome">Nome completo *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                id="inv_nome"
                name="nome_completo"
                placeholder="Nome do funcionário"
                required
                className="pl-9 rounded-xl"
              />
            </div>
          </div>

          {/* Cargo */}
          <div className="space-y-1.5">
            <Label htmlFor="inv_cargo">Cargo / Função</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                id="inv_cargo"
                name="cargo"
                placeholder="Ex: Assistente Social, Educador..."
                className="pl-9 rounded-xl"
              />
            </div>
          </div>

          {/* E-mail */}
          <div className="space-y-1.5">
            <Label htmlFor="inv_email">E-mail *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                id="inv_email"
                name="email"
                type="email"
                placeholder="email@exemplo.com"
                required
                className="pl-9 rounded-xl"
              />
            </div>
          </div>

          {/* Papel */}
          <div className="space-y-1.5">
            <Label>Nível de acesso *</Label>
            <div className="space-y-2">
              {PAPEIS.map((p) => (
                <label
                  key={p.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    papel === p.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    checked={papel === p.value}
                    onChange={() => setPapel(p.value)}
                    className="mt-0.5 text-blue-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Método de acesso */}
          <div className="space-y-1.5">
            <Label>Como o funcionário vai acessar?</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMetodo("senha")}
                className={`p-3 rounded-xl border-2 text-left transition-colors ${
                  metodo === "senha" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="text-sm font-medium text-gray-900">Definir senha</p>
                <p className="text-xs text-muted-foreground mt-0.5">Você cria a senha e comunica</p>
              </button>
              <button
                type="button"
                onClick={() => setMetodo("convite")}
                className={`p-3 rounded-xl border-2 text-left transition-colors ${
                  metodo === "convite" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="text-sm font-medium text-gray-900">Enviar convite</p>
                <p className="text-xs text-muted-foreground mt-0.5">Ele define a própria senha</p>
              </button>
            </div>
          </div>

          {metodo === "senha" && (
            <div className="space-y-1.5">
              <Label htmlFor="inv_senha">Senha inicial *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  id="inv_senha"
                  name="senha"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                  className="pl-9 rounded-xl"
                />
              </div>
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                Anote esta senha e comunique ao funcionário em particular.
              </p>
            </div>
          )}

          {metodo === "convite" && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-800">
                Um e-mail será enviado para o funcionário com um link para definir sua própria senha e acessar o sistema.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-sky-500 hover:bg-sky-600">
              {loading ? "Criando..." : metodo === "convite" ? "Enviar convite" : "Criar conta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
