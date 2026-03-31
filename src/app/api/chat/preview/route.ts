import { createServerSupabase } from '@/lib/supabase/server'
import { streamText, convertToModelMessages } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { messages, system_prompt, model: selectedModel } = await req.json()
    
    // Auth check
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    let aiApp;
    const actualModel = selectedModel || 'gpt-4o';
    
    if (actualModel.includes('gemini')) {
        const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY || '' })
        aiApp = google(actualModel)
    } else if (actualModel.includes('claude')) {
        const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })
        aiApp = anthropic(actualModel)
    } else {
        // Padrão OpenAI para gpt e o3/o1
        const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY || '' })
        aiApp = openai(actualModel)
    }

    const coreMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: aiApp,
      system: system_prompt || 'Você é um assistente útil e amigável.',
      messages: coreMessages,
    })
    return result.toUIMessageStreamResponse()
    
  } catch (error) {
    console.error('Preview Chat Error:', error)
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), { status: 500 })
  }
}
