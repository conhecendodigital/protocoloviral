'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

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
    <div className="relative w-full h-full bg-black text-slate-100 flex items-center justify-center overflow-auto py-8">
      <style dangerouslySetInnerHTML={{__html: `
        .glow-sphere-sky {
          background: radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, rgba(14, 165, 233, 0) 70%);
          filter: blur(80px);
        }
        .glow-sphere-blue {
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0) 70%);
          filter: blur(80px);
        }
        .glass-card-login {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .shimmer-btn-auth {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
        }
        .shimmer-btn-auth::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to bottom right,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0) 40%,
            rgba(255,255,255,0.3) 50%,
            rgba(255,255,255,0) 60%,
            rgba(255,255,255,0) 100%
          );
          transform: rotate(30deg);
          pointer-events: none;
        }
      `}} />

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
            <svg className="text-white w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Mapa do Engajamento</h1>
          <p className="text-slate-400 font-medium">
            {mode === 'login' ? 'Sua jornada premium começa aqui' : 'Crie sua conta e decole agora'}
          </p>
        </div>

        {/* Glass Login Card */}
        <div className="glass-card-login rounded-xl p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={mode === 'login' ? handleLogin : handleSignup}>
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">E-mail Corporativo</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">alternate_email</span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/50 transition-all" 
                  placeholder="nome@empresa.com" 
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Senha de Acesso</label>
                {mode === 'login' && (
                  <a className="text-xs font-semibold text-[#0ea5e9] hover:text-[#0ea5e9]/80 transition-colors" href="#">Esqueceu?</a>
                )}
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">lock</span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/50 transition-all" 
                  placeholder={mode === 'signup' ? "No mínimo 6 caracteres" : "••••••••"} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password (signup only) */}
            {mode === 'signup' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 overflow-hidden">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Confirmar Senha</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">lock</span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/50 transition-all" 
                    placeholder="Repita sua senha" 
                  />
                </div>
              </motion.div>
            )}

            {/* Error/Success Messages */}
            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</p>}
            {success && (
              <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <span className="material-symbols-outlined text-lg">check_circle</span>
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
                  <span className="material-symbols-outlined animate-spin text-xl">sync</span> Processando...
                </span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Entrar na Plataforma' : 'Criar Conta Agora'}</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Ou continue com</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Social Logins — 2 column grid */}
            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-3 rounded-xl hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.51 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2.044-.156-2.995 1.09-4.001 1.091zm.065-1.61c.909-1.104 1.52-2.637 1.35-4.169-1.312.052-2.909.87-3.857 1.974-.844.974-1.584 2.532-1.385 4.026 1.454.117 2.974-.727 3.892-1.831z"></path>
                </svg>
                <span className="text-sm font-semibold">Apple</span>
              </button>
              <button type="button" className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-3 rounded-xl hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="text-sm font-semibold">Google</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer Links — OUTSIDE the card */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-slate-400 text-sm">
            {mode === 'login' ? 'Não possui conta? ' : 'Já possui conta? '}
            <button 
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }} 
              className="text-[#0ea5e9] font-bold hover:underline"
            >
              {mode === 'login' ? 'Solicite acesso' : 'Fazer login'}
            </button>
          </p>
          <div className="flex justify-center gap-6 text-xs font-medium text-slate-500">
            <a className="hover:text-slate-300" href="#">Termos de Uso</a>
            <a className="hover:text-slate-300" href="#">Privacidade</a>
            <a className="hover:text-slate-300" href="#">Suporte</a>
          </div>
        </div>
      </motion.div>

      {/* Decorative floating elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] opacity-20">
          <div className="w-24 h-24 border border-white/20 rounded-full blur-sm"></div>
        </div>
        <div className="absolute bottom-[20%] right-[10%] opacity-20">
          <div className="w-32 h-32 border border-[#0ea5e9]/20 rounded-full blur-sm"></div>
        </div>
      </div>
    </div>
  )
}
