import type { Profile } from '@/types/profile'
import { sanitizeForPrompt } from '@/lib/sanitize'

export function generatePersonaPrompt(profile: Partial<Profile>): string {
  const val = (v: string | null | undefined) => sanitizeForPrompt(v || '')
  return `# TAREFA
Você é um especialista em comportamento do consumidor e criação de personas para marketing digital. Sua missão é criar um perfil psicológico e comportamental COMPLETO do cliente ideal baseado nos dados fornecidos.

# CONTEXTO
O usuário já definiu seu posicionamento (abaixo) e precisa entender profundamente QUEM é a pessoa que deve consumir seu conteúdo.

# POSICIONAMENTO DO USUÁRIO (DEFINIDO ANTERIORMENTE)
${val(profile.resposta1)}

# DADOS ADICIONAIS SOBRE O PÚBLICO
- PÚBLICO-ALVO GERAL: ${val(profile.publico)}
- DOR PRINCIPAL: ${val(profile.dor)}
- SOLUÇÕES JÁ TENTADAS: ${val(profile.tentou)}
- CONCORRENTES/REFERÊNCIAS QUE SEGUEM: ${val(profile.concorrentes)}
- NICHO: ${val(profile.nicho)}

# INSTRUÇÕES
1. Crie UMA persona principal (não múltiplas)
2. Seja extremamente específico - nomes, idades, locais, rotinas
3. Aprofunde na psicologia - medos, desejos, crenças limitantes
4. Conecte TUDO ao posicionamento fornecido acima
5. Use linguagem que a própria persona usaria

# FORMATO DE SAÍDA OBRIGATÓRIO

## 1. IDENTIFICAÇÃO DEMOGRÁFICA
- Nome completo fictício:
- Idade exata:
- Gênero:
- Estado civil:
- Cidade/Região:
- Profissão atual:
- Faixa de renda mensal:
- Nível de escolaridade:

## 2. ROTINA DIÁRIA
Descreva um dia típico dessa pessoa:
- Horário que acorda:
- O que faz primeiro:
- Como é o trabalho/dia:
- Momentos de descanso:
- Quando acessa redes sociais:
- Horário que dorme:

## 3. PERFIL PSICOLÓGICO

### 3.1 DORES SUPERFICIAIS (o que ela FALA que é o problema)
### 3.2 DORES PROFUNDAS (o que ela realmente SENTE mas não admite)
### 3.3 DESEJOS DECLARADOS (o que ela diz querer)
### 3.4 DESEJOS OCULTOS (o que ela realmente quer sentir)

## 4. COMPORTAMENTO DIGITAL
### 4.1 CONSUMO DE CONTEÚDO
### 4.2 INFLUENCIADORES
### 4.3 COMPORTAMENTO DE COMPRA

## 5. JORNADA COM O PROBLEMA ATUAL
### 5.1 NÍVEL DE CONSCIÊNCIA (Eugene Schwartz)
### 5.2 SOLUÇÕES JÁ TENTADAS

## 6. OBJEÇÕES E BARREIRAS
5 principais objeções que ela terá antes de comprar/seguir

## 7. GATILHOS DE CONEXÃO
- Frase que faria ela pensar "isso é pra mim"
- História que geraria identificação
- Prova social que a convenceria
- Tipo de conteúdo que faria ela mandar DM

## 8. MAPA DE EMPATIA RESUMIDO

# RESTRIÇÕES
- NÃO crie personas genéricas
- NÃO use dados não conectados ao posicionamento fornecido
- SEJA específico em TODOS os campos
- USE a linguagem/vocabulário que a própria persona usaria`
}
