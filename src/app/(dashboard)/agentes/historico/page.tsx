'use client'

export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Clock, MessageSquare, Sparkles, Trash2, ArrowRight, FolderOpen } from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const supabase = createClient()

interface ChatSession {
  id: string
  title: string
  updated_at: string
  agent_id: string
  agent_name?: string
  agent_avatar?: string
}

export default function HistoricoAgentesPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)

  // Estado que controla se estamos vendo as pastas de agentes ou as sessões de um agente específico
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

  useEffect(() => {
    async function loadSessions() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Carrega sessões
      const { data: s } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          title,
          updated_at,
          agent_id,
          agents (name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

        if (s) {
          setSessions(s.map(session => {
            const agentData = Array.isArray(session.agents) ? session.agents[0] : session.agents;
            return {
              id: session.id,
              title: session.title,
              updated_at: session.updated_at,
              agent_id: session.agent_id,
              agent_name: (agentData as any)?.name || 'Agente Excluído',
              agent_avatar: (agentData as any)?.avatar_url,
            }
          }))
        }
      setIsLoading(false)
    }

    loadSessions()
  }, [supabase])

  const deleteSession = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSessionToDelete(id);
  }

  const executeDeleteSession = async () => {
    if (!sessionToDelete) return;
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return;
    await supabase.from('chat_sessions').delete().eq('id', sessionToDelete).eq('user_id', user.id)
    setSessions(prev => prev.filter(s => s.id !== sessionToDelete))
    setSessionToDelete(null);
  }

  const navigateToChat = (agentId: string, sessionId: string) => {
    router.push(`/agentes/${agentId}/chat?sessao=${sessionId}`)
  }

  // Agrupar as sessões por Agente para a visualização inicial
  const agentsGrouped = useMemo(() => {
    const map = new Map<string, { id: string, name: string, avatar?: string, sessionCount: number, lastUpdate: string }>()
    
    sessions.forEach(session => {
      const existing = map.get(session.agent_id);
      if (!existing) {
        map.set(session.agent_id, {
          id: session.agent_id,
          name: session.agent_name || 'Agente Desconhecido',
          avatar: session.agent_avatar,
          sessionCount: 1,
          lastUpdate: session.updated_at
        })
      } else {
        existing.sessionCount += 1;
        // Atualiza a ultima data caso a sessão corrente seja mais recente
        if (new Date(session.updated_at) > new Date(existing.lastUpdate)) {
          existing.lastUpdate = session.updated_at;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());
  }, [sessions]);

  // Filtra sessões caso um agente tenha sido selecionado
  const filteredSessions = selectedAgentId 
    ? sessions.filter(s => s.agent_id === selectedAgentId)
    : [];

  const selectedAgentInfo = agentsGrouped.find(a => a.id === selectedAgentId);

  return (
    <div className="flex flex-col gap-6 relative z-10 w-full max-w-[1400px] mx-auto p-6 lg:p-10 pb-24">
      
      {/* Header View */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          {selectedAgentId ? (
            <button 
              onClick={() => setSelectedAgentId(null)}
              className="flex items-center gap-2 text-sm text-sky-600 dark:text-sky-500 font-medium hover:text-sky-500 dark:hover:text-sky-400 transition-colors mb-2 bg-sky-500/10 px-3 py-1.5 rounded-full"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para Pastas de Agentes
            </button>
          ) : (
            <button 
              onClick={() => router.push('/agentes')}
              className="flex items-center gap-2 text-sm text-muted-foreground font-medium hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para Biblioteca
            </button>
          )}

          <h1 className="text-3xl lg:text-4xl font-black tracking-tighter uppercase italic text-foreground mb-2 flex items-center gap-3">
            {selectedAgentId ? (
              <>
                <FolderOpen className="w-8 h-8 text-sky-500" />
                <span><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#0ea5e9]">CONVERSAS COM</span> <span className="text-foreground">{selectedAgentInfo?.name.toUpperCase()}</span></span>
              </>
            ) : (
              <><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#0ea5e9]">HISTÓRICO DE</span> CONVERSAS</>
            )}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            {selectedAgentId 
              ? 'Retome o diálogo de suas sessões anteriores com este agente.' 
              : 'Selecione abaixo o agente correspondente para explorar o acervo de conversas salvas.'}
          </p>
        </div>
      </div>

      <div className="w-full h-px bg-border my-2"></div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Sparkles className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        /* Vazio Geral */
        <div className="py-20 text-center animate-in fade-in zoom-in duration-500 bg-slate-50 dark:bg-white/[0.03] rounded-3xl border border-slate-200 dark:border-white/[0.08]">
           <div className="w-20 h-20 rounded-full border border-dashed border-border flex items-center justify-center mx-auto mb-6 bg-secondary">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
           </div>
           <h3 className="text-xl font-bold text-foreground mb-2">Nenhuma conversa encontrada</h3>
           <p className="text-muted-foreground max-w-sm mx-auto mb-6">Você ainda não interagiu com os agentes de IA. Inicie um diálogo na biblioteca de agentes.</p>
           <button 
               onClick={() => router.push('/agentes')}
               className="bg-sky-600 dark:bg-sky-500 text-white font-semibold py-3 px-8 rounded-xl hover:bg-sky-500 dark:hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20"
           >
               Ir para Agentes
           </button>
        </div>
      ) : selectedAgentId === null ? (
        /* VISÃO 1: Lista Agrupada por Agentes (Pastas) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {agentsGrouped.map((agent) => (
            <div 
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className="bg-card border border-border hover:border-sky-500/40 rounded-3xl p-6 flex flex-col cursor-pointer transition-all hover:bg-muted/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 group"
            >
              <div className="flex items-start justify-between mb-5">
                 <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center ring-1 ring-border overflow-hidden">
                       {agent.avatar ? (
                         <Image src={agent.avatar} alt="Avatar" width={56} height={56} className="w-full h-full object-cover" unoptimized />
                       ) : (
                         <Sparkles className="w-6 h-6 text-sky-500 dark:text-sky-400" />
                       )}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground tracking-tight">{agent.name}</p>
                      <p className="text-xs text-sky-600 dark:text-sky-400 font-medium py-0.5 mt-1 rounded-full bg-sky-500/10 w-fit px-2 border border-sky-500/20">
                        {agent.sessionCount} conversa{agent.sessionCount > 1 ? 's' : ''} gravada{agent.sessionCount > 1 ? 's' : ''}
                      </p>
                    </div>
                 </div>
              </div>

              <div className="mt-auto pt-6 flex items-center justify-between border-t border-border">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> 
                  Última vez {formatDistanceToNow(new Date(agent.lastUpdate), { addSuffix: true, locale: ptBR })}
                </span>
                
                <span className="text-sm font-bold text-sky-600 group-hover:text-sky-500 dark:text-sky-500 dark:group-hover:text-sky-400 transition-colors flex items-center gap-1">
                  Abrir <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VISÃO 2: Lista de Conversas do Agente Selecionado */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-8 fade-in duration-300">
          {filteredSessions.map((session) => (
            <div 
              key={session.id}
              onClick={() => navigateToChat(session.agent_id, session.id)}
              className="bg-card border border-border hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col cursor-pointer transition-all hover:bg-muted/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 group"
            >
              <div className="flex items-start justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center">
                       <MessageSquare className="w-4 h-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                    </div>
                 </div>

                 <button 
                   onClick={(e) => deleteSession(session.id, e)}
                   className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-destructive/10 opacity-0 group-hover:opacity-100 ring-1 ring-transparent hover:ring-destructive/20"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>

              <h4 className="text-lg font-bold text-foreground line-clamp-3 leading-snug mb-4">
                {session.title}
              </h4>

              <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> 
                  {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true, locale: ptBR })}
                </p>
                <span className="text-xs font-bold text-indigo-600 group-hover:text-indigo-500 dark:text-indigo-500 dark:group-hover:text-indigo-400 flex items-center gap-1">
                  Retomar <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          ))}
          
          {filteredSessions.length === 0 && (
             <div className="col-span-full py-16 text-center text-muted-foreground">
                Nenhuma conversa extra encontrada para este agente.
             </div>
          )}
        </div>
      )}

      {/* DELETE MODAL */}
      {sessionToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSessionToDelete(null)}>
              <div className="w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl p-6 relative m-4" onClick={(e) => e.stopPropagation()}>
                  <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-5">
                      <Trash2 className="text-destructive w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">Excluir Sessão?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                      Você tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex items-center justify-end gap-3 mt-auto">
                      <button 
                          onClick={() => setSessionToDelete(null)}
                          className="px-5 py-2.5 rounded-xl font-bold text-sm bg-secondary hover:bg-secondary/80 text-foreground transition-colors border border-border"
                      >
                          Cancelar
                      </button>
                      <button 
                          onClick={executeDeleteSession}
                          className="px-5 py-2.5 rounded-xl font-bold text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors shadow-lg shadow-destructive/20 flex items-center gap-2"
                      >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  )
}
