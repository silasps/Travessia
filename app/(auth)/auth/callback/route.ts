import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? null;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // Se um destino foi explicitamente solicitado (ex: staff reset de senha), respeitar
  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // ── Determinar para onde redirecionar com base no tipo de usuário ──────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // 1. Membro da equipe → painel
  const { data: roleRow } = await supabase
    .from("staff_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleRow) {
    return NextResponse.redirect(`${origin}/painel`);
  }

  // 2. Acolhido já vinculado e ativo → portal
  const { data: portal } = await supabase
    .from("residente_portals")
    .select("is_active")
    .eq("user_id", user.id)
    .single();

  if (portal?.is_active) {
    return NextResponse.redirect(`${origin}/meu-espaco`);
  }

  // 3. Acolhido pré-cadastrado por e-mail (user_id ainda null) → vincular e ativar
  if (user.email) {
    const admin = await createAdminClient();
    const { data: portalPorEmail } = await admin
      .from("residente_portals")
      .select("id")
      .eq("email_portal", user.email.toLowerCase())
      .is("user_id", null)
      .single();

    if (portalPorEmail) {
      await admin
        .from("residente_portals")
        .update({
          user_id: user.id,
          is_active: true,
          activated_at: new Date().toISOString(),
        })
        .eq("id", portalPorEmail.id);

      return NextResponse.redirect(`${origin}/meu-espaco`);
    }
  }

  // 4. Nenhum vínculo encontrado → negar acesso
  await supabase.auth.signOut();
  return NextResponse.redirect(`${origin}/login?error=nao_cadastrado`);
}
