'use client'

import React, { useState, useEffect, useRef, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { ArrowLeft, ArrowUp, Bot, Copy, History, Loader2, MoreVertical, Paperclip, RefreshCw, Send, Sparkles } from 'lucide-react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Agent {
  id: string
  name: string
  category: string
  ai_provider: string
  ai_model: string
  avatar_url?: string | null
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
            <ArrowLeft size={18} className="text-lg" />
          </button>
          
          <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl">
             {agent?.avatar_url ? (
                 <Image src={agent.avatar_url} alt={agent.name || ''} width={22} height={22} className="size-[22px] rounded-full object-cover border border-[#0ea5e9]/20" unoptimized />
             ) : (
                 <Bot size={18} className="text-[#0ea5e9] text-[18px]" />
             )}
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
              <History size={14} className="text-sm" />
              <span>Histórico</span>
           </button>
        </div>
      </header>

      {/* Área de Mensagens */}
      {isInitializing ? (
          <div className="flex-1 flex items-center justify-center">
              <RefreshCw size={30} className="text-[#0ea5e9] text-3xl animate-spin" />
          </div>
      ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 mt-10">
              <div className="text-center mb-6">
                 <div className="size-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#0ea5e9]/20 to-indigo-500/20 border border-[#0ea5e9]/20 flex items-center justify-center shadow-[0_0_40px_rgba(14,165,233,0.15)] overflow-hidden">
                     {agent?.avatar_url ? (
                         <Image src={agent.avatar_url} alt={agent.name || ''} width={80} height={80} className="w-full h-full object-cover" unoptimized />
                     ) : (
                         <Bot size={36} className="text-[#0ea5e9] text-4xl" />
                     )}
                 </div>
                 <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{agent?.name || 'Novo Agente'}</h2>
                 <p className="text-sm text-slate-500 dark:text-white/50 max-w-md mx-auto leading-relaxed">
                     Inicie nossa conversa. Como tenho acesso a todo o seu perfil e DNA de marca, garantiremos conteúdos 100% alinhados à sua identidade.
                 </p>
              </div>
          </div>
      ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar pt-4">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-6 space-y-8">
                {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                        {/* Avatar IA */}
                        {message.role === 'assistant' && (
                            <div className="shrink-0 size-8 rounded-xl bg-gradient-to-br from-[#0ea5e9]/30 to-indigo-500/20 border border-[#0ea5e9]/20 flex items-center justify-center mt-1 shadow-[0_0_12px_rgba(14,165,233,0.15)] overflow-hidden">
                                {agent?.avatar_url ? (
                                    <Image src={agent.avatar_url} alt={agent.name || ''} width={32} height={32} className="w-full h-full object-cover" unoptimized />
                                ) : (
                                    <Sparkles size={14} className="text-[#0ea5e9]" />
                                )}
                            </div>
                        )}

                        {/* Bubble */}
                        <div className={`relative group ${
                            message.role === 'user'
                                ? 'max-w-[80%] bg-[#0ea5e9] text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-lg shadow-[#0ea5e9]/20'
                                : 'flex-1 min-w-0'
                        }`}>

                            {message.role === 'assistant' ? (
                                <div className="
                                    prose prose-sm dark:prose-invert max-w-none
                                    [&_h1]:text-xl [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:dark:text-white [&_h1]:mb-3 [&_h1]:mt-1 [&_h1]:tracking-tight
                                    [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:dark:text-white/90 [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:border-b [&_h2]:border-slate-200 [&_h2]:dark:border-white/10 [&_h2]:pb-1.5
                                    [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-[#0ea5e9] [&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:uppercase [&_h3]:tracking-wider
                                    [&_p]:text-[14px] [&_p]:leading-[1.8] [&_p]:text-slate-800 [&_p]:dark:text-white/85 [&_p]:mb-3
                                    [&_ul]:space-y-1.5 [&_ul]:my-3 [&_ul]:ml-1
                                    [&_ol]:space-y-1.5 [&_ol]:my-3 [&_ol]:ml-1
                                    [&_li]:text-[14px] [&_li]:leading-[1.7] [&_li]:text-slate-800 [&_li]:dark:text-white/85
                                    [&_li]:before:text-[#0ea5e9]
                                    [&_strong]:text-slate-900 [&_strong]:dark:text-white [&_strong]:font-bold
                                    [&_em]:text-slate-600 [&_em]:dark:text-white/60
                                    [&_code]:bg-slate-100 [&_code]:dark:bg-white/10 [&_code]:text-[#0ea5e9] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-[12px] [&_code]:font-mono
                                    [&_pre]:bg-slate-900 [&_pre]:dark:bg-black/60 [&_pre]:border [&_pre]:border-slate-200 [&_pre]:dark:border-white/10 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:my-3 [&_pre]:overflow-x-auto
                                    [&_pre_code]:bg-transparent [&_pre_code]:text-slate-100 [&_pre_code]:p-0 [&_pre_code]:text-[12px]
                                    [&_blockquote]:border-l-4 [&_blockquote]:border-[#0ea5e9]/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:dark:text-white/50 [&_blockquote]:my-3
                                    [&_hr]:border-slate-200 [&_hr]:dark:border-white/10 [&_hr]:my-4
                                    [&_a]:text-[#0ea5e9] [&_a]:underline [&_a]:underline-offset-2
                                    [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:text-[13px]
                                    [&_th]:bg-slate-100 [&_th]:dark:bg-white/5 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-bold [&_th]:border [&_th]:border-slate-200 [&_th]:dark:border-white/10
                                    [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-slate-200 [&_td]:dark:border-white/10
                                ">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {message.parts?.filter(p => p.type === 'text').map((p: any) => p.text).join('\n') || ''}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {message.parts?.filter(p => p.type === 'text').map((p: any) => p.text).join('\n')}
                                </p>
                            )}

                            {/* Botão copiar IA */}
                            {message.role === 'assistant' && (
                                <button
                                    onClick={() => navigator.clipboard.writeText(message.parts?.filter(p => p.type === 'text').map((p: any) => p.text).join('\n') || '')}
                                    className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white/70 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Copiar resposta"
                                >
                                    <Copy size={12} />
                                    Copiar
                                </button>
                            )}
                        </div>

                        {/* Spacer para alinhar user à direita */}
                        {message.role === 'user' && <div className="shrink-0 size-8" />}
                    </div>
                ))}

                {/* Typing indicator */}
                {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                    <div className="flex gap-3 justify-start">
                        <div className="shrink-0 size-8 rounded-xl bg-gradient-to-br from-[#0ea5e9]/30 to-indigo-500/20 border border-[#0ea5e9]/20 flex items-center justify-center mt-1">
                            <Sparkles size={14} className="text-[#0ea5e9] animate-pulse" />
                        </div>
                        <div className="flex items-center gap-1.5 px-4 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/[0.06] rounded-2xl rounded-bl-sm">
                            <span className="size-1.5 rounded-full bg-[#0ea5e9]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="size-1.5 rounded-full bg-[#0ea5e9]/60 animate-bounce" style={{ animationDelay: '160ms' }} />
                            <span className="size-1.5 rounded-full bg-[#0ea5e9]/60 animate-bounce" style={{ animationDelay: '320ms' }} />
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
               <Paperclip size={18} className="text-lg" />
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
               {isLoading ? <RefreshCw size={18} className="text-lg animate-spin" /> : <ArrowUp size={18} className="text-lg" />}
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
