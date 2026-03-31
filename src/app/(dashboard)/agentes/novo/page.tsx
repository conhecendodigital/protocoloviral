'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    id: string;
    name: string;
    size: string;
    type: string;
    file: File;
}

export default function NovoAgentePage() {
    const router = useRouter();
    const supabase = createClient();
    
    /* ── Form State ── */
    const [agentName, setAgentName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [selectedModel, setSelectedModel] = useState('gpt-4o');
    const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    /* ── Chat Preview State (Vercel AI SDK) ── */
    const { messages, status, sendMessage, setMessages } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat/preview',
            body: {
                system_prompt: systemPrompt,
                model: selectedModel
            }
        }),
        messages: [
            { id: 'welcome', role: 'assistant', parts: [{ type: 'text', text: 'Olá! 👋 Sou o preview do seu agente. Configure o system prompt à esquerda e me envie uma mensagem para testar como eu vou responder.' }] }
        ] as UIMessage[]
    });

    // Estado manual para input
    const [input, setInput] = useState('')
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setInput(e.target.value)
    const isLoading = status === 'ready' ? false : status === 'submitted' || status === 'streaming'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!(input || '').trim() || isLoading) return
        const userMessageContent = input
        setInput('')
        
        // Envia mensagem usando a nova arquitetura do Vercel AI SDK
        sendMessage({ text: userMessageContent }, Object.assign({}, { body: { system_prompt: systemPrompt, model: selectedModel } }))
    }

    const fileUploadRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const modelDropdownRef = useRef<HTMLDivElement>(null);

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
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const f = e.target.files[0];
            setFiles((prev) => [
                ...prev,
                { id: Date.now().toString(), name: f.name, size: `${(f.size / 1024).toFixed(0)} KB`, type: f.name.split('.').pop()?.toUpperCase() || 'FILE', file: f },
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

            // 1. Create Agent
            const { data: agentData, error: agentError } = await supabase
                .from('agents')
                .insert({
                    name: agentName,
                    description,
                    category,
                    ai_provider: providerId,
                    ai_model: selectedModel,
                    system_prompt: systemPrompt,
                    status: 'ativo'
                })
                .select()
                .single();

            if (agentError) throw agentError;
            const agentId = agentData.id;

            // 2. Upload Files (RAG)
            if (files.length > 0) {
                const uploadPromises = files.map(async (fileObj) => {
                    const cleanFileName = fileObj.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const timestamp = Date.now();
                    const storagePath = `${agentId}/${timestamp}-${cleanFileName}`;

                    const { error: storageError } = await supabase.storage
                        .from('knowledge_base')
                        .upload(storagePath, fileObj.file, { upsert: false });

                    if (storageError) {
                        console.error("Storage upload error:", storageError);
                        return; // proceed with others
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
            console.error("Erro ao salvar agente:", error);
            setErrorMsg(error.message || "Erro ao salvar agente.");
        } finally {
            setSaving(false);
        }
    };

    const selectedModelInfo = findModelInfo(selectedModel);

    return (
        <main className="flex-1 overflow-y-auto w-full custom-scrollbar pb-20">
            <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
                {/* ─── HEADER ─── */}
                <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/agentes" className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors border border-border">
                            <span className="material-symbols-outlined text-xl">arrow_back</span>
                        </Link>
                        <div className="bg-indigo-500/15 p-3 rounded-xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                            <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400 text-2xl">robot_2</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-foreground tracking-tight">Criar Novo Agente</h1>
                            <p className="text-muted-foreground mt-0.5 text-sm">Configure um consultor especialista de IA</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${saving
                            ? 'bg-indigo-500/50 text-white/60 cursor-not-allowed'
                            : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20'
                            }`}
                    >
                        {saving ? (
                            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                        ) : saved ? (
                            <span className="material-symbols-outlined text-[18px] text-emerald-300">check</span>
                        ) : (
                            <span className="material-symbols-outlined text-[18px]">save</span>
                        )}
                        {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Agente'}
                    </button>
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
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-3xl p-6 border border-border">
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Nome do Agente</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <span className="material-symbols-outlined text-slate-600 text-lg">badge</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={agentName}
                                                onChange={(e) => setAgentName(e.target.value)}
                                                placeholder="Ex: Copywriter PRO"
                                                className="w-full bg-background/50 border border-border rounded-xl pl-12 pr-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Categoria</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <span className="material-symbols-outlined text-slate-600 text-lg">category</span>
                                            </div>
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full bg-background/50 border border-border rounded-xl pl-12 pr-10 py-3 text-sm text-foreground focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none"
                                            >
                                                {categoryOptions.map((opt) => (
                                                    <option key={opt.value} value={opt.value} className="bg-popover text-foreground">{opt.label}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <span className="material-symbols-outlined text-slate-500 text-lg">expand_more</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Descrição Curta</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-3 pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-600 text-lg">description</span>
                                        </div>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={2}
                                            placeholder="Uma breve descrição do que este agente faz..."
                                            className="w-full bg-background/50 border border-border rounded-xl pl-12 pr-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* ── AI Model Selection ── */}
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-3xl p-6 border border-border relative z-20">
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
                                    className={`w-full bg-background/50 border rounded-xl px-4 py-3 flex items-center gap-3 transition-all text-left ${modelDropdownOpen
                                        ? 'border-indigo-500 ring-1 ring-indigo-500'
                                        : 'border-border hover:border-indigo-500/50'
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
                                            <span className="material-symbols-outlined text-slate-600 text-lg">memory</span>
                                            <span className="text-sm text-slate-500">Selecionar modelo...</span>
                                        </>
                                    )}
                                    <span className={`material-symbols-outlined text-slate-500 text-lg ml-auto transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
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
                                                                {isSelected && <span className="material-symbols-outlined text-indigo-400 text-[16px]">check_circle</span>}
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
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-3xl p-6 border border-border">
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
                                placeholder="Você é um especialista do Protocolo Viral. Sempre responda focando na viralização e retenção da audiência..."
                                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all resize-none font-mono leading-relaxed custom-scrollbar"
                            />
                        </motion.div>

                        {/* ── Knowledge Base (RAG) ── */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-3xl p-6 border border-border">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="bg-blue-500/10 p-2 rounded-lg">
                                    <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 text-xl">folder_open</span>
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
                                    : 'border-border hover:border-indigo-500/50 hover:bg-indigo-500/5'
                                    }`}
                            >
                                <div className={`mx-auto size-12 rounded-full flex items-center justify-center mb-3 transition-colors ${dragOver ? 'bg-indigo-500/20' : 'bg-secondary'}`}>
                                    <span className={`material-symbols-outlined text-2xl ${dragOver ? 'text-indigo-500 dark:text-indigo-400' : 'text-muted-foreground'}`}>cloud_upload</span>
                                </div>
                                <p className="text-sm font-bold text-muted-foreground mb-1">
                                    {dragOver ? 'Solte para enviar!' : 'Arraste arquivos ou clique aqui'}
                                </p>
                                <p className="text-[11px] text-muted-foreground">Documentos suportados: PDF, TXT</p>
                                <input ref={fileUploadRef} type="file" accept=".pdf,.txt" onChange={handleFileUpload} className="hidden" />
                            </div>

                            {files.length > 0 && (
                                <div className="mt-5 space-y-2">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Arquivos Anexados ({files.length})</h4>
                                    {files.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between bg-background/50 border border-border rounded-xl px-4 py-3 group">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${file.type === 'PDF' ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400' : 'bg-blue-500/15 text-blue-500 dark:text-blue-400'}`}>
                                                    <span className="material-symbols-outlined text-[16px]">
                                                        {file.type === 'PDF' ? 'picture_as_pdf' : 'description'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{file.size}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFile(file.id)}
                                                className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                    </div>

                    {/* ══════════════════════════════
                       RIGHT COLUMN — CHAT PREVIEW
                       ══════════════════════════════ */}
                    <div className="w-full lg:w-[40%] sticky top-8">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="glass-card rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-8rem)] border border-border shadow-2xl shadow-indigo-500/5">

                            <div className="px-5 py-4 border-b border-border bg-muted/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                        <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400 text-[16px]">visibility</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Live Preview</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold uppercase tracking-wider">Testando</span>
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
                                                <span className="material-symbols-outlined text-indigo-400 text-[14px]">smart_toy</span>
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed break-words shadow-sm ${msg.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-tr-sm'
                                                : 'bg-secondary/50 border border-border text-foreground rounded-tl-sm'
                                                }`}
                                        >
                                            {msg.parts?.filter(p => p.type === 'text').map((p: any) => p.text).join('\n') || ''}
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="size-7 rounded-lg bg-indigo-500/20 flex items-center justify-center mr-2 mt-1 border border-indigo-500/20">
                                            <span className="material-symbols-outlined text-indigo-400 text-[14px]">smart_toy</span>
                                        </div>
                                        <div className="bg-secondary/50 border border-border px-4 py-4 rounded-2xl rounded-tl-sm">
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

                            <div className="p-4 border-t border-border bg-muted/10">
                                <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={handleInputChange}
                                        placeholder="Pressione Enter para enviar..."
                                        className="flex-1 bg-background/80 border border-border rounded-xl pl-4 pr-12 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!(input || '').trim() || isLoading}
                                        className="absolute right-2 flex-shrink-0 size-8 rounded-lg flex items-center justify-center transition-all bg-indigo-500 text-white hover:bg-indigo-400 disabled:bg-muted disabled:text-muted-foreground shadow-md"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                                    </button>
                                </form>
                                <p className="text-[10px] text-indigo-400 mt-3 text-center flex items-center justify-center gap-1 font-medium">
                                    <span className="material-symbols-outlined text-[12px]">bolt</span>
                                    Vercel AI SDK • {selectedModelInfo?.model.name || selectedModel}
                                </p>
                            </div>

                        </motion.div>
                    </div>

                </div>

            </div>
        </main>
    );
}
