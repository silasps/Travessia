"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

const ERROR_MESSAGES: Record<string, string> = {
  nao_cadastrado: "Usuário não cadastrado. Entre em contato com a coordenação.",
  auth: "Falha na autenticação. Tente novamente.",
};

export function LoginForm({ errorCode }: { errorCode?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error("Credenciais inválidas. Verifique seu e-mail e senha.");
      setLoading(false);
      return;
    }

    // (staff)/layout.tsx redireciona não-staff para /meu-espaco automaticamente
    router.replace("/painel");
  }

  async function handleMagicLink() {
    const email = getValues("email");
    if (!email) {
      toast.error("Informe seu e-mail antes de solicitar o link.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);

    if (error) {
      toast.error("Não foi possível enviar o link. Tente novamente.");
    } else {
      toast.success("Link enviado! Verifique sua caixa de entrada.");
    }
  }

  const errorMsg = errorCode ? ERROR_MESSAGES[errorCode] : null;

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <AlertTriangle className="size-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="pl-9"
              autoComplete="email"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-xs">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-9"
              autoComplete="current-password"
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="text-destructive text-xs">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Entrar"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={loading}
          onClick={handleMagicLink}
        >
          Receber link por e-mail
        </Button>
      </form>
    </div>
  );
}
