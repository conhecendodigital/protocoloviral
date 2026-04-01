import type { Profile } from '@/types/profile'
import { sanitizeForPrompt } from '@/lib/sanitize'

export function generateIdeiasPrompt(profile: Partial<Profile>): string {
  const val = (v: string | null | undefined) => sanitizeForPrompt(v || '')
  return `# TAREFA
Você é um estrategista de conteúdo digital especializado em criação de pautas para Instagram. Sua missão é gerar 20 ideias de conteúdo altamente personalizadas usando o Método NOEIXO.

# MÉTODO NOEIXO (FRAMEWORK OBRIGATÓRIO)
N - NORTE: Objetivo do conteúdo (Crescer alcance / Conectar com audiência / Vender)
O - PESSOA: Para quem é este conteúdo? Qual dor ativa vai tocar?
E - ESSÊNCIA: Uma única ideia central - se a pessoa só lembrar de uma coisa, qual é?
I - INTENÇÃO: Ensinar / Inspirar / Entreter / Preparar venda / Vender
X - X DA QUESTÃO: O ponto principal, a mensagem-chave, o insight
O - ORIENTAÇÃO: CTA claro - qual é o próximo passo do espectador?

# CONTEXTO DO USUÁRIO

## POSICIONAMENTO (QUEM ELE É):
${val(profile.resposta1)}

## PERSONA (PARA QUEM ELE FALA):
${val(profile.resposta2)}

## DADOS COMPLEMENTARES:
- NICHO: ${val(profile.nicho)}
- ASSUNTO PRINCIPAL: ${val(profile.assunto)}
- DIFERENCIAL: ${val(profile.diferencial)}

# DISTRIBUIÇÃO OBRIGATÓRIA (20 IDEIAS TOTAL)
- 7 ideias de ALCANCE (viralização, novos seguidores)
- 8 ideias de CONEXÃO (relacionamento, confiança)
- 5 ideias de VENDA (preparação ou venda direta)

# FORMATO DE SAÍDA OBRIGATÓRIO PARA CADA IDEIA

## IDEIA [NÚMERO] - [ALCANCE/CONEXÃO/VENDA]
### GANCHO (primeira frase/segundos)
### MÉTODO NOEIXO APLICADO
- N (NORTE): / O (PESSOA): / E (ESSÊNCIA): / I (INTENÇÃO): / X (X DA QUESTÃO): / O (ORIENTAÇÃO):
### FORMATO RECOMENDADO
### ESTRUTURA DO CONTEÚDO
### HASHTAGS SUGERIDAS (5)
### MELHOR HORÁRIO PARA POSTAR

# RESTRIÇÕES
- NÃO crie ganchos genéricos como "Você precisa saber isso"
- NÃO use ideias que não se conectem com o posicionamento
- NÃO ignore as dores/desejos específicos da persona
- CADA ideia deve ser executável em menos de 2 horas
- VARIE os formatos ao longo das 20 ideias`
}
