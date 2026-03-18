---
name: Premium Dark UI
description: Design system com tema escuro premium inspirado em Apple/visionOS — glassmorphism, animações suaves, tipografia Plus Jakarta Sans. Para aplicar em qualquer app Next.js + Tailwind CSS v4.
---

# Premium Dark UI — Design System Skill

Este skill contém todo o sistema visual premium utilizado no **Mapa do Engajamento**. Use-o como base para qualquer novo app Next.js + Tailwind CSS v4.

---

## 📦 Dependências Obrigatórias

```bash
npm install framer-motion lucide-react
```

### Google Fonts (adicionar no `layout.tsx` ou `<head>`)
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
```

### HTML Root
```html
<html class="dark" lang="pt-BR">
```

---

## 🎨 Paleta de Cores

| Token | Valor | Uso |
|:--|:--|:--|
| `--color-brand-primary` | `#0ea5e9` (Sky Blue) | CTAs, links, destaques, XP bar |
| `--color-brand-secondary` | `#8b5cf6` (Violet) | Gradientes, acentos |
| `--color-brand-accent` | `#f59e0b` (Amber) | Badges "Marco", alertas |
| `--color-brand-success` | `#10b981` (Emerald) | Sucesso, "Concluído" |
| Background (dark) | `oklch(0.18 0.03 260)` | Navy-black base |
| Background (pages) | `#000000` | Pure black em login/auth |
| Borders | `rgba(255, 255, 255, 0.08-0.1)` | Glass borders |
| Text primary | `text-white` | Títulos |
| Text secondary | `text-slate-400` | Subtítulos, descrições |
| Text muted | `text-slate-500` | Placeholders, timestamps |

### Gradientes Principais
```css
/* CTA Button */
background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);

/* Brand Rainbow */
background: linear-gradient(135deg, #0ea5e9, #8b5cf6, #f59e0b);

/* Text Gradient */
background-image: linear-gradient(135deg, #38bdf8, #818cf8, #c084fc);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* Sidebar */
background: linear-gradient(180deg, oklch(0.11 0.01 260) 0%, oklch(0.14 0.012 260) 100%);
```

---

## 🪟 Glassmorphism Classes

### `.glass` — Base glass effect
```css
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

### `.glass-card` — Interactive card com hover physics
```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1),
              box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}
