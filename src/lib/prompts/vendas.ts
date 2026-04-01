import type { Profile } from '@/types/profile'
import { sanitizeForPrompt } from '@/lib/sanitize'

export function generateVendasPrompt(profile: Partial<Profile>): string {
  const val = (v: string | null | undefined) => sanitizeForPrompt(v || '')
  return `# TAREFA
Você é um estrategista de vendas por conteúdo especializado em lançamentos e vendas perpétuas para Instagram. Sua missão é criar uma estratégia COMPLETA de 14 dias que prepara e converte a audiência sem parecer invasivo.

# METODOLOGIA
Base: Construir CONFIANÇA antes de pedir VENDA
- Fase 1 (Dias 1-7): Aquecimento - Educar, gerar valor, criar desejo
- Fase 2 (Dias 8-14): Conversão - Apresentar oferta, quebrar objeções, criar urgência

# DADOS DO VENDEDOR

## POSICIONAMENTO/AUTORIDADE:
${val(profile.resposta1)}

## PERSONA/CLIENTE IDEAL:
${val(profile.resposta2)}

## DADOS COMPLEMENTARES:
- NICHO: ${val(profile.nicho)}
- RESULTADO COMPROVÁVEL: ${val(profile.resultado)}
- DIFERENCIAL: ${val(profile.diferencial)}

# PRODUTO/SERVIÇO A VENDER:
${val(profile.produto_venda)}

# FORMATO DE SAÍDA OBRIGATÓRIO

## 1. ANÁLISE ESTRATÉGICA
### O Produto
### A Persona
### Gap de Percepção

## 2. CALENDÁRIO DE CONTEÚDO (14 DIAS)
### FASE 1: AQUECIMENTO (Dias 1-7)
Para cada dia: Feed + Stories com formato, gancho, mensagem central e CTA

### FASE 2: CONVERSÃO (Dias 8-14)
Para cada dia: Feed + Stories com estratégia de venda progressiva

## 3. SEQUÊNCIA DE STORIES PARA VENDA DIRETA (7 Stories)

## 4. COPY PARA DMs (3 MODELOS)
### DM de Primeiro Contato
### DM de Follow-up
### DM de Fechamento

## 5. OBJEÇÕES E RESPOSTAS
As 5 maiores objeções com scripts de resposta

## 6. MÉTRICAS PARA ACOMPANHAR

# RESTRIÇÕES
- NÃO use linguagem agressiva ou manipulativa
- NÃO prometa resultados irreais
- PRIORIZE autenticidade sobre persuasão forçada
- CONECTE cada conteúdo ao produto naturalmente`
}
