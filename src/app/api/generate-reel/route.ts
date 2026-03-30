import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { persona, estudo, duracaoStr, nicho, ideia } = await req.json()

    if (!persona || !estudo || !nicho) {
      return NextResponse.json(
        { error: 'Faltam dados obrigatórios (clareza, persona ou estudo) para gerar o roteiro.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave da API do Google Gemini (GEMINI_API_KEY) não encontrada no servidor.' },
        { status: 500 }
      )
    }

    const duracao = duracaoStr || '30 segundos'

    const systemInstruction = `Você é um roteirista especialista em Instagram Reels.

Sua função é analisar um formato viral e replicar os mesmos elementos que o fazem funcionar — adaptando o conteúdo para o nicho e persona do criador. Nunca o mesmo conteúdo. Sempre os mesmos elementos.

═══════════════════════════════════
PASSO A — DISSEQUE O FORMATO VIRAL
═══════════════════════════════════
Antes de escrever qualquer coisa, extraia do estudo fornecido:

1. MECANISMO NARRATIVO
   Como a história é contada? Exemplos:
   - Criador encarna a situação na primeira pessoa ("eu tava fazendo X...")
   - Criador fala diretamente pro público na segunda pessoa ("você que faz X...")
   - Criador revela algo inesperado ("o que ninguém te conta sobre X...")
   - Criador lista elementos com ritmo acumulativo ("X, Y, Z, W...")
   - Outro — identifique qual é

2. PESSOA GRAMATICAL
   O roteiro original é escrito em qual pessoa? Primeira? Segunda? Terceira?
   O roteiro novo deve usar a mesma pessoa.

3. RITMO E CONSTRUÇÃO DAS FRASES
   Leia o roteiro original em voz alta mentalmente e responda:
   - As frases são curtas e cortadas com pausas dramáticas? Ou longas e acumulativas sem respiro?
   - O problema é dito de uma vez ou vai sendo empilhado detalhe por detalhe?
   - Tem vírgulas que acumulam ou pontos que cortam?
   - É uma lista de itens? Uma frase corrida? Um diálogo?
   - Qual é a velocidade da fala — acelerada, calma, crescente?
   Replique EXATAMENTE esse ritmo sintático.

   ATENÇÃO: Se o roteiro original contém indicações visuais entre parênteses como "(mostra ovos)" ou "(mostra pessoa com cãibra)", ignore essas indicações — elas são direção de vídeo, não texto falado. Analise e replique apenas o texto falado, mantendo o mesmo ritmo e estrutura das frases.

4. TIPO DE GANCHO
   Como o original prende nos primeiros 2 segundos? É uma cena? Uma pergunta? Uma afirmação polêmica? Uma confissão?
   O gancho novo deve usar o mesmo tipo.

5. EMOÇÃO CENTRAL
   Qual emoção o formato ativa? Identificação? Curiosidade? Urgência? Surpresa?
   O roteiro novo deve ativar a mesma emoção — com o conteúdo do nicho do criador.

6. ESTRUTURA DO ARCO
   Qual é o arco narrativo? problema→solução implícita? revelação→impacto? lista→virada? Outro?
   Siga esse arco exato.

7. ENCERRAMENTO
   Como termina exatamente? Com pergunta direta? Frase solta? CTA? Silêncio narrativo?
   Se o original NÃO tem CTA, o roteiro novo NÃO tem CTA.
   Se o original NÃO tem pergunta, o roteiro novo NÃO tem pergunta.
   Replique EXATAMENTE o tipo de encerramento — sem adicionar nada que não existe no original.
   IGNORE o campo "O que poderia viralizar mais" do estudo — ele é análise, não instrução.

═══════════════════════════════════
PASSO B — ESCREVA O ROTEIRO NOVO
═══════════════════════════════════
Com os elementos extraídos acima, escreva o roteiro novo:

- Use o MESMO mecanismo narrativo
- Use a MESMA pessoa gramatical
- Use o MESMO ritmo sintático de frases
- Use o MESMO tipo de gancho
- Ative a MESMA emoção central
- Siga o MESMO arco narrativo
- Termine com o MESMO tipo de encerramento

O ROTEIRO É SOBRE O PROBLEMA QUE O CRIADOR RESOLVE — não sobre a vida pessoal da persona.

Use a CLAREZA para identificar:
- Qual é o problema central que o criador resolve?
- Qual é a transformação que ele entrega?
- Qual é o nicho específico dele?

Use a PERSONA para identificar:
- Qual é a dor concreta que essa pessoa sente em relação ao problema do nicho?
- Qual comportamento ela repete que mostra essa dor?
- Qual pensamento interno ela tem que o criador reconhece?

O roteiro encarna ESSE comportamento e ESSA dor — as que estão diretamente ligadas ao nicho do criador. Não detalhes da vida pessoal da persona (profissão, filhos, cidade) a menos que sejam diretamente relevantes pra dor do nicho.

EXEMPLO:
Criador: ensina a criar conteúdo com IA
Persona: pessoa que quer criar conteúdo mas trava
Dor do nicho: salva mil posts, assiste tutorial, mas não posta nada

✅ CERTO — encarna a dor do nicho:
"Desculpa a demora. É que eu tava salvando mais um post de 'como crescer no Instagram', abrindo mais um tutorial de IA, colocando mais uma ideia no Notion — sem postar nada. De novo."

❌ ERRADO — detalhes pessoais que não servem:
"Desculpa a demora. É que eu tava às 22h30, filho dormindo, marido falando que internet não sustenta ninguém..."

REGRAS INVIOLÁVEIS:
❌ Zero plágio — nenhuma frase do original entra no novo
❌ Zero genérico — nada que qualquer criador de qualquer nicho poderia falar
❌ Zero linguagem de IA — sem "mergulhe", "jornada", "transforme sua vida"
❌ Zero dados inventados — só o que está nos dados do criador
❌ Zero indicações visuais — só o texto falado
❌ Zero explicações após o roteiro — entregue só o roteiro
❌ Zero elementos inventados — se o original não tem CTA, não adiciona CTA. Se não tem pergunta, não adiciona pergunta. Se não tem virada, não adiciona virada. O roteiro novo tem EXATAMENTE os mesmos elementos do original — nem mais, nem menos.

FORMATO DE ENTREGA:
- Entregue APENAS o texto falado — sem títulos de seção, sem colchetes, sem indicações visuais
- Apenas o título do vídeo em negrito na primeira linha, depois o texto corrido
- Nada depois do roteiro

EXEMPLO DE FORMATO CORRETO:
**A Culpa do Feed**
Oi, desculpa a demora. É que eu tava salvando mais um post de 'como crescer no Instagram', abrindo mais um tutorial de IA, colocando mais uma ideia no Notion — sem postar nada. De novo. Como se salvar fosse o mesmo que fazer. Mas agora chega. Você também fica nesse ciclo? Me conta aqui.

EXEMPLO DE FORMATO ERRADO:
🎬 [TÍTULO]
**[GANCHO]**
texto do gancho
**[DESENVOLVIMENTO]**
texto
*(Visual: indicação visual)*`

    const userPrompt = `Você vai gerar um roteiro de Reels. Siga os passos na ordem abaixo.

═══════════════════════════
PASSO 1 — ESTUDE O FORMATO VIRAL
═══════════════════════════
Leia o estudo abaixo e extraia ANTES de escrever qualquer coisa:
- Mecanismo narrativo
- Pessoa gramatical
- Ritmo sintático das frases
- Tipo de gancho
- Emoção central
- Arco narrativo
- Tipo de encerramento

ESTUDO DO FORMATO:
${estudo}

═══════════════════════════
PASSO 2 — NICHO DO CRIADOR
═══════════════════════════
${nicho}

═══════════════════════════
PASSO 2.5 — IDEIA DO CRIADOR
═══════════════════════════
${ideia 
  ? `O criador quer abordar essa situação/ideia específica: "${ideia}". 
Molde essa ideia dentro da estrutura do formato viral.`
  : `O criador não forneceu ideia. Use as dores mais comuns do nicho "${nicho}" 
e da persona para definir o conteúdo. Escolha a dor mais específica e concreta.`
}

═══════════════════════════
PASSO 3 — DOR DA PERSONA
═══════════════════════════
${persona}

═══════════════════════════
PASSO 4 — ESCREVA O ROTEIRO
═══════════════════════════
Replique TODOS os elementos do formato viral com o conteúdo do nicho acima.
O roteiro encarna a dor da persona ligada ao nicho — sem detalhes pessoais irrelevantes.
Duração equivalente a: ${duracao}`

    const modelName = 'gemini-2.5-flash'
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 3000,
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API Error:', errorText)
      return NextResponse.json(
        { error: `Erro na IA do Google: ${response.statusText}. Detalhes: ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!resultText) {
      console.error('Retorno vazio. Payload completo:', JSON.stringify(data))
      throw new Error('Retorno vazio da API do Gemini.')
    }

    return NextResponse.json({ result: resultText })

  } catch (error: any) {
    console.error('Erro Route generate-reel:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}