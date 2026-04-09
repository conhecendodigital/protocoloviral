# Reformulação Mapa do Engajamento v3.0 — Plano Função por Função

Transformar a plataforma atual em SaaS de produção de conteúdo com IA nativa, sem quebrar nada que já existe. Cada função é implementada e testada individualmente.

---

## Comparação: IAs de Pesquisa em Tempo Real

> [!IMPORTANT]
> **Existem 3 alternativas principais além da Perplexity**, e uma delas é **5x mais barata**:

| API | O que faz | Preço por query | 150K queries/mês (1000 clientes) | Observação |
|-----|-----------|----------------|----------------------------------|------------|
| **Serper** ⭐ | Google Search API direto — retorna resultados do Google em 1-2s | **$0.001** (~R$ 0.005) | **~$150/mês** (~R$ 825) | Mais barato, dados reais do Google, sem IA embutida |
| **Tavily** | Search engine para agentes IA — já retorna dados limpos e estruturados | **$0.008** (~R$ 0.044) | **~$1.200/mês** (~R$ 6.600) | Mais prático, mas 8x mais caro que Serper |
| **Perplexity** | Search + IA — pesquisa e já gera resposta com análise | **~$0.005** (~R$ 0.027) | **~$750/mês** (~R$ 4.125) | IA embutida, mas custo alto para volume |
| **Brave Search** | Índice próprio fora do Google | **Grátis** (até 2K/mês) | Impraticável para SaaS | Só serve para protótipos |

### Recomendação: **Serper + Claude**

A combinação mais inteligente para o seu caso:
1. **Serper** busca os dados em tempo real no Google (R$ 0.005 por busca)
2. **Claude Sonnet** processa os resultados e gera o roteiro contextualizado

**Custo total por pesquisa profunda**: ~$0.017 (Serper $0.001 + Claude $0.016) = **R$ 0.09 por geração**

Com Perplexity seria: ~$0.021 = R$ 0.11 por geração (**20% mais caro**)

> [!TIP]
> **Economia anual com Serper vs Perplexity (1000 clientes):** ~$7.200/ano = **R$ 39.600** economizados

---

## Navegação Final Confirmada

Conforme o print da sidebar atual e suas instruções:

```
MENU PRINCIPAL (não-colapsável)
├── 🏠 Início              → /
├── 🎬 Formatos             → /formatos         🔥
├── ✍️ Roteirista           → /roteirista        ⭐ NOVO
├── 🤖 Escritório de IA     → /agentes           IA

ESTÚDIO (colapsável ▾)
├── 📄 Meus Roteiros        → /roteiros
├── 🪝 Ganchos Virais       → /ganchos
├── 📱 Stories              → /stories
├── 📊 Analisador           → /bio-analyzer
├── 🧮 Calculadora          → /calculadora
├── 👤 Meu Perfil           → /perfil
├── 🎮 Jornada              → /jornada
├── 📅 Rotina               → /rotina

TOM DE VOZ (não-colapsável)
└── 🎭 Tom de Voz           → /tom-de-voz        ⭐ NOVO
```

**O que muda vs. menu atual (vide print):**
- ❌ Remove "Geradores" (`/prompts`) do menu principal
- ❌ Remove "Jornada" e "Rotina" do menu principal → vão para Estúdio
- ✅ Adiciona "Roteirista" (`/roteirista`) no menu principal
- ✅ Move "Escritório de IA" para o menu principal (sai da seção "IA")
- ✅ Perfil vai para dentro do Estúdio
- ✅ Nova seção "Tom de Voz" no final do menu

---

## Execução Função por Função

Cada função é uma etapa isolada. Só avança para a próxima depois de testar.

---

### FUNÇÃO 1: Reestruturar Navegação
**Risco: BAIXO** | **Arquivos: 2** | **Tempo: ~30min**

#### O que faz:
Altera o array `NAV_SECTIONS` no sidebar e no mobile-nav para a nova estrutura.

