'use client'

import React, { useState, useEffect, useRef, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Send, Sparkles, Loader2, ArrowLeft, MoreVertical, Paperclip } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Agent {
  id: string
  name: string
  category: string
  ai_provider: string
  ai_model: string
}

export default function AgentChatPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const agentId = use(params).id
  const urlSessionId = searchParams.get('sessao')

  const [agent, setAgent] = useState<Agent | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(urlSessionId)
  const [isInitializing, setIsInitializing] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Inicializa a Vercel AI SDK
  // Estado local para o input, já que o useChat 3.x+ não o exporta mais por padrão
  const [input, setInput] = useState('')
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setInput(e.target.value)

  const { messages, setMessages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        agent_id: agentId,
        session_id: sessionId,
      }
    }),
    onFinish: (message: any) => {
      console.log('[useChat] Stream concluído!', message);
    },
    onError: (error: Error) => {
      console.error('[useChat] Erro no stream:', error);
    }
  })

  // Loading derivado do novo status do AI SDK
  const isLoading = status === 'ready' ? false : status === 'submitted' || status === 'streaming'
  // Efeito de scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Setup inicial: carrega agente e sessão (ou cria sessão nova)
  useEffect(() => {
    async function setupChat() {
      setIsInitializing(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      // 1. Carrega dados do agente selecionado
      const { data: currentAgent } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single()
        
      if (currentAgent) {
        setAgent(currentAgent)
      } else {
        router.push('/agentes')
        return
      }

      // 2. Carrega mensagens anteriores se tem session na URL
      const activeSession = urlSessionId
      
      if (activeSession) {
        setSessionId(activeSession)
        
        // Carrega mensagens do banco
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', activeSession)
          .order('created_at', { ascending: true })
          
        if (msgs && msgs.length > 0) {
          setMessages(msgs.map(m => ({
            id: m.id,
            role: m.role as 'user' | 'assistant' | 'system',
            parts: [{ type: 'text', text: m.content || '' }],
          })))
        }
      }

      setIsInitializing(false)
    }
    
    setupChat()
  }, [agentId, urlSessionId, router, setMessages, supabase])

  // Wrapper do Submit para criar sessão se não existir e salvar mensagem do user
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!(input || '').trim() || isLoading) return
    
    // Precisamos do input estático antes de resetar e limpá-lo imediatamente
    const userMessageContent = input
    setInput('')
    let currentSession = sessionId
    
    // Se não temos sessão, criar agora rapidinho no banco antes do call
    if (!currentSession) {
       const { data: { user } } = await supabase.auth.getUser()
       const { data: newSession } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user?.id,
          agent_id: agentId,
          title: userMessageContent.length > 40 ? userMessageContent.substring(0, 40) + '...' : userMessageContent
        })
        .select()
        .single()
        
       if (newSession) {
         currentSession = newSession.id
         setSessionId(currentSession)
         
         // Atualiza a barra de endereço sem recarregar a página
         window.history.replaceState(null, '', `/agentes/${agentId}/chat?sessao=${currentSession}`)
       }
    }
    
    // Salva a mensagem do usuário no banco imediatamente (fire and forget)
    if (currentSession) {
        const { data: { user } } = await supabase.auth.getUser()
        supabase.from('chat_messages').insert({
          session_id: currentSession,
          user_id: user?.id,
          role: 'user',
          content: userMessageContent
        }).then()
    }

    // Envia a mensagem usando a nova arquitetura do Vercel AI SDK
    sendMessage({ text: userMessageContent }, Object.assign({}, { body: { agent_id: agentId, session_id: currentSession } }))
  }

  const handleSuggestionClick = (text: string) => {
    setInput(text)
  }

  return (
    <main className="absolute inset-0 flex flex-col overflow-hidden bg-white dark:bg-[#000000]">
      
      {/* Header Interno do Chat - Floating concept */}
      <header className="relative w-full z-10 flex items-center justify-between px-4 pt-24 pb-2 shrink-0 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <button 
              onClick={() => router.push('/agentes')}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100/50 hover:bg-slate-200/50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-white/70 transition-colors backdrop-blur-md"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
          
          <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl">
             <span className="material-symbols-outlined text-[#0ea5e9] text-[18px]">smart_toy</span>
             <h1 className="text-sm font-bold text-slate-800 dark:text-white/90">
               {agent?.name || 'Carregando...'}
             </h1>
             <span className="bg-[#0ea5e9]/10 text-[#0ea5e9] text-[9px] uppercase font-bold px-2 py-0.5 rounded-full">
                {agent?.category || 'Geral'}
             </span>
          </div>
        </div>
        <div className="flex items-center">
           <button onClick={() => router.push('/agentes/historico')} className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white transition-colors bg-slate-100/50 hover:bg-slate-200/50 dark:bg-white/5 dark:hover:bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md">
              <span className="material-symbols-outlined text-sm">history</span>
              <span>Histórico</span>
           </button>
        </div>
      </header>

      {/* Área de Mensagens */}
      {isInitializing ? (
          <div className="flex-1 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0ea5e9] text-3xl animate-spin">refresh</span>
          </div>
      ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 mt-10">
              <div className="text-center mb-6">
                 <div className="size-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#0ea5e9]/20 to-indigo-500/20 border border-[#0ea5e9]/20 flex items-center justify-center shadow-[0_0_40px_rgba(14,165,233,0.15)]">
                     <span className="material-symbols-outlined text-[#0ea5e9] text-4xl">smart_toy</span>
                 </div>
                 <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{agent?.name || 'Novo Agente'}</h2>
                 <p className="text-sm text-slate-500 dark:text-white/50 max-w-md mx-auto leading-relaxed">
                     Inicie nossa conversa. Como tenho acesso a todo o seu perfil e DNA de marca, garantiremos conteúdos 100% alinhados à sua identidade.
                 </p>
              </div>
          </div>
      ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar pt-6">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-6 space-y-6">
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-5 py-3 relative group ${message.role === 'user' ? 'bg-[#0ea5e9] text-white rounded-br-md' : 'bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white/90 border border-slate-200 dark:border-white/[0.06] rounded-bl-md'}`}>
                            {message.role === 'assistant' ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_p]:text-[13px] [&_li]:text-[13px] [&_p]:leading-relaxed [&_li]:leading-relaxed">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.parts?.filter(p => p.type === 'text').map((p: any) => p.text).join('\n') || ''}</ReactMarkdown>
                                </div>
                            ) : (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.parts?.filter(p => p.type === 'text').map((p: any) => p.text).join('\n')}</p>
                            )}
                            {message.role === 'assistant' && (
                                <button onClick={() => navigator.clipboard.writeText(message.parts?.filter(p => p.type === 'text').map((p: any) => p.text).join('\n') || '')} className="absolute -bottom-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-black/80 border border-white/10 hover:bg-white/10" title="Copiar">
                                    <span className="material-symbols-outlined text-white/60 text-xs">content_copy</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                    <div className="flex justify-start">
                        <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/[0.06] rounded-2xl rounded-bl-md px-5 py-4">
                            <div className="flex justify-center items-center gap-1.5 h-full">
                                <span className="size-2 rounded-full bg-slate-400 dark:bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="size-2 rounded-full bg-slate-400 dark:bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="size-2 rounded-full bg-slate-400 dark:bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
          </div>
      )}

      {/* Text Input Footer */}
      <div className="shrink-0 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto">
           <form onSubmit={onSubmit} className="relative flex items-end gap-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl px-3 py-2 focus-within:border-[#0ea5e9]/50 focus-within:ring-2 focus-within:ring-[#0ea5e9]/10 transition-all">
             
             <button type="button" className="size-9 rounded-xl flex items-center justify-center shrink-0 mb-0.5 transition-all text-slate-400 hover:text-slate-600 dark:hover:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10">
               <span className="material-symbols-outlined text-lg">attach_file</span>
             </button>

             <textarea 
                value={input || ''}
                onChange={(e) => handleInputChange(e)}
                placeholder={`Envie uma requisição para o ${agent?.name || 'agente'}...`}
                className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 resize-none py-2 leading-relaxed disabled:opacity-50 min-h-[36px] max-h-[200px]"
                rows={1}
                disabled={isLoading}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        onSubmit(e as any)
                    }
                }}
             />

             <button 
               type="submit"
               disabled={!(input || '').trim() || isLoading}
               className={`size-9 rounded-xl flex items-center justify-center shrink-0 mb-0.5 transition-all ${(input || '').trim() && !isLoading ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/30 hover:bg-[#0ea5e9]/90 scale-100' : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-white/30 scale-95'}`}
             >
               {isLoading ? <span className="material-symbols-outlined text-lg animate-spin">refresh</span> : <span className="material-symbols-outlined text-lg">arrow_upward</span>}
             </button>
           </form>
           
           <p className="text-center text-[11px] text-slate-400 dark:text-white/30 mt-2">
              Respostas baseadas no DNA do seu cliente. A IA pode cometer erros de interpretação.
           </p>
        </div>
      </div>

    </main>
  )
}
