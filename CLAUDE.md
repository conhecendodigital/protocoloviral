# CLAUDE.md — Protocolo Viral SaaS

## O Que É

**Protocolo Viral** é um SaaS brasileiro de criação de conteúdo para Instagram, criado por **Matheus Soares** (@conhecendodigital). A plataforma ajuda criadores de conteúdo a gerar roteiros de Reels virais, otimizar perfis e estruturar estratégias de vendas — tudo com IA personalizada ao nicho e tom de voz do cliente.

**Público-alvo:** Criadores de conteúdo, infoprodutores, coaches, donos de negócios locais que usam Instagram como canal de vendas.  
**Modelo de negócio:** Freemium (plano free com limites) + assinatura mensal via MercadoPago.  
**URL do Repo:** https://github.com/conhecendodigital/protocoloviral  
**Stack:** Next.js 14 (App Router) + TypeScript + Supabase + Vercel  

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router), React, TypeScript, Framer Motion |
| Estilo | CSS Modules + Tailwind-like custom classes (`glass-card`, `shimmer-btn`) |
| Backend | Next.js API Routes (`src/app/api/`) |
| Banco de Dados | Supabase (PostgreSQL + pgvector + Auth + Storage) |
| IA — Free | OpenAI GPT-4o-mini |
| IA — Premium | Anthropic Claude 3.5 Sonnet |
| IA — Agentes | Google Gemini 2.0 Flash (padrão), OpenAI, Anthropic (configurável por agente) |
| Embeddings | OpenAI `text-embedding-3-small` (1536 dimensões) |
| Pesquisa Real | Serper.dev (Google Search API) |
| Pagamento | MercadoPago (Checkout Pro + Webhook) |
| Automação | N8N (análise de vídeos virais) |
| Deploy | Vercel |

---

## Variáveis de Ambiente (11 chaves)

```
# Obrigatórias
NEXT_PUBLIC_SUPABASE_URL=https://vskmryemztaalmrftlpo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...

# Premium
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AI...
SERPER_API_KEY=...

# Pagamento
MP_ACCESS_TOKEN=APP_USR-...
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-...
NEXT_PUBLIC_APP_URL=https://protocoloviral.com.br

# Automação
N8N_WEBHOOK_URL=https://...
```

---

## Banco de Dados (Supabase)

### Tabelas Ativas (10)

| Tabela | Linhas | Função |
|---|---|---|
| `profiles` | 48 | Perfil do usuário: DNA (público, dor, diferencial, propósito, produto), plano, MercadoPago, tokens |
| `formatos` | 25 | Formatos virais analisados (30 colunas: titulo, nicho, estudo, link_original, etc.) |
| `voice_profiles` | 4 | Perfis de tom de voz (energia, humor, bordões, palavras preferidas/evitadas, enriched_profile JSON) |
| `roteiros` | 24 | Roteiros gerados pelo Roteirista (titulo, roteiro, nicho, user_id) |
| `agents` | 5 | Agentes de chat customizáveis (name, system_prompt, ai_provider, ai_model, required_plan) |
| `chat_sessions` | 3 | Sessões de chat com agentes |
| `chat_messages` | 14 | Mensagens individuais de chat |
| `creditos_mensais` | 7 | Créditos de uso para planos pagos (credits_total, credits_used, period) |
| `memorias_usuario` | 0 | Memórias RAG por usuário (content, embedding vector(1536), content_type) |
| `user_credits` | 48 | Sistema alternativo de créditos (legado, não usado pelo código atual) |

### Tabelas Auxiliares (mantidas mas vazias)
| Tabela | Função |
|---|---|
| `achievements` | Gamificação — usado por `use-gamification.ts` |
| `knowledge_base_files` | Upload de docs para agentes — usado por `agentes/novo` e `agentes/[id]/editar` |

### Função RPC
- `match_memorias(query_embedding, match_threshold, match_count, filter_user_id)` — busca semântica por similaridade de cosseno na tabela `memorias_usuario`

