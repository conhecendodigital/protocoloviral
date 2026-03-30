import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { clareza, persona, estudo, duracaoStr } = await req.json()

    if (!clareza || !persona || !estudo) {
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

    const systemPrompt = `Você é um CRIPTO-ROTEIRISTA de elite para Reels.
Sua única função é extrair a ARQUITETURA INVISÍVEL de um vídeo viral (a psicologia, os gatilhos, o ritmo e o arco emocional) e criar um Roteiro 100% NOVO baseado no Nicho da pessoa.

= DADOS DO CRIADOR =
Clareza: ${clareza}
Persona: ${persona}

= ESTUDO VIRAL (ESTRUTURA A SER MODELADA) =
${estudo}

(DURAÇÃO EXIGIDA: Este vídeo original tem cerca de ${duracaoStr || '30 segundos'}. O seu roteiro DEVE possuir tamanho equivalente em volume de palavras ou ligeiramente maior. Nunca seja mais curto).

REGRAS ABSOLUTAS (SOB PENA DE FALHA):
1. PROIBIDO "MAD-LIBS" (PREENCHER LACUNAS): Nunca apenas troque os substantivos da frase original!
Exemplo do que NÃO fazer: Se o original diz "Oi, desculpa sumir, eu tava rolando o feed", você NÃO PODE reproduzir a mesma sintaxe dizendo "Oi, desculpa sumir, eu tava presa na procrastinação". ISSO É PLÁGIO BARATO!
Você deve extrair o GATILHO ABSTRATO (Ex: "Quebra de expectativa + confissão de um hábito que o público também tem") e escrever uma abertura TOTALMENTE INÉDITA, com palavras e estrutura de frase completamente diferentes da original.

2. COPIE ZERO. Zero frases prontas, zero expressões do original. Crie do zero usando a psicologia embutida.

3. TEXTO LIMPO PARA O TELEPROMPTER. Não escreva "🎬 Título", "[GANCHO]", "[DESENVOLVIMENTO]" ou "Duração estimada...". Entregue APENAS O TEXTO BRUTO QUE A PESSOA VAI LER PRA CÂMERA. Nada de avisos, notas ou marcações. Mande o ouro puro e direto.

4. TOM HUMANO. Fale como a pessoa falaria nas redes sociais, sem jargões corporativos de IA.`

    // O usuário solicitou explicitamente o Gemini 2.5 Flash
    // Caso a Google mude a string no futuro, poderíamos ter um fallback aqui, 
    // mas "gemini-2.5-flash" é o nome padrão esperado em 2024/2025 para a última gen.
    const modelName = 'gemini-2.5-flash'
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }],
            role: 'user'
          }
        ],
        generationConfig: {
          temperature: 0.7,
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API Error:', errorText)
      return NextResponse.json(
        { error: `Erro na IA do Google: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!resultText) {
      throw new Error('Retorno vazio da API do Gemini.')
    }

    return NextResponse.json({ result: resultText })
  } catch (error: any) {
    console.error('Erro Route generate-reel:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
