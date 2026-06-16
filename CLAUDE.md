# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O projeto

Sistema de gestão do **Projeto Travessia** — OSC de acolhimento institucional para homens em situação de rua em Ribeirão Preto/SP. Gerencia prontuários (residentes), ocorrências, PIA (Plano Individual de Atendimento), documentação, transparência pública e portal do residente.

Stack: **Next.js 16** (App Router, Turbopack) + **Supabase** (auth + postgres) + **Tailwind v4** + shadcn/ui.

## Comandos

```bash
npm run dev      # dev server (Turbopack)
npm run build    # build de produção
npm run lint     # eslint
```

Sem testes automatizados no projeto.

## Modo DEV sem banco

Quando `NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co"` (ou sem `.env.local`), o sistema entra em **DEV_MODE**: bypassa autenticação, usa dados fictícios de `lib/mock-data.ts` e exibe banner amarelo. Todas as pages e layouts verificam essa flag.

## Arquitetura de rotas

```
app/
  (public)/           — home institucional + portal transparência (sem auth)
  (auth)/             — login + callback OAuth/magic-link
  (staff)/painel/     — painel de gestão (equipe interna)
    residentes/       — lista + prontuário por abas (dados, docs, evolução, família, PIA, ocorrências)
    ocorrencias/      — lista + detalhe + nova
    relatorios/       — entradas/saídas
    configuracoes/    — equipe, audit log, config do sistema
  (residente)/meu-espaco/ — portal do acolhido (evolução, docs, perfil)
```

## Autenticação e RBAC

- Auth via Supabase SSR (cookies) — `lib/supabase/server.ts` (Server Components), `lib/supabase/client.ts` (Client Components).
- Roles: `super_admin > coordenacao > tecnico > cuidador` — tabela `staff_roles`, lógica em `lib/rbac.ts`.
- `super_admin` pode simular outras roles via cookie `pt_preview_role` (sem novo login).
- Residentes acessam o portal via tabela `residente_portals` (liga `auth.users` → `residentes`).
- Middleware em `middleware.ts` redireciona não-autenticados para `/login`; usuários autenticados tentando acessar `/login` vão para `/painel`.

## Tabelas principais do Supabase

| Tabela | Propósito |
|---|---|
| `staff_profiles` | Perfil da equipe (nome, CPF, cargo…) |
| `staff_roles` | Role por usuário (1:1 com auth.users) |
| `residentes` | Prontuário do acolhido |
| `ocorrencias` | Registro de incidentes |
| `pia` | Plano Individual de Atendimento (jsonb por seção) |
| `documentos` | Checklist de documentos do residente |
| `notificacoes` | Notificações in-app |
| `residente_portals` | Vínculo user_id → residente_id |
| `configuracoes_sistema` | Config chave/valor (ex: `capacidade_total`) |
| `documentos_publicos` | Docs do portal de transparência |

Migrations em `supabase/migrations/`. RLS ativo em todas as tabelas.

## Padrões de UI

- Mobile first. Layout staff: sidebar fixa desktop (w-64) + bottom nav mobile.
- Cards com `rounded-2xl border border-gray-100 bg-white`. Hover: `hover:border-blue-200 hover:bg-blue-50/20`.
- Badges de status/fase: inline, `rounded-full`, cores semânticas (blue=ativo, green=obtido, amber=pendente, red=grave).
- Ações destrutivas usam `bg-destructive` (vermelho); primárias usam `bg-blue-700`.
- Formulários com `react-hook-form` + `zod`. Toasts via `sonner`.
- Ícones: `lucide-react` exclusivamente.
- Componentes shadcn/ui em `components/ui/`. Componentes de domínio em `components/residentes/`, `components/dashboard/` etc.
- Tabs no prontuário do residente navegam via `?aba=<id>` na URL (sem estado client-side).

## Dados sensíveis

CPF e dados pessoais dos acolhidos estão sujeitos à LGPD. O sistema registra consentimento (`lgpd_consent_at`, `lgpd_consent_method`) e tem audit log (`lib/actions/` + tabela de auditoria). Nunca exiba CPF completo — use `maskCPF()` de `lib/utils/format.ts`.
