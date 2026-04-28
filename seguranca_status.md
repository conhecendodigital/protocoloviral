# 🛡️ Status da Implementação de Segurança

**Data:** 28/04/2026
**Base:** auditoria_seguranca.md
**Branch:** main

---

## ✅ FEITO — Implementado no código

### CRÍTICAS (3/3)

| ID | Correção | Arquivos |
|----|----------|----------|
| **CRIT-01** | Atualizado `config.matcher` em `proxy.ts` para excluir `/api/`. Em Next.js 16 o `proxy.ts` já é o nome oficial do middleware (renomeado de `middleware.ts`), então o auth do dashboard **já estava ativo** — a auditoria foi escrita assumindo Next ≤15. Nosso fix corrige o matcher que antes redirecionava chamadas API anônimas para `/login`. | `src/proxy.ts` |
| **CRIT-02** | Adicionado `.eq('user_id', user.id)` nas queries de `agents` para prevenir IDOR (acesso a agentes de outros usuários). | `src/app/api/roteirista/route.ts:70`<br>`src/app/api/chat/route.ts:33` |
| **CRIT-03** | Adicionado `.eq('user_id', user.id)` no UPDATE de `voice_profiles`. | `src/app/api/enrich-voice/route.ts:184` |

### ALTAS (3/3 implementáveis — HIGH-03 deferida)

| ID | Correção | Arquivos |
|----|----------|----------|
| **HIGH-01** | Cookie admin passou a ser HMAC-SHA256-assinado com expiração de 24h e comparação timing-safe. Adicionado rate-limit de 5 tentativas/min no login (anti brute-force). Criado endpoint server-side de logout. | `src/lib/admin-auth.ts` *(novo)*<br>`src/app/api/admin/login/route.ts`<br>`src/app/api/admin/logout/route.ts` *(novo)*<br>`src/app/api/admin/metrics/route.ts`<br>`src/app/(admin)/admin/layout.tsx`<br>`src/app/(admin)/admin/page.tsx`<br>`src/app/(admin)/admin/users/page.tsx`<br>`src/app/(admin)/admin/users/[id]/page.tsx`<br>`src/app/(admin)/admin/apis/page.tsx`<br>`src/app/(admin)/admin/apis/[model]/page.tsx`<br>`src/app/(admin)/admin/logout-button.tsx` |
| **HIGH-02** | Validação de assinatura do webhook MercadoPago é agora **obrigatória** (fail-closed). Sem `MP_WEBHOOK_SECRET` ou sem header `x-signature`, o endpoint retorna 401/500. | `src/app/api/webhooks/mercadopago/route.ts` |
| **HIGH-04** | Endpoint `/api/formatos/check` agora exige autenticação. | `src/app/api/formatos/check/route.ts` |

### MÉDIAS (3/4 — MED-03 deferida)

| ID | Correção | Arquivos |
|----|----------|----------|
| **MED-01** | Removido `'unsafe-eval'` da diretiva `script-src` da CSP. | `next.config.ts:42` |
| **MED-02** | Substituído `error.message` por mensagens genéricas em 4 rotas (mantém `console.error` server-side). | `src/app/api/analyze-voice/route.ts`<br>`src/app/api/roteirista/improve-block/route.ts`<br>`src/app/api/generate-reel/route.ts` (2 lugares)<br>`src/app/api/checkout/mercadopago/route.ts` |
| **MED-04** | Validação anti open-redirect no parâmetro `next` do callback OAuth. | `src/app/api/auth/callback/route.ts:9` |

### BAIXAS (1/2 — LOW-01 deferida)

| ID | Correção | Arquivos |
|----|----------|----------|
| **LOW-02** | Gemini API key migrada de query string para header `x-goog-api-key`. | `src/app/api/enhance-answer/route.ts`<br>`src/app/api/generate-reel/route.ts` |

### INFO

| ID | Status |
|----|--------|
| **INFO-01** | `proxy.ts` deixou de ser código morto — em Next 16 já é o middleware oficial. |

---

## ⏳ FALTA FAZER — Ação manual antes do deploy

### 1. ✅ `ADMIN_SESSION_SECRET` (parcial)

- ✅ **Local (`.env.local`):** já configurado com valor `66e74571a9f74d372f74a860640869d7a453d4e710c495ac823ade4390b7083c`
- ❌ **Vercel:** **PENDENTE** — adicionar nas Environment Variables (Production + Preview + Development) com o **mesmo valor** acima e fazer Redeploy

