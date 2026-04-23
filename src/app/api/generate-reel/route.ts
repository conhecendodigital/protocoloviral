import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    // ── Auth Check ──
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para gerar roteiros.' },
        { status: 401 }
      )
    }

    // ── Rate Limit: 10 requests/min por usuário ──
    const rateLimit = checkRateLimit(`generate-reel:${user.id}`, 10, 60_000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Muitas requisições. Aguarde um momento antes de tentar novamente.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
      )
    }

    const { persona, estudo, duracaoStr, nicho, ideia, tomVoz } = await req.json()

    if (!persona || !estudo || !nicho || !ideia) {
      return NextResponse.json(
        { error: 'Faltam dados obrigatórios (persona, estudo, nicho ou ideia de conteúdo) para gerar o roteiro.' },
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

REGRAS INVIOLÁVEIS E CRÍTICAS:
❌ ZERO INDICAÇÕES VISUAIS: É expressamente proibido usar textos entre parênteses descrevendo imagens, telas ou encenação (Ex: NÃO USE "(mostra tela)", "(imagem de X)"). Retorne APENAS as sílabas que saem da boca da pessoa.
❌ ZERO REPETIÇÃO NARRATIVA: O roteiro deve ser fluido e único. Nunca repita a mesma introdução ou o mesmo bloco de transição duas vezes seguidas!
❌ ZERO FORÇAR METÁFORAS IRRACIONAIS: Nunca force o mesmo molde de "personagem 1 vs personagem 2" ou "empresa A vs B" se isso criar uma história sem sentido no seu nicho ("Ex: OpenAI deu rasteira no ChatGPT" é falso e absurdo). O gancho DEVE ser sempre adaptado pela lógica real da [Ideia de Conteúdo]!
❌ ZERO FAKE NEWS E DADOS DESATUALIZADOS: Jamais invente eventos, cite versões desatualizadas de softwares (como "lançou o Claude 3") ou minta sobre funcionamento de produtos. Fale exclusivamente ancorado nos benefícios reais solicitados.
❌ ZERO LINGUAGEM GENÉRICA DE IA: Proibido termos como "mergulhe nessa jornada", "desvende esse segredo", "eleve seu negócio". Use o português natural.
❌ ZERO ELEMENTOS FORA DO CONTEXTO: Entregue apenas o GANCHO, DESENVOLVIMENTO e CTA. Não crie informações inúteis após o CTA.

═══════════════════════════════════
CHECKLIST DE QUALIDADE (validar antes de entregar)
═══════════════════════════════════
Use esta checklist como filtro final. Se algum item falhar, reescreva:
1. Gancho ≤ 2 linhas — deve funcionar lido em voz alta em 3 segundos
2. Primeiro frame = conflito ou pergunta — nunca comece com apresentação
3. Nunca explique o tema antes de criar o gancho — o gancho é a abertura
4. Tira a culpa do público — o problema é da falta de informação, não da pessoa
5. Entrega valor antes do CTA (se houver CTA no original) — mínimo 3 itens/pontos
6. CTA embutido na última dica (se houver CTA) — integrar na conclusão natural
7. Ritmo de lista: 3-7 itens — nem raso, nem cansativo
8. Uma emoção âncora — todo o roteiro em torno de uma única emoção dominante
9. Linguagem do público — termos que o nicho usa, não linguagem acadêmica
10. Última frase coerente com o original — se termina com pergunta, termina com pergunta

═══════════════════════════════════
FÓRMULAS DE GANCHO (referência)
═══════════════════════════════════
Se o gancho original for fraco ou genérico, use estas fórmulas testadas para criar um gancho melhor no mesmo estilo:
- "[N] [coisas] que você [erro] e [consequência]"
- "PROVANDO QUE [PÚBLICO] NÃO É [DEFEITO], É [CAUSA]"
- "O que acontece no seu [X] quando você [hábito comum]?"
- "[Título], é verdade que [crença]? Ou [medo]?"
- "Esse é o [X] da concorrência. Esse é o nosso."
- "[frase inocente que esconde crítica interna]"
- "Se sentindo [sintoma], faz [solução rápida]."
- "Você ainda [faz X] assim ou assim?"
- "Eu faço X. / Eu faço Y." (dois personagens contrastantes)
ATENÇÃO: Use estas fórmulas APENAS para reforçar o gancho — não para mudar o estilo do original.

═══════════════════════════════════
IDENTIFICAÇÃO DE ARQUÉTIPO
═══════════════════════════════════
Identifique qual destes arquétipos o formato viral se encaixa e use a lógica correspondente:
- LIGAÇÃO OCULTA → frase inocente que esconde comportamento problemático
- BASTIDORES COM COMPARAÇÃO → comparação visual + diferenciais empilhados
- REACT / EXPERIMENTO MENTAL → desafio interativo + revelação + aplicação
- LISTA PROBLEMA/SOLUÇÃO → número no gancho + itens com problema e solução
- CERTO/ERRADO → tira culpa do público + demonstração visual
- ANCORAGEM / PERGUNTA IMPACTANTE → pergunta que revela risco em hábito comum
- PERGUNTA E RESPOSTA → leigo pergunta + especialista responde em cascata
- COMPARAÇÃO RICO/POBRE → dois personagens + comparações práticas
- TUTORIAL RÁPIDO → jeito errado vs jeito certo + passo a passo

FORMATO DE ENTREGA OBRIGATÓRIO E RACIOCÍNIO (CHAIN OF THOUGHT):
Você DEVE estruturar a sua resposta primeiro com um bloco de análise e mapeamento, seguido pelas exatas tags do roteiro. Se você pular a análise, o roteiro sairá ruim.

[SALA_DE_ROTEIRISTAS]
<Escreva aqui uma análise de 2 ou 3 parágrafos desconstruindo o formato original (Qual é a dinâmica psicológica dele? Surpresa? Comparação? Tutorial quebrado?). Logo em seguida, responda: COMO eu aplico a minha Ideia de Conteúdo EXATA nessa dinâmica, SEM precisar herdar historinhas literais (ex. Empresa A vs Empresa B) que fogem do nicho?>

[GANCHO]
<texto final gerado do gancho, 3 primeiros segundos>

[DESENVOLVIMENTO]
<texto final principal>

[CTA E FINAL]
<texto do call to action e encerramento>

EXEMPLO DE FORMATO CORRETO:
[SALA_DE_ROTEIRISTAS]
O formato original se apoia no gatilho do inimigo em comum ("O mercado quer seu dinheiro"). Minha ideia de conteúdo é ensinar ChatGPT. Vou transferir esse arquétipo trocando o inimigo para "gurus que vendem pacotes de prints inúteis". O ritmo continuará indignado e rápido.

[GANCHO]
Cê viu que tão te empurrando 10 mil prompts de ChatGPT como se fosse a salvação da sua vida, né?

[DESENVOLVIMENTO]
Esses gurus nadam de braçada enquanto você tenta testar cada prompt inútil. A verdade é que IA não é milagre mágico. Você quer um funil que presta? Pare de salvar textão e me acompanhe na prática para criar automações enxutas.

[CTA E FINAL]
Duvida? Digita AUTO aqui nos comentários.`

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
PASSO 3 — DOR DA PERSONA E DADOS DEMOGRÁFICOS
═══════════════════════════
${persona}

═══════════════════════════
PASSO 4 — CONTEXTO OBRIGATÓRIO E TOM DE VOZ
═══════════════════════════
Tom de voz escolhido pelo criador: O roteiro deve obrigatoriamente encarnar a personalidade de um [${tomVoz}], adotando essa atitude do início ao fim do roteiro. A linguagem e o comportamento devem ser fiéis a esse arquétipo.

Ideia de Conteúdo / Tema Específico a abordar: ${ideia}

═══════════════════════════
PASSO 5 — EXECUTE O FLUXO DE ROTEIRIZAÇÃO
═══════════════════════════
O Formato Viral (Estudo) é apenas a "Música de fundo" (ritmo, tempo, emoção). A Letra (história, metáforas, conteúdo) VEM DA SUA IDEIA DE CONTEÚDO e da Dor da Persona.
⚠️ MÉTODOLOGIA MÁXIMA ⚠️
1. Faça a tempestade de ideias obrigatória dentro de [SALA_DE_ROTEIRISTAS]. Planeje lá como quebrar amarras erradas.
2. NUNCA use parênteses com descrições visuais do cenário/vídeo. Foque apenas na locução falada!
3. O modelo original pode usar uma metáfora (ex: A vencendo B), não se apegue a ela se não for nativa e natural para o seu tema atual. Traduza a SENSAÇÃO para o seu ambiente.
4. O roteiro DEVE ser fluido, respeitando a atitude de [${tomVoz}] do início ao fim, sem enrolações corporativas chatas.

Duração alvo: ${duracao}`

    const modelName = 'gemini-2.0-flash'
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
          maxOutputTokens: 8192,
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

    try {
      const usageMetadata = data?.usageMetadata
      if (usageMetadata) {
        const { logApiUsage } = await import('@/lib/billing')
        await logApiUsage({
          userId: user.id,
          feature: 'generate_reel',
          modelUsed: 'gemini-2.0-flash',
          promptTokens: usageMetadata.promptTokenCount || 0,
          completionTokens: usageMetadata.candidatesTokenCount || 0
        })
      }
    } catch (err) {
      console.error('[BILLING_ERROR]', err)
    }

    return NextResponse.json({ result: resultText })

  } catch (error: any) {
    console.error('Erro Route generate-reel:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}