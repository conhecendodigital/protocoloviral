'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Bell, Shield, Palette, Globe, Trash2, AlertTriangle } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)

  return (
    <main className="flex-1 w-full relative z-10">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center border border-[#0ea5e9]/20">
              <Settings size={20} className="text-[#0ea5e9]" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Configurações
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-white/50 ml-13">
            Personalize sua experiência na plataforma.
          </p>
        </motion.div>

        {/* Aparência */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <Palette size={18} className="text-violet-400" />
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Aparência</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Tema</p>
              <p className="text-xs text-slate-500 dark:text-white/40 mt-0.5">Escolha entre modo claro ou escuro</p>
            </div>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 capitalize ${
                    theme === t
                      ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/30'
                      : 'bg-black/5 dark:bg-white/5 text-slate-700 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  {t === 'light' ? 'Claro' : t === 'dark' ? 'Escuro' : 'Sistema'}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Notificações */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <Bell size={18} className="text-amber-400" />
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Notificações</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Notificações do painel</p>
              <p className="text-xs text-slate-500 dark:text-white/40 mt-0.5">Alertas de XP, conquistas e lembretes</p>
            </div>
            {/* Toggle switch */}
            <button
              onClick={() => setNotifications(n => !n)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                notifications ? 'bg-[#0ea5e9]' : 'bg-slate-200 dark:bg-white/10'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                notifications ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </motion.div>

        {/* Segurança */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield size={18} className="text-emerald-400" />
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Segurança</h2>
          </div>

          <div className="space-y-4">
            <a
              href="mailto:suporte@protocoloviral.com.br?subject=Trocar Senha"
              className="flex items-center justify-between p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 hover:border-[#0ea5e9]/30 transition-all group"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Trocar Senha</p>
                <p className="text-xs text-slate-500 dark:text-white/40 mt-0.5">Solicitar alteração via suporte</p>
              </div>
              <Globe size={16} className="text-slate-400 group-hover:text-[#0ea5e9] transition-colors" />
            </a>
          </div>
        </motion.div>

        {/* Zona de Perigo */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-6 sm:p-8 border border-red-500/20 bg-red-500/[0.02]"
        >
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle size={18} className="text-red-400" />
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Zona de Perigo</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Excluir Conta</p>
              <p className="text-xs text-slate-500 dark:text-white/40 mt-0.5">Esta ação é permanente e não pode ser desfeita</p>
            </div>
            <a
              href="mailto:suporte@protocoloviral.com.br?subject=Excluir minha conta"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-500 text-sm font-bold hover:bg-red-500/10 transition-all"
            >
              <Trash2 size={14} />
              Solicitar exclusão
            </a>
          </div>
        </motion.div>

      </div>
    </main>
  )
}
