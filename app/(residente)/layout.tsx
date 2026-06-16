import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Home, User, TrendingUp, FileText, LogOut, X } from "lucide-react";

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

function PreviewBanner() {
  return (
    <div className="bg-amber-400 text-amber-950 text-sm font-medium flex items-center justify-between px-4 py-2">
      <span>Modo de visualização — <strong>Acolhido</strong></span>
      <a
        href="/painel"
        className="flex items-center gap-1 text-xs font-semibold hover:underline opacity-80 hover:opacity-100"
      >
        <X className="size-3.5" />
        Voltar ao painel
      </a>
    </div>
  );
}

const NAV_ITEMS = [
  { href: "/meu-espaco", label: "Início", icon: Home },
  { href: "/meu-espaco/meu-perfil", label: "Meu Perfil", icon: User },
  { href: "/meu-espaco/minha-evolucao", label: "Minha Evolução", icon: TrendingUp },
  { href: "/meu-espaco/meus-documentos", label: "Documentos", icon: FileText },
];

export default async function ResidenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isSuperAdminPreview = DEV_MODE;

  if (!DEV_MODE) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Qualquer membro da equipe pode acessar /meu-espaco para preview
    const { data: roleRow } = await supabase
      .from("staff_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleRow) {
      isSuperAdminPreview = true;
    } else {
      const { data: portal } = await supabase
        .from("residente_portals")
        .select("residente_id, is_active")
        .eq("user_id", user.id)
        .single();

      if (!portal?.is_active) redirect("/login");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {isSuperAdminPreview && <PreviewBanner />}
      {/* Header */}
      <header className="bg-sky-600 text-white px-4 py-4 sticky top-0 z-20">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-sky-600 text-xs font-bold">PT</span>
          </div>
          <p className="text-base font-semibold">Meu Espaço</p>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full pb-24">
        {children}
      </main>

      {/* Bottom nav — mobile first */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-border z-20">
        <div className="max-w-lg mx-auto flex items-stretch">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] text-muted-foreground hover:text-sky-600 transition-colors"
            >
              <item.icon className="size-6" />
              <span className="text-[11px] font-medium leading-none">{item.label}</span>
            </Link>
          ))}
          <form
            action={async () => {
              "use server";
              if (process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co") {
                const { createClient: createSC } = await import("@/lib/supabase/server");
                const sc = await createSC();
                await sc.auth.signOut();
              }
              redirect("/login");
            }}
            className="flex-1"
          >
            <button
              type="submit"
              className="w-full h-full flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="size-6" />
              <span className="text-[11px] font-medium leading-none">Sair</span>
            </button>
          </form>
        </div>
      </nav>
    </div>
  );
}