---

## Arquitetura de API Routes

```
src/app/api/
├── analyze-bio/        → POST: Análise de bio com GPT-4o-mini (7 critérios + bio sugerida)
├── analyze-voice/      → Análise de voz
├── auth/callback/      → OAuth callback do Supabase
├── chat/               → POST: Chat com agentes (Gemini/OpenAI/Anthropic configurável)
│   └── preview/        → POST: Preview de chat
├── checkout/
│   ├── mercadopago/    → POST: Cria preferência de pagamento MP
│   ├── mercadopago-transparent/ → POST: Checkout transparente
│   └── cancel/         → POST: Cancela assinatura
├── enhance-answer/     → POST: Enriquece respostas do perfil com Gemini
├── enrich-voice/       → POST: Gera perfil de voz enriquecido com GPT-4o-mini
├── formatos/
│   ├── analyze/        → POST: Dispara análise de vídeo via N8N
│   └── check/          → GET: Polling do status da análise
├── generate-reel/      → POST: Gera roteiro via Gemini 2.0 Flash (versão legada dos Prompts)
├── memorias/           → POST: Salva memória + embedding no pgvector
├── roteirista/         → POST: Motor principal de roteirização (Claude/GPT + CoT + RAG + Serper)
└── webhooks/
    └── mercadopago/    → POST: Webhook de pagamento (ativa/desativa plano)
```

---

## O Roteirista — Motor Principal

### Fluxo de Execução
```
Cliente digita ideia + escolhe formato
          ↓
POST /api/roteirista
          ↓
┌─────────────────────────────────────────┐
│ 1. Autentica usuário (Supabase Auth)    │
│ 2. Carrega perfil (DNA do cliente)      │
│ 3. Carrega tom de voz (voice_profiles)  │
│ 4. Carrega formato (formatos + prompts  │
│    matadores + REGRA DE PARIDADE)       │
│ 5. Pesquisa Google (Serper, se search)  │
│ 6. Busca memórias RAG (pgvector)        │
│ 7. Monta systemPrompt com tudo junto    │
│ 8. Injeta Chain of Thought [THINKING]   │
│ 9. Injeta regra de linguagem simples    │
│ 10. Seleciona modelo (GPT-4o-mini free  │
│     ou Claude Sonnet premium)           │
│ 11. Streama resposta                    │
│ 12. Salva roteiro no Supabase           │
│ 13. Salva memória para RAG futuro       │
└─────────────────────────────────────────┘
          ↓
Frontend limpa tags [THINKING] com RegEx
          ↓
Cliente vê apenas o [ROTEIRO_FINAL]
```

### Contextos Injetados no Prompt
1. **baseSystemPrompt** — Skill do Roteirista Pro (pro-context.ts: regras de validação, template de output, regras universais)
2. **voiceContext** — Tom de voz do cliente (enriched_profile com eixos tonais, sample outputs, bordões)
3. **formatContext** — Formato viral escolhido (estudo + prompts matadores + regra de paridade de blocos/palavras)
4. **serperContext** — Resultados do Google em tempo real (mode=search)
5. **memoryContext** — Roteiros passados similares via pgvector (mode=premium)
6. **onboardingContext** — Regras de co-criação
7. **Regra de Linguagem** — Obriga linguagem simples ("como se explicasse para uma pessoa de 12 anos")
8. **Chain of Thought** — Bloco [THINKING] com 5 checkpoints de qualidade

### Prompts Matadores
Arquivo `prompts_matadores.ts` contém 11 prompts específicos por nicho:
bastidores, problema/solução, tutorial, react, curiosidade, nutrição, lista, ancoragem, preguiçoso, pergunta/resposta, ensino oculto, dica útil

---

## Telas do Dashboard (14 páginas)

