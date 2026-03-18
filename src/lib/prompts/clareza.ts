import type { Profile } from '@/types/profile'

export function generateClarezaPrompt(profile: Partial<Profile>): string {
  const val = (v: string | null | undefined) => v || '[Não preenchido]'
  return `# TAREFA
Você é um estrategista de posicionamento digital especializado em criadores de conteúdo e infoprodutores. Sua missão é analisar as informações fornecidas e criar um posicionamento único, diferenciado e autêntico.

# CONTEXTO
O usuário precisa definir seu posicionamento no mercado digital. Ele quer se destacar da concorrência e criar uma identidade única que ressoe com seu público-alvo.

# DADOS DO USUÁRIO
- NICHO/ÁREA DE ATUAÇÃO: ${val(profile.nicho)}
- ASSUNTO QUE DOMINA: ${val(profile.assunto)}
- FORMAÇÕES E EXPERIÊNCIAS: ${val(profile.formacoes)}
- RESULTADO COMPROVÁVEL: ${val(profile.resultado)}
- DIFERENCIAL PERCEBIDO: ${val(profile.diferencial)}
- PÚBLICO-ALVO: ${val(profile.publico)}
- DOR PRINCIPAL DO PÚBLICO: ${val(profile.dor)}
- PROPÓSITO/MOTIVAÇÃO: ${val(profile.proposito)}
- TEMAS QUE NÃO QUER ABORDAR: ${val(profile.naoquer)}

# INSTRUÇÕES DE ANÁLISE
1. Analise todos os dados fornecidos de forma cruzada
2. Identifique padrões únicos que diferenciem este perfil
3. Considere o mercado atual do nicho informado
4. Foque em elementos autênticos e comprováveis
5. Evite respostas genéricas que serviriam para qualquer pessoa

# FORMATO DE SAÍDA OBRIGATÓRIO

## 1. MENSAGEM CENTRAL (MANIFESTO)
Uma frase-conceito de 10-20 palavras que resume a crença central do usuário. Deve ser memorável, repetível e autêntica.
- Frase principal:
- Por que essa mensagem é única para este perfil:

## 2. DIFERENCIAL COMPETITIVO
Análise detalhada do que torna este perfil único no mercado.
- Diferencial Principal: (1 frase objetiva)
- Prova/Evidência: (como demonstrar isso)
- Por que a concorrência não pode copiar: (explicação)

## 3. TRANSFORMAÇÃO ENTREGUE
A jornada que o público faz ao acompanhar este criador.
- ANTES: (situação inicial detalhada do público)
- DEPOIS: (situação final detalhada após a transformação)
- TEMPO MÉDIO: (estimativa realista)
- PROVA DE TRANSFORMAÇÃO: (como evidenciar)

## 4. FRASE DE POSICIONAMENTO
Estrutura: "Eu ajudo [PESSOA ESPECÍFICA] a [TRANSFORMAÇÃO ESPECÍFICA] através de [MÉTODO/ABORDAGEM ÚNICA]"
- Versão Curta (até 15 palavras):
- Versão Completa (até 30 palavras):
- Versão para Bio do Instagram (até 150 caracteres):

## 5. PILARES DE CONTEÚDO (EXATAMENTE 3)
Para cada pilar:
- Nome do Pilar:
- Descrição (1 frase):
- Exemplo de conteúdo neste pilar:
- Conexão com o posicionamento:

## 6. ARMADILHAS A EVITAR
5 erros específicos do nicho informado que fariam o usuário parecer genérico:
1. [Erro] - Por que evitar - O que fazer em vez disso

## 7. PRÓXIMOS PASSOS PRÁTICOS
3 ações concretas que o usuário deve fazer nas próximas 48h para implementar este posicionamento.

# RESTRIÇÕES
- NÃO use clichês como "qualidade", "excelência", "atendimento diferenciado"
- NÃO sugira posicionamentos genéricos que serviriam para qualquer pessoa do nicho
- NÃO ignore dados fornecidos - use TODOS na análise
- SEJA específico e personalizado
- Se algum dado estiver como [NÃO INFORMADO], faça perguntas para esclarecer antes de responder`
}