### 2. ❌ `MP_WEBHOOK_SECRET` (não existe ainda)

**Sem isso, todos os pagamentos param de ativar planos automaticamente após o deploy.**

Passos:
1. Acessar https://www.mercadopago.com.br/developers/panel/app
2. Selecionar a aplicação do Protocolo Viral
3. Menu lateral → **Webhooks** → **Configurar notificações**
4. URL: `https://protocoloviral.com.br/api/webhooks/mercadopago`
5. Eventos a habilitar: `payment` + `subscription_preapproval`
6. Salvar — o MP gera automaticamente uma **Chave secreta** nessa tela
7. Copiar a chave
8. Adicionar `MP_WEBHOOK_SECRET=<valor>` na Vercel (Production + Preview + Development) e no `.env.local`
9. Redeploy

### 3. ⚠️ Trocar `ADMIN_PASSWORD` (recomendado)

A senha atual é `123456` — extremamente fraca. Recomenda-se trocar por uma senha forte (16+ chars com símbolos) tanto no `.env.local` quanto na Vercel.

### 4. 🧪 Testes pós-deploy

Depois que o deploy passar com as 3 envs configuradas, validar:

- [ ] `/admin/login` aceita senha e cria sessão (cookie tem formato `<iso>.<hash>`, não `authenticated`)
- [ ] Tentar setar manualmente cookie `pv_admin_auth=authenticated` no browser → deve negar acesso
- [ ] Webhook MP: enviar POST sem header `x-signature` → deve retornar 401
- [ ] Pagar uma assinatura de teste (sandbox MP) → conferir nos logs Vercel que o webhook retornou 200 e o `plan_tier` do usuário foi atualizado
- [ ] Logado como user A, abrir DevTools e tentar `POST /api/chat` com `agent_id` de outro usuário → deve retornar 404
- [ ] Acessar `/api/formatos/check?url=X` sem cookie → deve retornar 401
- [ ] Acessar `/api/auth/callback?code=X&next=//evil.com` → após auth, redirecionar para `/`, não para evil.com
- [ ] Inspecionar Network tab numa chamada ao Bio Analyzer → URL **não** deve conter `?key=AIza...`
- [ ] Forçar erro em `/api/generate-reel` → response **não** deve conter stack trace ou nome de campo interno
- [ ] Checkout MercadoPago → testar fluxo completo. Se o SDK quebrar por causa da CSP sem `unsafe-eval`, voltar e adicionar nonce dinâmico (caso de exceção)

---

## 🚫 DEFERIDOS — Para PRs separados

| ID | Razão | Próximo passo recomendado |
|----|-------|---------------------------|
| **HIGH-03** | Migrar rate-limit em memória → Upstash Redis. Requer provisionar conta Upstash, adicionar `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`, refatorar `src/lib/rate-limit.ts` e atualizar 10 rotas. | **Próxima prioridade.** Em serverless o Map em memória zera a cada cold start, deixando o rate-limit ineficaz. |
| **MED-03** | `getSession()` no client → `getUser()` em hooks. Toca `src/hooks/use-profile.ts`, `src/hooks/use-voice-profiles.ts` e `src/app/(dashboard)/roteirista/page.tsx`. Risco de regressão no frontend. | Sprint dedicado ao frontend. As API routes já fazem `getUser()` server-side, o que mitiga parcialmente. |
| **LOW-01** | Remover `typescript: { ignoreBuildErrors: true }` do `next.config.ts`. Pode revelar dezenas de erros TS escondidos. | Sprint dedicado para limpar tipos. Recomendo fazer **antes** de novas features grandes. |

---

## 📊 Resumo

| | Quantidade |
|---|---|
| Vulnerabilidades corrigidas no código | **10/14** |
| Arquivos novos criados | 2 (`admin-auth.ts`, `logout/route.ts`) |
| Arquivos modificados | 19 |
| Build status | ✅ `npm run build` passa em 9.6s |
| Ações manuais pendentes | 3 (Vercel env, MP webhook, trocar senha) |
| Itens deferidos | 3 (HIGH-03, MED-03, LOW-01) |

**Bloqueadores para deploy seguro:** configurar `ADMIN_SESSION_SECRET` e `MP_WEBHOOK_SECRET` na Vercel.
