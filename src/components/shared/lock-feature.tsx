'use client'

import { Lock } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface LockFeatureProps {
  name: string
  description: string
}

export function LockFeature({ name, description }: LockFeatureProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative flex items-center gap-3 w-full p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 opacity-60 hover:opacity-80 hover:border-amber-400/50 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700">
          <Lock className="w-5 h-5 text-slate-400" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{name}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Disponível na Chave AI</p>
        </div>
        <div className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
          Pro
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-center text-xl">{name}</DialogTitle>
            <DialogDescription className="text-center">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="p-4 rounded-xl bg-linear-to-br from-sky-50 to-violet-50 dark:from-sky-950/50 dark:to-violet-950/50 border border-sky-200/50 dark:border-sky-800/50">
              <p className="text-sm text-center text-slate-600 dark:text-slate-300">
                Esta funcionalidade faz parte do <strong className="text-gradient">Escritório de IA</strong> — 
                disponível exclusivamente na <strong>Chave AI</strong>.
              </p>
            </div>

            <div className="text-center space-y-2">
              <p className="text-2xl font-bold text-gradient">R$ 497/ano</p>
              <p className="text-xs text-muted-foreground">Curso completo + Escritório de IA + Agentes</p>
            </div>

            <Button
              className="w-full bg-linear-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 text-white font-semibold"
              onClick={() => window.open('https://hotmart.com/chave-ai', '_blank')}
            >
              Quero minha Chave AI →
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
