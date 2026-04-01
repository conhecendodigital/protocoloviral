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
    <div className="flex flex-col h-[calc(100vh-140px)] border border-border rounded-2xl glass-card overflow-hidden relative shadow-lg">
      
      {/* Header Interno do Chat */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <button 
              onClick={() => router.push('/agentes')}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(56,189,248,0.3)]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
               <h1 className="text-xl font-bold tracking-tight">
                 {agent?.name || 'Carregando...'}
               </h1>
               <span className="bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-sky-500/30">
                  {agent?.category || 'Geral'}
               </span>
            </div>
            <p className="text-sm text-muted-foreground capitalize">
              {agent?.ai_provider} • Mapeado ao seu DNA
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => router.push('/agentes/historico')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-secondary border border-border px-4 py-2 rounded-lg hover:bg-secondary/80">
              Ver Histórico
           </button>
        </div>
      </header>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth space-y-8 custom-scrollbar">
          {isInitializing && (
              <div className="flex h-full items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
          )}
          
          {!isInitializing && messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(56,189,248,0.2)]">
                      <Sparkles className="w-8 h-8 text-sky-500" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3">Estou pronto para ajudar.</h2>
                  <p className="text-muted-foreground mb-10 max-w-md leading-relaxed">
                      Inicie nossa conversa. Como tenho acesso a todo o seu perfil e DNA de marca, garantiremos conteúdos 100% alinhados à sua identidade.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <button onClick={() => handleSuggestionClick('Escreva um conteúdo instigante focando na principal dor do meu público.')} className="bg-secondary hover:bg-secondary/80 border border-border p-4 rounded-xl text-left transition-all hover:border-sky-500/50 group">
                          <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">Tocar na Ferida</h3>
                          <p className="text-xs text-muted-foreground">Conteúdo focado em dores latentes...</p>
                      </button>
                      <button onClick={() => handleSuggestionClick('Faça um resumo dos meus principais diferenciais e como evidenciá-los.')} className="bg-secondary hover:bg-secondary/80 border border-border p-4 rounded-xl text-left transition-all hover:border-sky-500/50 group">
                          <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">Reforçar Autoridade</h3>
                          <p className="text-xs text-muted-foreground">Listar os grandes diferenciais do DNA...</p>
                      </button>
                  </div>
              </div>
          )}

          <div className="max-w-4xl mx-auto space-y-8 pb-4">
              {messages.map((message) => (
                  <div key={message.id} className={`flex gap-4 animate-in slide-in-from-bottom-2 duration-300 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${message.role === 'assistant' ? 'bg-gradient-to-tr from-sky-500 to-blue-600 border-sky-400/30 shadow-[0_0_15px_rgba(56,189,248,0.4)]' : 'bg-secondary border-border'}`}>
                          {message.role === 'assistant' ? (
                              <Sparkles className="w-5 h-5 text-white" />
                          ) : (
                              <div className="text-sm font-bold text-foreground">Você</div>
                          )}
                       </div>

                       <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-5 ${message.role === 'user' ? 'bg-secondary border border-border text-foreground overflow-hidden rounded-tr-sm' : 'bg-transparent text-foreground'}`}>
                           {message.role === 'user' ? (
                              <p className="whitespace-pre-wrap leading-relaxed text-[15px]">
                                {message.parts?.filter(p => p.type === 'text').map((p: any) => p.text).join('\n')}
                              </p>
                           ) : (
                              <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-headings:text-foreground prose-a:text-sky-600 dark:prose-a:text-sky-400 leading-relaxed text-[15px] prose-p:text-foreground">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {message.parts?.filter(p => p.type === 'text').map((p: any) => p.text).join('\n') || ''}
                                  </ReactMarkdown>
                              </div>
                           )}
                       </div>
                  </div>
              ))}

              {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                   <div className="flex gap-4 animate-in fade-in duration-300">
                       <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-tr from-sky-500 to-blue-600 border border-sky-400/30 shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                           <Sparkles className="w-5 h-5 text-white" />
                       </div>
                       <div className="bg-transparent rounded-2xl p-5">
                           <div className="flex gap-1.5 items-center h-6">
                               <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                               <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                               <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                           </div>
                       </div>
                   </div>
              )}
              
              <div ref={messagesEndRef} />
          </div>
      </div>

      {/* Text Input Footer */}
      <div className="p-4 md:p-6 bg-card border-t border-border shrink-0">
        <div className="max-w-4xl mx-auto relative">
           <form onSubmit={onSubmit} className="glass-card border border-border rounded-2xl p-2 flex items-end gap-2 shadow-sm focus-within:border-sky-500/50 focus-within:ring-1 focus-within:ring-sky-500/50 transition-all">
             
             <button type="button" className="w-12 h-12 flex items-center justify-center rounded-xl bg-transparent hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0">
               <Paperclip className="w-5 h-5" />
             </button>

             <textarea 
                value={input || ''}
                onChange={(e) => handleInputChange(e)}
                placeholder={`Envie uma requisição para o ${agent?.name || 'agente'}...`}
                className="w-full bg-transparent border-none focus:ring-0 text-foreground resize-none py-3.5 px-2 max-h-32 min-h-[48px] custom-scrollbar focus:outline-none placeholder:text-muted-foreground"
                rows={1}
                style={{ height: 'auto' }}
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
               className={`w-12 h-12 flex items-center justify-center rounded-xl shrink-0 transition-all ${(input || '').trim() && !isLoading ? 'bg-sky-500 text-white hover:bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.4)]' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
             >
               {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
             </button>
           </form>
           <div className="mt-3 text-center">
              <p className="text-[11px] text-muted-foreground font-medium">Respostas baseadas no DNA do seu cliente. A IA pode cometer erros de interpretação.</p>
           </div>
        </div>
      </div>

    </div>
  )
}
