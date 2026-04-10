'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';
import Link from 'next/link';
import { motion } from 'framer-motion';

/* ── AI Provider & Model Definitions ── */
interface AIModelOption {
    id: string;
    name: string;
}

interface AIProvider {
    id: string;
    label: string;
    icon: string;
    color: string;
    bg: string;
    borderColor: string;
    models: AIModelOption[];
}

const aiProviders: AIProvider[] = [
    {
        id: 'openai', label: 'OpenAI', icon: 'psychology', color: 'text-emerald-400', bg: 'bg-emerald-500/15', borderColor: 'border-emerald-500/30',
        models: [
            { id: 'gpt-4o', name: 'GPT-4o' },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
            { id: 'o3-mini', name: 'o3 Mini' },
            { id: 'o1-preview', name: 'o1 Preview' },
        ],
    },
    {
        id: 'anthropic', label: 'Anthropic', icon: 'smart_toy', color: 'text-amber-400', bg: 'bg-amber-500/15', borderColor: 'border-amber-500/30',
        models: [
            { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet' },
            { id: 'claude-3-5-haiku-latest', name: 'Claude 3.5 Haiku' },
        ],
    },
    {
        id: 'google', label: 'Google', icon: 'auto_awesome', color: 'text-blue-400', bg: 'bg-blue-500/15', borderColor: 'border-blue-500/30',
        models: [
            { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
            { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
        ],
    },
    {
        id: 'openrouter', label: 'OpenRouter (Open Source)', icon: 'route', color: 'text-rose-400', bg: 'bg-rose-500/15', borderColor: 'border-rose-500/30',
        models: [
            { id: 'deepseek-r1', name: 'DeepSeek R1' },
            { id: 'deepseek-v3', name: 'DeepSeek V3' },
            { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta Llama 3.3 70B' },
        ],
    },
];

function findModelInfo(modelId: string) {
    for (const provider of aiProviders) {
        const model = provider.models.find((m) => m.id === modelId);
        if (model) return { provider, model };
    }
    return null;
}

const categoryOptions = [
    { value: '', label: 'Selecionar categoria...' },
    { value: 'vendas', label: '💰 Vendas' },
    { value: 'conteudo', label: '✍️ Conteúdo' },
    { value: 'suporte', label: '🎧 Suporte ao Cliente' },
    { value: 'estrategico', label: '🚀 Estratégico' },
    { value: 'produtividade', label: '📊 Produtividade' },
];

interface UploadedFile {
    id: string; // db id or temp local id
    name: string;
    size: string;
    type: string;
    file?: File; // Only new files have File object
    storage_path?: string; // Only DB files have this
}

export default function EditarAgentePage() {
    const router = useRouter();
    const params = useParams();
    const agentId = params?.id as string;
    const supabase = createClient();
    
    /* ── Form State ── */
    const [agentName, setAgentName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('ativo');
    const [requiredPlan, setRequiredPlan] = useState('free');
    const [selectedModel, setSelectedModel] = useState('gpt-4o');
    const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState('');
    
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [filesToDelete, setFilesToDelete] = useState<string[]>([]); // storage_paths
    const [dbFilesIdsToDelete, setDbFilesIdsToDelete] = useState<string[]>([]);
    
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    /* ── Chat Preview State (Vercel AI SDK) ── */
    const { messages, setMessages, sendMessage, status: chatStatus } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat/preview',
            body: {
                system_prompt: systemPrompt,
                model: selectedModel
            }
        }),
        messages: [
            { id: 'welcome', role: 'assistant', parts: [{ type: 'text', text: 'Olá! 👋 Eu sou o seu agente atual. Altere meu prompt à esquerda e mande uma mensagem para testar meu novo comportamento antes de salvar!' }] }
        ] as UIMessage[]
    });

    // Estado manual para input
    const [input, setInput] = useState('')
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setInput(e.target.value)
    const isLoading = chatStatus === 'ready' ? false : chatStatus === 'submitted' || chatStatus === 'streaming'

    const onSubmitTest = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!(input || '').trim() || isLoading) return
        const userMessageContent = input
        setInput('')
        
        // Teste envia apenas o nome do agente (ou a string fixa 'test_agent') e mensagem
        sendMessage({ text: userMessageContent }, Object.assign({}, { body: { system_prompt: systemPrompt, model: selectedModel } }))
    }

    const fileUploadRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const modelDropdownRef = useRef<HTMLDivElement>(null);

    /* ── Fetch Initial Data ── */
    useEffect(() => {
        async function fetchAgentData() {
            if (!agentId) return;

            // ── Admin Check ──
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }

            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (!profile?.is_admin) {
                router.push('/agentes');
                return;
            }
            
            // fetch agent
            const { data: agent, error } = await supabase
                .from('agents')
                .select('*')
                .eq('id', agentId)
                .single();
                
            if (error || !agent) {
                setErrorMsg('Falha ao carregar os dados do agente.');
                setLoadingData(false);
                return;
            }
            
            setAgentName(agent.name);
            setDescription(agent.description || '');
            setCategory(agent.category || '');
            setStatus(agent.status || 'ativo');
            setSelectedModel(agent.ai_model || 'gpt-4o');
            setSystemPrompt(agent.system_prompt || '');
            setRequiredPlan(agent.required_plan || 'free');
            
            // fetch files
            const { data: dbFiles } = await supabase
                .from('knowledge_base_files')
                .select('*')
                .eq('agent_id', agentId);
                
            if (dbFiles) {
                const mappedFiles = dbFiles.map(f => ({
                    id: f.id,
                    name: f.file_name,
                    size: f.file_size,
                    type: f.file_type,
                    storage_path: f.storage_path
                }));
                setFiles(mappedFiles);
            }
            
            setLoadingData(false);
        }
        
        fetchAgentData();
    }, [agentId, supabase, router]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
                setModelDropdownOpen(false);
            }
        };
        if (modelDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [modelDropdownOpen]);

    const handleRemoveFile = (id: string) => {
        const targetFile = files.find(f => f.id === id);
        
        // Se for um arquivo existente no banco de dados, marca para deleção no Storage depois
        if (targetFile?.storage_path) {
            setFilesToDelete(prev => [...prev, targetFile.storage_path!]);
            setDbFilesIdsToDelete(prev => [...prev, id]);
        }
        
        // Remove from UI
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const f = e.target.files[0];

            // ── Security: Validate file type ──
            const allowedTypes = ['application/pdf', 'text/plain'];
            const allowedExtensions = ['.pdf', '.txt'];
            const ext = '.' + (f.name.split('.').pop()?.toLowerCase() || '');
            if (!allowedTypes.includes(f.type) && !allowedExtensions.includes(ext)) {
                alert('Formato não suportado. Envie apenas PDF ou TXT.');
                return;
            }

            // ── Security: Validate file size (max 20MB) ──
            const MAX_RAG_SIZE = 20 * 1024 * 1024;
            if (f.size > MAX_RAG_SIZE) {
                alert('Arquivo muito grande. Máximo: 20MB.');
                return;
            }

            setFiles((prev) => [
                ...prev,
                { id: `temp_${Date.now()}`, name: f.name, size: `${(f.size / 1024).toFixed(0)} KB`, type: f.name.split('.').pop()?.toUpperCase() || 'FILE', file: f },
            ]);
        }
    };

    const handleSave = async () => {
        if (!agentName) {
            setErrorMsg("O nome do agente é obrigatório.");
            return;
        }
        
        setErrorMsg(null);
        setSaving(true);
        
        try {
            const providerInfo = findModelInfo(selectedModel);
            const providerId = providerInfo?.provider.id || 'openai';

            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) throw new Error("Usuário não autenticado");

            // 1. Update Agent
            const { error: agentError } = await supabase
                .from('agents')
                .update({
                    name: agentName,
                    description,
                    category,
                    ai_provider: providerId,
                    ai_model: selectedModel,
                    system_prompt: systemPrompt,
                    required_plan: requiredPlan,
                    status
                })
                .eq('id', agentId);

            if (agentError) throw agentError;

            // 2. Delete marked files
            if (filesToDelete.length > 0) {
                // Remove from Storage
                await supabase.storage.from('knowledge_base').remove(filesToDelete);
                // Remove from DB
                await supabase.from('knowledge_base_files').delete().in('id', dbFilesIdsToDelete);
            }

            // 3. Upload New Files (RAG)
            const newFiles = files.filter(f => f.file);
            if (newFiles.length > 0) {
                const uploadPromises = newFiles.map(async (fileObj) => {
                    const cleanFileName = fileObj.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const timestamp = Date.now();
                    const storagePath = `${agentId}/${timestamp}-${cleanFileName}`;

                    const { error: storageError } = await supabase.storage
                        .from('knowledge_base')
                        .upload(storagePath, fileObj.file!, { upsert: false });

                    if (storageError) {
                        console.error("Storage upload error:", storageError);
                        return;
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('knowledge_base')
                        .getPublicUrl(storagePath);

                    await supabase.from('knowledge_base_files').insert({
                        agent_id: agentId,
                        file_name: fileObj.name,
                        file_type: fileObj.type,
                        file_size: fileObj.size,
                        file_url: publicUrl,
                        storage_path: storagePath,
                        uploaded_by: userData.user.id
                    });
                });
                
                await Promise.allSettled(uploadPromises);
            }

            setSaved(true);
            setTimeout(() => {
                setSaved(false);
                router.push('/agentes');
            }, 2000);
            
        } catch (error: any) {
            console.error("Erro ao atualizar agente:", error);
            setErrorMsg(error.message || "Erro ao atualizar agente.");
        } finally {
            setSaving(false);
        }
    };

    const toggleAgentStatus = async () => {
        const newStatus = status === 'ativo' ? 'inativo' : 'ativo';
        setStatus(newStatus); // optimistic UI
        try {
            const { error } = await supabase
                .from('agents')
                .update({ status: newStatus })
                .eq('id', agentId);
            if (error) throw error;
        } catch (error) {
            console.error("Erro ao alterar status:", error);
            setStatus(status); // revert
            alert("Erro ao alterar status.");
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const executeDelete = async () => {
        try {
            const { error } = await supabase
                .from('agents')
                .delete()
                .eq('id', agentId);

            if (error) throw error;
            router.push('/agentes');
        } catch (error) {
            console.error("Erro ao excluir agente:", error);
            alert("Erro ao excluir agente.");
        }
    };

    const selectedModelInfo = findModelInfo(selectedModel);

    if (loadingData) {
        return (
            <main className="flex-1 w-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto w-full custom-scrollbar pb-20">
            <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
                {/* ─── HEADER ─── */}
                <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/agentes" className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors border border-border">
                            <span className="material-symbols-outlined text-xl">arrow_back</span>
                        </Link>
                        <div className="bg-secondary p-3 rounded-xl border border-border shadow-[0_0_20px_rgba(0,0,0,0.1)]">
                            <span className="material-symbols-outlined text-muted-foreground text-2xl">settings</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase italic"><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#0ea5e9]">CONFIGURAÇÕES DO</span> AGENTE</h1>
                            <p className="text-muted-foreground mt-0.5 text-sm">Ajuste o comportamento do {agentName}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={toggleAgentStatus}
                            className="flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 transition-colors w-12 h-12 text-muted-foreground hover:text-foreground border border-border shadow-lg"
                            title={status === 'inativo' ? 'Ativar Agente' : 'Desativar Agente'}
                        >
                            <span className="material-symbols-outlined text-[20px]">{status === 'inativo' ? 'visibility' : 'visibility_off'}</span>
                        </button>
                        
                        <button 
                            onClick={handleDeleteClick}
                            className="flex items-center justify-center rounded-xl bg-secondary hover:bg-destructive/20 transition-colors w-12 h-12 text-muted-foreground hover:text-destructive border border-border shadow-lg"
                            title="Excluir Permanentemente"
                        >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                        
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg h-12 ${saving
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-foreground hover:bg-foreground/90 justify-center text-background border border-border shadow-[0_0_30px_rgba(0,0,0,0.1)] dark:shadow-[0_0_30px_rgba(255,255,255,0.15)]'
                                }`}
                        >
                            {saving ? (
                                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                            ) : saved ? (
                                <span className="material-symbols-outlined text-[18px] text-emerald-500">check</span>
                            ) : (
                                <span className="material-symbols-outlined text-[18px]">save</span>
                            )}
                            {saving ? 'Atualizando...' : saved ? 'Salvo!' : 'Salvar Alterações'}
                        </button>
                    </div>
                </motion.header>

                {errorMsg && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3">
                        <span className="material-symbols-outlined">error</span>
                        <p className="font-medium text-sm">{errorMsg}</p>
                    </div>
                )}

                {/* ─── TWO COLUMN LAYOUT ─── */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* ══════════════════════════════
                       LEFT COLUMN — CONFIGURATION
                       ══════════════════════════════ */}
                    <div className="w-full lg:w-[60%] space-y-6">

                        {/* ── Basic Info ── */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-50 dark:bg-white/[0.03] rounded-3xl p-6 border border-slate-200 dark:border-white/[0.08]">
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Nome do Agente</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <span className="material-symbols-outlined text-muted-foreground text-lg">badge</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={agentName}
                                                onChange={(e) => setAgentName(e.target.value)}
                                                className="w-full bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Categoria</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <span className="material-symbols-outlined text-muted-foreground text-lg">category</span>
                                            </div>
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-10 py-3 text-sm text-foreground focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none"
                                            >
                                                {categoryOptions.map((opt) => (
                                                    <option key={opt.value} value={opt.value} className="bg-popover text-foreground">{opt.label}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <span className="material-symbols-outlined text-muted-foreground text-lg">expand_more</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                    <div className="col-span-1 md:col-span-3">
                                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Descrição Curta</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-3 pointer-events-none">
                                                <span className="material-symbols-outlined text-muted-foreground text-lg">description</span>
                                            </div>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows={2}
                                                className="w-full bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                         <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Status</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <span className="material-symbols-outlined text-muted-foreground text-lg">toggle_on</span>
                                            </div>
                                            <select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="w-full bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-foreground focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none"
                                            >
                                                <option value="ativo" className="bg-popover text-emerald-500 dark:text-emerald-400">Ativo</option>
                                                <option value="inativo" className="bg-popover text-rose-500 dark:text-rose-400">Inativo</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                
                            </div>
                        </motion.div>

                        {/* ── AI Model Selection ── */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-50 dark:bg-white/[0.03] rounded-3xl p-6 border border-slate-200 dark:border-white/[0.08] relative z-20">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="bg-indigo-500/10 p-2 rounded-lg">
                                    <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400 text-xl">memory</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Motor de Inteligência</h3>
                                    <p className="text-xs text-muted-foreground">Escolha o modelo de IA que vai alimentar o agente</p>
                                </div>
                            </div>

                            <div ref={modelDropdownRef} className="relative">
                                <button
                                    onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                                    className={`w-full bg-white dark:bg-[#141926] rounded-xl px-4 py-3 flex items-center gap-3 transition-all text-left ${modelDropdownOpen
                                        ? 'border border-indigo-500 ring-1 ring-indigo-500'
                                        : 'border border-slate-200 dark:border-white/10 hover:border-indigo-500/50'
                                        }`}
                                >
                                    {selectedModelInfo ? (
                                        <>
                                            <div className={`${selectedModelInfo.provider.bg} p-1.5 rounded-lg flex-shrink-0`}>
                                                <span className={`material-symbols-outlined text-[16px] ${selectedModelInfo.provider.color}`}>{selectedModelInfo.provider.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate">{selectedModelInfo.model.name}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium">{selectedModelInfo.provider.label}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-muted-foreground text-lg">memory</span>
                                            <span className="text-sm text-muted-foreground">Selecionar modelo...</span>
                                        </>
                                    )}
                                    <span className={`material-symbols-outlined text-muted-foreground text-lg ml-auto transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                                </button>

                                {modelDropdownOpen && (
                                    <div className="absolute z-50 mt-2 w-full bg-popover border border-border rounded-xl shadow-[0_15px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_15px_50px_rgba(0,0,0,0.6)] overflow-hidden">
                                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                            {aiProviders.map((provider, pi) => (
                                                <div key={provider.id}>
                                                    <div className={`sticky top-0 z-10 bg-popover/95 backdrop-blur-sm px-4 py-2 flex items-center gap-2 ${pi > 0 ? 'border-t border-border' : ''}`}>
                                                        <div className={`${provider.bg} p-1 rounded-md`}>
                                                            <span className={`material-symbols-outlined text-[14px] ${provider.color}`}>{provider.icon}</span>
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{provider.label}</span>
                                                    </div>
                                                    {provider.models.map((model) => {
                                                        const isSelected = selectedModel === model.id;
                                                        return (
                                                            <button
                                                                key={model.id}
                                                                onClick={() => { setSelectedModel(model.id); setModelDropdownOpen(false); }}
                                                                className={`w-full text-left px-4 py-2.5 pl-11 flex items-center justify-between transition-colors ${isSelected
                                                                    ? 'bg-indigo-500/10 text-indigo-500'
                                                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                                                    }`}
                                                            >
                                                                <span className={`text-sm ${isSelected ? 'font-bold' : 'font-medium'}`}>{model.name}</span>
                                                                {isSelected && <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400 text-[16px]">check_circle</span>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* ── System Prompt ── */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-50 dark:bg-white/[0.03] rounded-3xl p-6 border border-slate-200 dark:border-white/[0.08]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-amber-500/10 p-2 rounded-lg">
                                    <span className="material-symbols-outlined text-amber-500 dark:text-amber-400 text-xl">code</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">System Prompt</h3>
                                    <p className="text-xs text-muted-foreground">Instruções comportamentais do Agente</p>
                                </div>
                            </div>

                            <textarea
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                rows={8}
                                className="w-full bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all resize-none font-mono leading-relaxed custom-scrollbar"
                            />
                        </motion.div>

                        {/* ── Knowledge Base (RAG) ── */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-slate-50 dark:bg-white/[0.03] rounded-3xl p-6 border border-slate-200 dark:border-white/[0.08]">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="bg-blue-500/10 p-2 rounded-lg">
                                    <span className="material-symbols-outlined text-blue-400 text-xl">folder_open</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Base de Treinamento (RAG)</h3>
                                    <p className="text-xs text-muted-foreground">PDFs e Textos que a IA vai ler para responder com contexto.</p>
                                </div>
                            </div>

                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileUpload({ target: { files: e.dataTransfer.files } } as any); }}
                                onClick={() => fileUploadRef.current?.click()}
                                className={`border-dashed border-2 rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver
                                    ? 'border-indigo-500 bg-indigo-500/5'
                                    : 'border-slate-300 dark:border-white/10 hover:border-indigo-500/50 hover:bg-secondary/30'
                                    }`}
                            >
                                <div className={`mx-auto size-12 rounded-full flex items-center justify-center mb-3 transition-colors ${dragOver ? 'bg-indigo-500/20' : 'bg-secondary'}`}>
                                    <span className={`material-symbols-outlined text-2xl ${dragOver ? 'text-indigo-400' : 'text-muted-foreground'}`}>cloud_upload</span>
                                </div>
                                <p className="text-sm font-bold text-foreground mb-1">
                                    {dragOver ? 'Solte para enviar!' : 'Arraste arquivos ou clique aqui'}
                                </p>
                                <p className="text-[11px] text-muted-foreground">Documentos suportados: PDF, TXT</p>
                                <input ref={fileUploadRef} type="file" accept=".pdf,.txt" onChange={handleFileUpload} className="hidden" />
                            </div>

                            {files.length > 0 && (
                                <div className="mt-5 space-y-2">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Arquivos Anexados ({files.length})</h4>
                                    {files.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 group">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${file.type === 'PDF' ? 'bg-rose-500/15 text-rose-400' : 'bg-blue-500/15 text-blue-400'}`}>
                                                    <span className="material-symbols-outlined text-[16px]">
                                                        {file.type === 'PDF' ? 'picture_as_pdf' : 'description'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{file.size} {file.storage_path && "— Ativo no DB"}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFile(file.id)}
                                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                title="Remover arquivo"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                            </button>
                                        </div>
                                    ))}
                                    {filesToDelete.length > 0 && (
                                        <p className="text-[10px] text-destructive/80 mt-2 font-medium">As deleções ocorrerão ao Salvar Alterações.</p>
                                    )}
                                </div>
                            )}
                        </motion.div>

                    </div>

                    {/* ══════════════════════════════
                       RIGHT COLUMN — CHAT PREVIEW
                       ══════════════════════════════ */}
                    <div className="w-full lg:w-[40%] sticky top-8">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-slate-50 dark:bg-white/[0.03] rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-8rem)] border border-slate-200 dark:border-white/[0.08] shadow-2xl shadow-indigo-500/5">

                            <div className="px-5 py-4 border-b border-border bg-secondary/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                        <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400 text-[16px]">visibility</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Live Preview</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold uppercase tracking-wider">Testando Atualização</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setMessages([])} className="text-muted-foreground hover:text-foreground transition-colors" title="Limpar Chat">
                                    <span className="material-symbols-outlined text-[18px]">clear_all</span>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-background/40">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'assistant' && (
                                            <div className="size-7 rounded-lg bg-indigo-500/20 flex items-center justify-center mr-2 flex-shrink-0 mt-1 border border-indigo-500/20">
                                                <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400 text-[14px]">smart_toy</span>
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed break-words shadow-sm ${msg.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-tr-sm'
                                                : 'bg-secondary border border-border text-foreground rounded-tl-sm'
                                                }`}
                                        >
                                            {msg.parts?.filter(p => p.type === 'text').map((p: any) => p.text).join('\n') || ''}
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="size-7 rounded-lg bg-indigo-500/20 flex items-center justify-center mr-2 mt-1 border border-indigo-500/20">
                                            <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400 text-[14px]">smart_toy</span>
                                        </div>
                                        <div className="bg-secondary border border-border px-4 py-4 rounded-2xl rounded-tl-sm">
                                            <div className="flex items-center gap-1">
                                                <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                                                <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                                                <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-4 border-t border-border bg-secondary/30">
                                <form onSubmit={onSubmitTest} className="relative flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={handleInputChange}
                                        placeholder="Pressione Enter para testar..."
                                        className="flex-1 bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!(input || '').trim() || isLoading}
                                        className="absolute right-2 flex-shrink-0 size-8 rounded-lg flex items-center justify-center transition-all bg-indigo-500 text-white hover:bg-indigo-400 disabled:bg-muted disabled:text-muted-foreground shadow-md"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                                    </button>
                                </form>
                                <p className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-3 text-center flex items-center justify-center gap-1 font-medium">
                                    <span className="material-symbols-outlined text-[12px]">bolt</span>
                                    Vercel AI SDK • {selectedModelInfo?.model.name || selectedModel}
                                </p>
                            </div>

                        </motion.div>
                    </div>

                </div>

            </div>

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl p-6 relative m-4">
                        <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-5">
                            <span className="material-symbols-outlined text-destructive text-2xl">warning</span>
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">Excluir Agente?</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                            ATENÇÃO: Deseja realmente excluir o agente <strong className="text-foreground">{agentName}</strong> de forma PERMANENTE? Esta ação não pode ser desfeita e apagará todo o histórico de conversas e sua base de conhecimento.
                        </p>
                        <div className="flex items-center justify-end gap-3 mt-auto">
                            <button 
                                onClick={() => setShowDeleteModal(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-secondary hover:bg-secondary/80 text-foreground transition-colors border border-border"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={executeDelete}
                                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors shadow-lg shadow-destructive/20 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                Excluir Permanentemente
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </main>
    );
}