#### Arquivos modificados:
1. **[sidebar.tsx](file:///c:/Users/msoar/Downloads/oprompt%20(1)/mapa-do-engajamento/src/components/layout/sidebar.tsx)** — Alterar `NAV_SECTIONS`
2. **[mobile-nav.tsx](file:///c:/Users/msoar/Downloads/oprompt%20(1)/mapa-do-engajamento/src/components/layout/mobile-nav.tsx)** — Espelhar mesma estrutura

#### Mudança específica no `NAV_SECTIONS`:
```typescript
const NAV_SECTIONS: NavSection[] = [
  {
    id: 'menu',
    label: 'Menu',
    icon: 'menu',
    collapsible: false,
    items: [
      { label: 'Início', href: '/', msIcon: 'home' },
      { label: 'Formatos', href: '/formatos', msIcon: 'movie_filter', badge: '🔥', badgeHot: true },
      { label: 'Roteirista', href: '/roteirista', msIcon: 'edit_note', badge: '⭐', badgeHot: true },
      { label: 'Escritório de IA', href: '/agentes', msIcon: 'smart_toy', badge: 'IA', badgeHot: true },
    ],
  },
  {
    id: 'estudio',
    label: 'Estúdio',
    icon: 'tv_gen',
    collapsible: true,
    items: [
      { label: 'Meus Roteiros', href: '/roteiros', msIcon: 'description' },
      { label: 'Ganchos Virais', href: '/ganchos', msIcon: 'anchor', badge: '50' },
      { label: 'Stories', href: '/stories', msIcon: 'video_camera_front' },
      { label: 'Analisador', href: '/bio-analyzer', msIcon: 'monitoring' },
      { label: 'Calculadora', href: '/calculadora', msIcon: 'calculate' },
      { label: 'Meu Perfil', href: '/perfil', msIcon: 'person' },
      { label: 'Jornada', href: '/jornada', msIcon: 'explore' },
      { label: 'Rotina', href: '/rotina', msIcon: 'calendar_today' },
    ],
  },
  {
    id: 'voz',
    label: 'Tom de Voz',
    icon: 'record_voice_over',
    collapsible: false,
    items: [
      { label: 'Tom de Voz', href: '/tom-de-voz', msIcon: 'record_voice_over', badge: '⭐', badgeHot: true },
    ],
  },
]
```

#### Teste:
- [ ] Navegar por todas as rotas confirmando que nenhum link quebrou
- [ ] Verificar que "Estúdio" colapsa/expande corretamente
- [ ] Confirmar layout responsivo no mobile

---

### FUNÇÃO 2: Criar Redirect `/prompts` → `/roteirista`
**Risco: ZERO** | **Arquivos: 1 novo** | **Tempo: ~5min**

#### O que faz:
Garante que URLs antigas não quebrem se alguém tem bookmark.

#### Arquivo novo:
**[NEW] `src/app/(dashboard)/prompts/redirect.ts`** — Ou ajustar a page.tsx para redirecionar

```typescript
// src/middleware.ts — adicionar regra de redirect
// OU simplesmente adicionar no próximo deploy:
import { redirect } from 'next/navigation'
export default function PromptsPage() {
  redirect('/roteirista')
}
```

#### Teste:
- [ ] Acessar `/prompts` → deve redirecionar para `/roteirista`

---

### FUNÇÃO 3: Migração SQL — Tabelas Novas no Supabase
**Risco: BAIXO** | **Arquivos: 1 SQL** | **Tempo: ~15min**

#### O que faz:
Cria as 3 novas tabelas necessárias para o sistema completo.

#### Executar no SQL Editor do Supabase:

```sql
-- ═══════════════════════════════════════════
-- 1. TABELA: Perfis de Tom de Voz
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS voice_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sample_texts TEXT[] DEFAULT '{}',
  extracted_style JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own voices" ON voice_profiles
  FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 2. TABELA: Créditos Mensais
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS creditos_mensais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_total INTEGER DEFAULT 150,
  credits_used INTEGER DEFAULT 0,
  cycle_start TIMESTAMPTZ DEFAULT now(),
  cycle_end TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE creditos_mensais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own credits" ON creditos_mensais
  FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 3. TABELA: Memórias do Cérebro (pgvector)
-- ═══════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS memorias_usuario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'roteiro',
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memorias_embedding 
  ON memorias_usuario USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

ALTER TABLE memorias_usuario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own memories" ON memorias_usuario
  FOR ALL USING (auth.uid() = user_id);

-- Função de busca por similaridade
CREATE OR REPLACE FUNCTION match_memorias(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_user_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  content_type text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.content, m.content_type, m.metadata,
         1 - (m.embedding <=> query_embedding) AS similarity
  FROM memorias_usuario m
  WHERE m.user_id = filter_user_id
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

#### Teste:
- [ ] Verificar que as tabelas foram criadas no Supabase Dashboard
- [ ] Inserir um registro de teste em `voice_profiles` e confirmar RLS

---

### FUNÇÃO 4: Página do Tom de Voz (`/tom-de-voz`)
**Risco: BAIXO** | **Arquivos: 3 novos** | **Tempo: ~2h**

#### O que faz:
Página onde o usuário treina a IA com seu estilo de escrita.

#### Arquivos:
1. **[NEW] `src/app/(dashboard)/tom-de-voz/page.tsx`** — Página principal
2. **[NEW] `src/hooks/use-voice-profiles.ts`** — Hook CRUD para perfis de voz
3. **[NEW] `src/app/api/analyze-voice/route.ts`** — API que analisa os textos e extrai o estilo (usa GPT-4o-Mini, barato)

#### Fluxo da página:
1. Lista de perfis de voz do usuário (cards bonitos)
2. Botão "➕ Criar Novo Tom de Voz"
3. Modal/Formulário: nome + cola 3-5 textos de exemplo
4. Clica "Analisar" → GPT-4o-Mini extrai: vocabulário, ritmo, formalidade, emoções
5. Salva em `voice_profiles`
6. Card aparece na lista com preview do estilo extraído

#### Teste:
- [ ] Criar um perfil de voz com 3 textos de exemplo
- [ ] Verificar que a análise de estilo é salva corretamente em `extracted_style`
- [ ] Deletar um perfil e confirmar que some do banco

---

### FUNÇÃO 5: Hooks de Créditos (`use-credits.ts`)
**Risco: BAIXO** | **Arquivos: 1 novo** | **Tempo: ~1h**

#### O que faz:
Hook React que gerencia créditos: consultar saldo, descontar, resetar ciclo.

#### Arquivo:
**[NEW] `src/hooks/use-credits.ts`**

#### Funcionalidades:
- `credits` — saldo atual (total - usado)
- `isLoading` — estado de carregamento
- `deductCredits(amount)` — desconta N créditos
- `hasCredits(amount)` — verifica se tem saldo suficiente
- Auto-reset: se `cycle_end < now()`, reseta para 0 e cria novo ciclo

#### Teste:
- [ ] Renderizar saldo na tela
- [ ] Descontar crédito e verificar update em tempo real

---

### FUNÇÃO 6: Componentes do Roteirista (UI)
**Risco: BAIXO** | **Arquivos: 4 novos** | **Tempo: ~3h**

#### O que faz:
Cria os componentes visuais reutilizáveis do Roteirista.

#### Arquivos:
1. **[NEW] `src/components/roteirista/FormatPicker.tsx`** — Carrossel de formatos virais
2. **[NEW] `src/components/roteirista/VoiceSelector.tsx`** — Dropdown de tom de voz
3. **[NEW] `src/components/roteirista/ModeSelector.tsx`** — Seletor Rápido/Premium/Pesquisa
4. **[NEW] `src/components/roteirista/CreditBar.tsx`** — Barra visual de créditos

#### Detalhes do FormatPicker:
- Puxa `formatos` do Supabase (id, titulo, nicho, video_url, estudo, duracao)
- Carrossel horizontal com scroll (usar CSS `overflow-x: auto`)
- Cards compactos: thumbnail + título + badge nicho
- Click → `selectedFormato` state com borda glow `ring-2 ring-[#0ea5e9]`
- Botão "Ver Todos" abre modal com busca/filtros

#### Teste:
- [ ] FormatPicker mostra formatos do banco
- [ ] Clicar em formato seleciona corretamente
- [ ] VoiceSelector lista perfis de voz do usuário
- [ ] CreditBar mostra saldo correto
- [ ] ModeSelector alterna entre os 3 modos

---

### FUNÇÃO 7: API do Roteirista (Backend Core)
**Risco: MÉDIO** | **Arquivos: 2 novos** | **Tempo: ~3h**

#### O que faz:
Endpoint principal que orquestra a geração inteligente com roteamento de modelos.

#### Arquivos:
1. **[NEW] `src/app/api/roteirista/route.ts`** — Endpoint principal
2. **[NEW] `src/app/api/embeddings/route.ts`** — Gerar embeddings (OpenAI text-embedding-3-small)

#### Fluxo do endpoint:
```
Request → Auth → Checar Créditos → Buscar Memórias (Cérebro)
→ Buscar Tom de Voz → Montar Prompt → Rotear Modelo
→ Stream Response → Salvar Roteiro + Memória
```

#### Modos de geração:

| Modo | Modelo | Créditos | Custo real |
|------|--------|----------|------------|
| ⚡ Rápido | GPT-4o-Mini | 0 (grátis) | ~$0.0005 |
| 💎 Premium | Claude Sonnet | 1 | ~$0.016 |
| 🔍 Pesquisa | **Serper** + Claude | 2 | ~$0.017 |

#### Teste:
- [ ] Gerar roteiro em modo Rápido (sem crédito)
- [ ] Gerar em modo Premium (desconta 1 crédito)
- [ ] Gerar com Pesquisa (Serper busca dados + Claude processa)
- [ ] Confirmar streaming funciona no frontend

---

### FUNÇÃO 8: Página do Roteirista (Montagem Final)
**Risco: MÉDIO** | **Arquivos: 1 novo** | **Tempo: ~3h**

#### O que faz:
Monta a página completa `/roteirista` usando os componentes das funções 5 e 6.

#### Arquivo:
**[NEW] `src/app/(dashboard)/roteirista/page.tsx`**

#### Layout da página:
```
┌─────────────────────────────────────────────────────┐
│  ✍️ ROTEIRISTA               [127/150 créditos ████]│
│                                                      │
│  Escolha um formato base:                           │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  ← scroll     │
│  │ 🎬✅ │ │ 🎬   │ │ 🎬   │ │ 🎬   │               │
│  │vid 1 │ │vid 2 │ │vid 3 │ │vid 4 │               │
│  └──────┘ └──────┘ └──────┘ └──────┘               │
│                                                      │
│  📝 Descreva o tema do roteiro...                   │
│  ┌──────────────────────────────────────────┐       │
│  │                                          │       │
│  │  ex: "Como ganhar seguidores no TikTok"  │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
│  🎭 Tom: Gabriel ▼   ⏱️ 30s ▼   ⚡ Rápido ▼        │
│                                                      │
│  [    ✨ Gerar Roteiro    ]                          │
│                                                      │
│ ─────────────── Resultado ─────────────────         │
│  (streaming do roteiro gerado em tempo real)         │
│                                                      │
│  [📋 Copiar] [💾 Salvar] [🔄 Gerar Outro]           │
└─────────────────────────────────────────────────────┘
```

#### Teste:
- [ ] Selecionar formato → digitar tema → escolher tom → gerar
- [ ] Streaming aparece em tempo real
- [ ] Salvar roteiro funciona (tabela `roteiros`)
- [ ] Créditos atualizam após geração premium
- [ ] Responsivo no mobile

---

### FUNÇÃO 9: Integração Serper (Pesquisa em Tempo Real)
**Risco: BAIXO** | **Arquivos: 1 novo** | **Tempo: ~1h**

#### O que faz:
Wrapper para a API do Serper que busca dados atualizados do Google.

#### Arquivo:
**[NEW] `src/lib/search/serper.ts`**

```typescript
export async function searchGoogle(query: string): Promise<string> {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: query,
      gl: 'br',    // Brasil
      hl: 'pt-br', // Português
      num: 5,
    }),
  })
  
  const data = await response.json()
  
  // Formatar resultados para o prompt do Claude
  return data.organic
    .map((r: any) => `📰 ${r.title}\n${r.snippet}\nFonte: ${r.link}`)
    .join('\n\n')
}
```

**Variável de ambiente necessária:**
```env
SERPER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

> [!TIP]
> O Serper oferece **2.500 buscas grátis** para testar. Depois custa $50 por 50K queries, ou seja **$0.001 por busca**.

#### Teste:
- [ ] Buscar "tendências Instagram 2026" e confirmar que retorna resultados em PT-BR
- [ ] Integrar com a API do Roteirista no modo "Pesquisa"

---

### FUNÇÃO 10: Cérebro / Memória (RAG com pgvector)
**Risco: MÉDIO** | **Arquivos: 2 novos** | **Tempo: ~2h**

#### O que faz:
Implementa a memória vetorial — a IA salva e consulta roteiros anteriores do usuário.

#### Arquivos:
1. **[NEW] `src/lib/brain/embeddings.ts`** — Gerar embeddings via OpenAI
2. **[NEW] `src/lib/brain/memory.ts`** — CRUD de memórias + busca por similaridade

#### Fluxo:
```
ESCRITA (após gerar roteiro):
  roteiro finalizado → gerar embedding (OpenAI $0.00002) → salvar em memorias_usuario

LEITURA (antes de gerar novo roteiro):
  tema digitado → gerar embedding → match_memorias() → top 3 similares
  → injetar no prompt: "CONTEXTO DO HISTÓRICO: [mem1] [mem2] [mem3]"
```

#### Teste:
- [ ] Gerar 2 roteiros sobre "Instagram"
- [ ] No 3º roteiro sobre "Instagram", verificar que memórias são injetadas no prompt
- [ ] Confirmar que roteiros sobre "finanças" NÃO trazem memórias de "Instagram"

---

### FUNÇÃO 11: Ajustar Home (Limpar CTAs Antigos)
**Risco: BAIXO** | **Arquivos: 1** | **Tempo: ~30min**

#### O que faz:
Atualiza a home page para remover referências aos "Geradores" e adicionar CTA para o Roteirista.

#### Arquivo:
**[MODIFY] `src/app/(dashboard)/page.tsx`** — Trocar banner/links de `/prompts` para `/roteirista`

#### Teste:
- [ ] Home não menciona mais "Geradores"
- [ ] CTA principal leva para `/roteirista`

---

## Resumo de Custos por Função

| Função | API Usada | Custo/Request | Créditos |
|--------|-----------|---------------|----------|
| Análise de Tom de Voz | GPT-4o-Mini | ~$0.001 | 0 (único) |
| Geração Rápida | GPT-4o-Mini | ~$0.0005 | 0 (ilimitado) |
| Geração Premium | Claude Sonnet | ~$0.016 | 1 crédito |
| Pesquisa + Geração | Serper + Claude | ~$0.017 | 2 créditos |
| Embedding (Cérebro) | OpenAI embed-3-small | ~$0.00002 | 0 (automático) |

### Projeção com 1000 clientes × R$ 97/mês:

| Cenário | Custo APIs | Receita | Lucro | Margem |
|---------|------------|---------|-------|--------|
| Light (50 créditos/mês avg) | ~R$ 5.500 | R$ 97.000 | **R$ 91.500** | **94%** |
| Normal (100 créditos/mês avg) | ~R$ 10.000 | R$ 97.000 | **R$ 87.000** | **90%** |
| Heavy (150 créditos max TODOS) | ~R$ 15.000 | R$ 97.000 | **R$ 82.000** | **85%** |

---

## Ordem de Execução

```
FUNÇÃO 1  → Navegação (sidebar + mobile)     ✅ Sem dependências
FUNÇÃO 2  → Redirect /prompts                ✅ Sem dependências
FUNÇÃO 3  → SQL (Supabase migrations)        ✅ Sem dependências
FUNÇÃO 4  → Página Tom de Voz                🔗 Depende de F3
FUNÇÃO 5  → Hook use-credits                 🔗 Depende de F3
FUNÇÃO 6  → Componentes do Roteirista        🔗 Depende de F4, F5
FUNÇÃO 7  → API do Roteirista (backend)      🔗 Depende de F3, F5
FUNÇÃO 8  → Página do Roteirista (frontend)  🔗 Depende de F6, F7
FUNÇÃO 9  → Integração Serper                🔗 Depende de F7
FUNÇÃO 10 → Cérebro / Memória (RAG)          🔗 Depende de F7
FUNÇÃO 11 → Ajustar Home                     ✅ Independente
```

As Funções 1, 2, 3 e 11 podem ser feitas em paralelo. O resto é sequencial.

---

## Variáveis de Ambiente Novas

```env
# Já existem
GEMINI_API_KEY=...
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...

# NOVAS (adicionar)
SERPER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

> [!NOTE]
> **NÃO precisa** de API key da Perplexity se usar Serper. O Serper já dá os dados em tempo real do Google, e o Claude faz o processamento cognitivo. Se no futuro quiser trocar para Perplexity, é só substituir a função `searchGoogle()` na Função 9.