### Conectadas ao Backend ✅
| Tela | Rota | Backend |
|---|---|---|
| Dashboard Home | `/` | Supabase (profiles via useProfile) |
| Roteirista | `/roteirista` | API roteirista (Claude/GPT + RAG + Serper) |
| Tom de Voz | `/tom-de-voz` | Supabase (voice_profiles) + API enrich-voice |
| Formatos | `/formatos` | Supabase (formatos) + N8N |
| Agentes | `/agentes` | Supabase (agents, chat_sessions, chat_messages, knowledge_base_files) + Multi-AI |
| Roteiros | `/roteiros` | Supabase (roteiros) |
| Assinatura | `/assinatura` | Supabase (profiles) + MercadoPago |
| Perfil | `/perfil` | Supabase (profiles) |
| Prompts | `/prompts/[tipo]` | Supabase (profiles) + API generate-reel |
| Bio Analyzer | `/bio-analyzer` | API analyze-bio (GPT-4o-mini com 7 critérios) |

### Estáticas (sem backend) ⚠️
| Tela | Rota | Fonte |
|---|---|---|
| Ganchos Virais | `/ganchos` | Arquivo `@/data/ganchos` (hardcoded) |
| Stories que Vendem | `/stories` | Arquivo `@/data/stories-frameworks` (hardcoded) |
| Calculadora Métricas | `/calculadora` | Cálculos JavaScript locais |
| Rotina Semanal | `/rotina` | useState (perde dados ao recarregar, sem persistência) |
| Jornada | `/jornada` | useProfile + localStorage (híbrida — parcialmente persistente) |

---

## Sistema de Planos e Limites

| Recurso | Free | Assinante |
|---|---|---|
| Tokens de IA/dia | 5.000 | 600.000 |
| Modelo do Roteirista | GPT-4o-mini | Claude 3.5 Sonnet |
| Pesquisa Real (Serper) | ❌ | ✅ |
| Memória RAG | ❌ | ✅ |
| Análises de vídeo/dia | 3 | Ilimitado |
| Agentes exclusivos | ❌ | ✅ (via `required_plan`) |

### Fluxo de Pagamento
1. Cliente clica "Assinar" → `/api/checkout/mercadopago` cria preferência
2. MercadoPago processa → Webhook `/api/webhooks/mercadopago` ativa o plano
3. `profiles.plan_tier` muda de `free` para o tier pago
4. Cancelamento via `/api/checkout/cancel` → seta `cancel_at_period_end = true`
5. Downgrade automático quando `current_period_end` expira

---

## Segurança

- **RLS** (Row Level Security) ativo em `memorias_usuario` e `creditos_mensais`
- **Rate Limiting** em memória: chat (30/min), enhance (15/min), generate-reel (10/min)
- **CSP Headers** configurados em `next.config.ts` (script-src, connect-src, frame-src)
- **HSTS** com preload (63072000s)
- Chaves de API exclusivamente em variáveis de ambiente (nunca no código)

---

## Arquivos Importantes

```
src/app/api/roteirista/
├── route.ts            → Motor principal (380 linhas)
├── pro-context.ts      → Skill do Roteirista Pro + Contexto do Criador
└── prompts_matadores.ts → 11 prompts matadores por nicho

src/hooks/
├── use-profile.ts      → Hook que carrega DNA do usuário
└── use-gamification.ts → Hook de conquistas

src/lib/
├── supabase/server.ts  → Client SSR do Supabase
├── supabase/client.ts  → Client Browser do Supabase
└── rate-limit.ts       → Rate limiting em memória

src/data/
├── ganchos.ts          → Banco de ganchos virais (estático)
├── stories-frameworks.ts → Frameworks de Stories (estático)
├── achievements.ts     → Definições de conquistas
└── jornada-estacoes.ts → Estações da jornada de conteúdo
```

---

## Nota sobre Supabase Compartilhado

O banco Supabase `vskmryemztaalmrftlpo` é compartilhado entre o SaaS (Protocolo Viral) e o bot pessoal do criador (Jerody/Telegram). A tabela `memoria_vendedor` (33 linhas) pertence ao Jerody e não ao SaaS. Recomendado separar em projetos distintos no futuro.
