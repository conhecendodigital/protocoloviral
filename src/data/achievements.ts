import type { Achievement } from '@/types/gamification'

export const ACHIEVEMENTS: Record<string, Achievement> = {
  FIRST_PROMPT:      { key: 'FIRST_PROMPT',      name: 'Primeiro Passo',              description: 'Gerou seu primeiro prompt',                       icon: 'Target',         xp: 10 },
  PROFILE_COMPLETE:  { key: 'PROFILE_COMPLETE',  name: 'Perfil Ninja',                description: 'Completou 100% do perfil',                        icon: 'CheckCircle2',   xp: 50 },
  WEEK_STREAK:       { key: 'WEEK_STREAK',        name: 'Consistência',                description: '7 dias consecutivos usando a ferramenta',         icon: 'Flame',          xp: 100 },
  FIRST_POST:        { key: 'FIRST_POST',         name: 'Criador Ativo',               description: 'Colou a primeira resposta do ChatGPT',            icon: 'Smartphone',     xp: 25 },
  POWER_USER:        { key: 'POWER_USER',         name: 'Power User',                  description: 'Gerou 50 prompts',                                icon: 'Zap',            xp: 200 },
  CONTENT_MASTER:    { key: 'CONTENT_MASTER',     name: 'Mestre do Conteúdo',          description: 'Gerou 100 prompts',                               icon: 'Crown',          xp: 500 },
  ALL_PROMPTS:       { key: 'ALL_PROMPTS',        name: 'Ciclo Completo',              description: 'Usou todos os 5 tipos de prompt',                 icon: 'RefreshCw',      xp: 75 },
  VIRAL_POTENTIAL:   { key: 'VIRAL_POTENTIAL',    name: 'Potencial Viral',             description: 'Recebeu score 80+ na análise de conteúdo',        icon: 'Rocket',         xp: 150 },
  EARLY_ADOPTER:     { key: 'EARLY_ADOPTER',      name: 'Early Adopter',               description: 'Um dos primeiros 100 usuários',                   icon: 'Star',           xp: 100 },
  NIGHT_OWL:         { key: 'NIGHT_OWL',          name: 'Coruja Noturna',              description: 'Usou a ferramenta depois das 23h',                icon: 'Moon',           xp: 15 },
  WEEKEND_WARRIOR:   { key: 'WEEKEND_WARRIOR',    name: 'Guerreiro de Fim de Semana',  description: 'Usou a ferramenta no sábado ou domingo',          icon: 'Sword',          xp: 20 },
  HOOK_COLLECTOR:    { key: 'HOOK_COLLECTOR',     name: 'Colecionador de Ganchos',     description: 'Copiou 20 ganchos virais',                        icon: 'Anchor',         xp: 30 },
}

export const XP_ACTIONS: Record<string, number> = {
  GENERATE_PROMPT_FREE:     2,
  GENERATE_PROMPT_AI:       5,
  PASTE_RESPONSE:           3,
  COPY_HOOK:                1,
  COMPLETE_PROFILE_FIELD:   2,
  ANALYZE_CONTENT:          5,
  LOGIN_DAILY:              5,
  SHARE_CONTENT:            10,
}
