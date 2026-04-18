# Plano: Editor de Roteiro com IA por Blocos

## Estado Atual (o que JÁ existe)

### Roteirista (page.tsx)
- ✅ Gera roteiro com streaming (ChatGPT-style)
- ✅ Ao terminar, já faz `router.push('/roteiros/${id}')` (linha 392)
- ❌ Mas o streaming mostra o texto bruto no chat ANTES de redirecionar
- ❌ A transição é abrupta — usuário vê o texto gerado e depois sai

### Roteiros/[id]/page.tsx (Editor)
- ✅ Carrega roteiro do banco
- ✅ Parser de blocos (GANCHO, DESENVOLVIMENTO, CTA, etc.)
- ✅ Edição manual de cada bloco
- ✅ Melhorar bloco com IA (`/api/roteirista/improve-block`)
- ✅ Variações de GANCHO (3 opções)
- ✅ Banco de ganchos com busca
- ❌ UI do editor não tem destaque de "recém gerado" — parece uma página fria
- ❌ Não tem loading/transição animada ao chegar da geração
- ❌ Regenerar bloco inteiro (não apenas melhorar) não funciona fluidamente

## Problemas a Resolver

1. **Transição Roteirista → Editor** — após geração, redireciona mas sem contexto
2. **Estado "recém chegado"** — editor deve receber ?new=true na URL e mostrar estado comemorativo
3. **Regenerar bloco com IA** — select do tipo de bloco + prompt → gera novo conteúdo via stream
4. **Edição manual** — já existe mas UI pode melhorar

## Mudanças Necessárias

### 1. roteirista/page.tsx — linha 392
```tsx
// ANTES:
router.push(`/roteiros/${capturedRoteiroId}`)

// DEPOIS:
router.push(`/roteiros/${capturedRoteiroId}?new=true`)
```

### 2. roteiros/[id]/page.tsx — Melhorias UX

#### A. Detectar chegada da geração
```tsx
const isNewRoteiro = searchParams.get('new') === 'true'
```

#### B. Banner "Roteiro gerado" com entrada animada
Mostrar por 3s e desaparecer:
```tsx
{isNewRoteiro && showBanner && (
  <motion.div className="..."> ✅ Roteiro gerado com sucesso! </motion.div>
)}
```

#### C. Regenerar Bloco com IA (novo, diferente de "melhorar")
- Botão "Regenerar" (diferente de "Melhorar")
- Abre mini-interface com textarea para instrução opcional
- Chama `/api/roteirista/improve-block` com `{ mode: 'regenerate', blockType, context }`
- Faz streaming do resultado diretamente no bloco (atualiza em tempo real)

### 3. API — /api/roteirista/improve-block
Verificar se suporta `mode: 'regenerate'` (reescrever do zero vs melhorar)

## Fluxo Final Desejado

```
1. Usuário pede roteiro no Roteirista
2. Streaming acontece (animação tipo ChatGPT) ✅
3. Ao detectar [ROTEIRO_ID:xxx]:
   a. Exibe mensagem "✅ Roteiro salvo! Abrindo editor..."
   b. Após 1s de delay (para a pessoa ver), redireciona para /roteiros/xxx?new=true
4. Editor carrega com:
   a. Banner animado "Roteiro gerado com sucesso!" (desaparece em 4s)
   b. Blocos todos visíveis e interativos
   c. Primeiro bloco (GANCHO) com destaque/pulse inicial
5. Por bloco o usuário pode:
   a. ✏️ Editar manualmente (inline textarea)
   b. ✨ Melhorar com IA (refina o que tem)
   c. 🔄 Regenerar com IA (reescreve do zero, com instrução opcional)
   d. 🪝 Trocar Gancho (banco de ganchos) — apenas GANCHO
```
