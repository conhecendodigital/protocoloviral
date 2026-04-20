'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ArrowRight, AtSign, CheckCircle, Eye, EyeOff, Lock, RefreshCw } from 'lucide-react'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const translateError = (msg: string) => {
    const errors: Record<string, string> = {
      'Invalid login credentials': 'Email ou senha incorretos',
      'Email not confirmed': 'Confirme seu email antes de entrar',
      'User already registered': 'Este email já está cadastrado',
      'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
    }
    return errors[msg] || msg
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(translateError(error.message))
      else window.location.href = '/'
    } catch {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('As senhas não coincidem'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) setError(translateError(error.message))
      else if (data.session) window.location.href = '/'
      else setSuccess('Conta criada! Verifique seu email (caixa de entrada ou spam).')
    } catch {
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full h-full bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 flex items-center justify-center overflow-auto py-8">

      {/* Immersive Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="glow-sphere-sky absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full"></div>
        <div className="glow-sphere-blue absolute -bottom-40 -right-20 w-[700px] h-[700px] rounded-full"></div>
      </div>

      {/* Main Content Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Header / Logo — OUTSIDE the card */}
        <div className="flex flex-col items-center mb-8">
          <div className="size-12 bg-[#0ea5e9] rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(14,165,233,0.5)]">
            <svg className="text-slate-900 dark:text-white w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">Mapa do Engajamento</h1>
          <p className="text-slate-800 dark:text-white/90 font-medium">
            {mode === 'login' ? 'Sua jornada premium começa aqui' : 'Crie sua conta e decole agora'}
          </p>
        </div>

        {/* Glass Login Card */}
        <div className="glass-card-login rounded-xl p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={mode === 'login' ? handleLogin : handleSignup}>
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white/90 ml-1">E-mail Corporativo</label>
              <div className="relative">
                <AtSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 dark:text-white/90 text-xl" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black/5 dark:bg-white/5 border border-slate-300/10 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/50 transition-all" 
                  placeholder="nome@empresa.com" 
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white/90">Senha de Acesso</label>
                {mode === 'login' && (
                  <a className="text-xs font-semibold text-[#0ea5e9] hover:text-[#0ea5e9]/80 transition-colors" href="mailto:suporte@protocoloviral.com.br">Esqueceu?</a>
                )}
              </div>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 dark:text-white/90 text-xl" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  className="w-full bg-black/5 dark:bg-white/5 border border-slate-300/10 dark:border-white/10 rounded-xl py-4 pl-12 pr-12 text-slate-900 dark:text-white placeholder:text-slate-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/50 transition-all" 
                  placeholder={mode === 'signup' ? "No mínimo 6 caracteres" : "••••••••"} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 dark:text-white/90 hover:text-slate-800 dark:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (signup only) */}
            {mode === 'signup' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 overflow-hidden">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white/90 ml-1">Confirmar Senha</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 dark:text-white/90 text-xl" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                    className="w-full bg-black/5 dark:bg-white/5 border border-slate-300/10 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/50 transition-all" 
                    placeholder="Repita sua senha" 
                  />
                </div>
              </motion.div>
            )}

            {/* Error/Success Messages */}
            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</p>}
            {success && (
              <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <CheckCircle size={18} className="text-lg" />
                {success}
              </div>
            )}

            {/* Primary Action Button */}
            <button 
              disabled={loading}
              className="shimmer-btn-auth w-full text-white font-bold py-4 rounded-xl shadow-lg shadow-[#0ea5e9]/20 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none" 
              type="submit"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw size={20} className="animate-spin text-xl" /> Processando...
                </span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Entrar na Plataforma' : 'Criar Conta Agora'}</span>
                  <ArrowRight size={20} className="text-xl" />
                </>
              )}
            </button>

            {/* Social Logins (Google/Apple) — hidden for now */}
          </form>
        </div>

        {/* Footer Links — OUTSIDE the card */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-slate-800 dark:text-white/90 text-sm">
            {mode === 'login' ? 'Não possui conta? ' : 'Já possui conta? '}
            <button 
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }} 
              className="text-[#0ea5e9] font-bold hover:underline"
            >
              {mode === 'login' ? 'Solicite acesso' : 'Fazer login'}
            </button>
          </p>
          <div className="flex justify-center gap-6 text-xs font-medium text-slate-700 dark:text-white/90">
            <a className="hover:text-slate-800 dark:text-slate-300" href="/termos">Termos de Uso</a>
            <a className="hover:text-slate-800 dark:text-slate-300" href="/privacidade">Privacidade</a>
            <a className="hover:text-slate-800 dark:text-slate-300" href="mailto:suporte@protocoloviral.com.br">Suporte</a>
          </div>
        </div>
      </motion.div>

      {/* Decorative floating elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] opacity-20">
          <div className="w-24 h-24 border border-slate-300/20 dark:border-white/20 rounded-full blur-sm"></div>
        </div>
        <div className="absolute bottom-[20%] right-[10%] opacity-20">
          <div className="w-32 h-32 border border-[#0ea5e9]/20 rounded-full blur-sm"></div>
        </div>
      </div>
    </div>
  )
}