/* Hover: sobe + glow */
a.glass-card:hover, button.glass-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
}
```

### `.glass-header` — Sticky blurred header
```css
.glass-header {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
```

---

## ✨ Shimmer Button

```css
.shimmer-btn {
  background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
  position: relative;
  overflow: hidden;
}
.shimmer-btn::after {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: rotate(45deg);
  animation: shimmer 3s infinite linear;
}
```

### Uso em JSX:
```tsx
<button className="shimmer-btn px-6 py-2.5 rounded-full text-white text-sm font-bold shadow-lg shadow-[#0ea5e9]/20">
  Entrar na Plataforma →
</button>
```

---

## 🎬 Animações Apple-Style

### Keyframes (adicionar no globals.css)
```css
@keyframes fade-in-up {
  0%   { opacity: 0; transform: translateY(24px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes slide-in-left {
  0%   { opacity: 0; transform: translateX(-24px) scale(0.98); }
  100% { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.4); }
  50%      { box-shadow: 0 0 20px 8px rgba(14, 165, 233, 0); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
}
```

### Easing Global (Apple Silky)
```css
* { transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
```

### Hover Apple-Style
```css
.apple-hover {
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}
.apple-hover:hover {
  transform: scale(1.05) translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}
```

---

## 📐 Layout Dashboard Pattern

```tsx
// layout.tsx
<div className="bg-[#000000] text-slate-100 min-h-screen font-sans">
  {/* Background Glow Spheres */}
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[120px]" />
    <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-blue-600/10 rounded-full blur-[120px]" />
  </div>
  
  <div className="relative z-10 flex h-screen overflow-hidden">
    <Sidebar className="shrink-0" />
    <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
      <Header className="sticky top-0 z-20" />
      <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex-1">
        {children}
      </main>
    </div>
  </div>
</div>
```

---

## 🧩 Component Patterns

### Sidebar (responsive — hidden on mobile)
```tsx
<aside className="hidden lg:flex w-20 lg:w-64 flex-col border-r border-white/5 bg-black/50 backdrop-blur-md">
  {/* Logo */}
  <div className="p-6 flex items-center gap-3">
    <div className="size-10 bg-[#0ea5e9] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#0ea5e9]/20">
      <span className="material-symbols-outlined">map</span>
    </div>
    <span className="font-bold text-lg tracking-tight hidden lg:block text-white">App Name</span>
  </div>
  
  {/* Nav Item (active) */}
  <a className="flex items-center gap-4 px-3 py-3 rounded-xl bg-[#0ea5e9]/20 text-[#0ea5e9]">
    <span className="material-symbols-outlined fill-1">home</span>
    <span className="font-medium hidden lg:block">Home</span>
  </a>
  
  {/* Nav Item (inactive) */}
  <a className="flex items-center gap-4 px-3 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white">
    <span className="material-symbols-outlined">settings</span>
    <span className="font-medium hidden lg:block">Settings</span>
  </a>
</aside>
```

### Page Title Pattern
```tsx
<h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase italic">
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#0ea5e9]">
    JORNADA DE
  </span>{' '}CONTEÚDO
</h1>
<p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
  Descrição aqui.
</p>
```

### Glass Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <a href="/feature" className="glass-card rounded-2xl p-6 group relative overflow-hidden">
    {/* Hover glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    
    <div className="relative z-10">
      <div className="size-12 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[#0ea5e9]">auto_awesome</span>
      </div>
      <h3 className="font-bold text-lg text-white mb-1">Feature Name</h3>
      <p className="text-sm text-slate-400">Description text goes here.</p>
    </div>
  </a>
</div>
```

### Badge Patterns
```tsx
{/* Standard */}
<span className="bg-white/10 text-white/70 px-2 py-0.5 rounded-full text-[10px] font-bold">50</span>

{/* Hot/Animated */}
<span className="bg-gradient-to-r from-amber-500 to-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse">🔥</span>

{/* Eyebrow Label */}
<span className="text-[10px] text-[#0ea5e9] bg-[#0ea5e9]/10 px-2.5 py-1 rounded font-black tracking-widest uppercase">#01</span>

{/* Success */}
<span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">Concluída</span>
```

### Terminal/Code Block
```tsx
<div className="rounded-xl overflow-hidden border border-white/10 bg-[#000000] shadow-2xl">
  <div className="flex items-center px-4 py-3 border-b border-white/10 bg-white/[0.02]">
    <div className="flex gap-2">
      <div className="w-3 h-3 rounded-full bg-red-500/80" />
      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
      <div className="w-3 h-3 rounded-full bg-green-500/80" />
    </div>
    <span className="ml-4 text-xs font-mono text-slate-500">filename.ts</span>
  </div>
  <pre className="p-6 text-sm font-mono text-[#0ea5e9] whitespace-pre-wrap leading-relaxed">
    {code}
  </pre>
</div>
```

### Progress Bar (XP/Level)
```tsx
<div className="flex justify-between items-end mb-1.5">
  <span className="text-xs font-bold uppercase tracking-widest text-[#0ea5e9]">Nível 3</span>
  <span className="text-xs font-medium text-slate-400">450 / 1000 XP</span>
</div>
<div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
  <div className="h-full bg-gradient-to-r from-sky-400 to-[#0ea5e9] rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ width: '45%' }} />
</div>
```

---

## 📜 Scrollbar (Apple Style Minimal)
```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}
```

---

## 🔤 Tipografia

| Elemento | Classes |
|:--|:--|
| Font principal | `font-sans` → Plus Jakarta Sans |
| Font mono | `font-mono` → JetBrains Mono |
| H1 (page title) | `text-4xl lg:text-5xl font-black tracking-tighter uppercase italic` |
| H2 (section) | `text-2xl font-bold tracking-tight text-white` |
| H3 (card title) | `font-bold text-xl tracking-tight text-white` |
| Body | `text-sm text-slate-400 leading-relaxed` |
| Eyebrow | `text-[10px] font-black uppercase tracking-widest text-[#0ea5e9]` |
| Subtle | `text-xs text-slate-500` |

---

## 📱 Breakpoints

| Elemento | Mobile (<768px) | Tablet (md) | Desktop (lg) |
|:--|:--|:--|:--|
| Sidebar | Escondida | Escondida | Visível (w-64) |
| Hamburger | Visível | Visível | Escondido |
| Grids | 1 coluna | 2 colunas | 2-3 colunas |
| Padding | `p-6` | `p-6` | `p-10` / `p-12` |

---

## 🔑 Regras de Ouro

1. **Nunca usar cores genéricas** — sempre `#0ea5e9` (sky), `#8b5cf6` (violet), `#f59e0b` (amber)
2. **Sempre glassmorphism** — cards, headers, modais usam `backdrop-filter: blur()`
3. **Transições suaves** — easing global `cubic-bezier(0.16, 1, 0.3, 1)`
4. **Ícones Material Symbols** — sempre `<span className="material-symbols-outlined">`
5. **Background spheres** — glow spheres com `blur-[120px]` atrás do conteúdo
6. **Dark-first** — tudo é construído em `class="dark"` no `<html>`
7. **Hierarchy via opacity** — cards usam `bg-white/[0.03]`, borders usam `border-white/[0.08]`
8. **Tracking tight em títulos** — `tracking-tighter` para H1, `tracking-tight` para H2/H3
9. **Tracking widest em eyebrows** — labels pequenas com `tracking-widest uppercase`
10. **Shadow com brand color** — botões usam `shadow-lg shadow-[#0ea5e9]/20`
