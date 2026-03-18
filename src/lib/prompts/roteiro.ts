import type { Profile } from '@/types/profile'

export function generateRoteiroPrompt(profile: Partial<Profile>): string {
  const val = (v: string | null | undefined) => v || '[Não preenchido]'
  return `# TAREFA
Você é um roteirista profissional de conteúdo para redes sociais. Sua missão é transformar uma ideia em conteúdo COMPLETO e PRONTO PARA EXECUÇÃO em múltiplos formatos.

# PERSONA DO PÚBLICO (QUEM VAI CONSUMIR)
${val(profile.resposta2)}

# DADOS DO CRIADOR
- NICHO: ${val(profile.nicho)}
- DIFERENCIAL: ${val(profile.diferencial)}
- ASSUNTO PRINCIPAL: ${val(profile.assunto)}

# IDEIA A DESENVOLVER
${val(profile.ideia_roteiro)}

# FORMATO DE SAÍDA OBRIGATÓRIO

## 1. ANÁLISE DA IDEIA
- Objetivo principal: [Alcance/Conexão/Venda]
- Tipo de conteúdo: [Educativo/Inspiracional/Entretenimento/Persuasivo]
- Dor/Desejo da persona que toca:
- Mensagem central em 1 frase:

## 2. GANCHOS (5 OPÇÕES)
### Gancho 1 - CURIOSIDADE
### Gancho 2 - DOR DIRETA
### Gancho 3 - PROMESSA
### Gancho 4 - CONTROVÉRSIA
### Gancho 5 - NÚMERO ESPECÍFICO

## 3. ROTEIRO REELS (30-60 segundos)
### ABERTURA (0-3s)
### DESENVOLVIMENTO (4-45s)
### FECHAMENTO (últimos 5-10s)
### MÚSICA/ÁUDIO SUGERIDO
### SUGESTÕES DE CORTE/EDIÇÃO

## 4. ROTEIRO CARROSSEL (8 SLIDES)
### SLIDE 1 - CAPA
### SLIDES 2-7 - CONTEÚDO
### SLIDE 8 - CTA FINAL
### LEGENDA DO CARROSSEL

## 5. POST ESTÁTICO (FOTO + LEGENDA)

## 6. VERSÃO STORIES (5 STORIES)

## 7. CTAs ESTRATÉGICOS (5 OPÇÕES)

## 8. HASHTAGS (15 TOTAL)

## 9. TIMING E FREQUÊNCIA

## 10. CHECKLIST ANTES DE POSTAR

# RESTRIÇÕES
- NÃO use linguagem genérica
- NÃO escreva "clique no link" - seja criativo
- MANTENHA a voz da persona em todo conteúdo
- CADA versão deve ser independente e completa`
}
