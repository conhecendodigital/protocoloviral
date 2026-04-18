#!/usr/bin/env python3
"""Surgical final fixes for the remaining 10 Material Symbols occurrences."""
from pathlib import Path
import re

def add_import(content, icons):
    ex = re.search(r"import\s*\{([^}]+)\}\s*from\s*'lucide-react'", content)
    if ex:
        cur = {i.strip() for i in ex.group(1).split(',') if i.strip()}
        merged = sorted(cur | icons)
        new = "import { " + ", ".join(merged) + " } from 'lucide-react'"
        return content[:ex.start()] + new + content[ex.end():]
    last = list(re.finditer(r'^import\s+.+$', content, re.MULTILINE))
    new = "import { " + ", ".join(sorted(icons)) + " } from 'lucide-react'"
    if last:
        pos = last[-1].end()
        return content[:pos] + "\n" + new + content[pos:]
    return new + "\n" + content

def add_dynamic_import(content):
    di = "import { DynamicIcon } from '@/components/ui/dynamic-icon'"
    if di in content: return content
    last = list(re.finditer(r'^import\s+.+$', content, re.MULTILINE))
    if last:
        pos = last[-1].end()
        return content[:pos] + "\n" + di + content[pos:]
    return di + "\n" + content

# ──────────────────────────────────────────────
# formatos/page.tsx
# ──────────────────────────────────────────────
p = Path("src/app/(dashboard)/formatos/page.tsx")
c = p.read_text()
OLD = """                       <span className="material-symbols-outlined text-[#0ea5e9] text-[18px]">
                         {ordenacao === 'recente' ? 'schedule' : ordenacao === 'engajamento' ? 'trending_up' : 'visibility'}
                       </span>"""
NEW = "{ordenacao === 'recente' ? <Clock size={18} className=\"text-[#0ea5e9]\" /> : ordenacao === 'engajamento' ? <TrendingUp size={18} className=\"text-[#0ea5e9]\" /> : <Eye size={18} className=\"text-[#0ea5e9]\" />}"
c = c.replace(OLD, NEW)
c = add_import(c, {'Clock', 'TrendingUp', 'Eye'})
p.write_text(c)
print("✅ formatos/page.tsx")

# ──────────────────────────────────────────────
# agentes/novo/page.tsx
# ──────────────────────────────────────────────
p = Path("src/app/(dashboard)/agentes/novo/page.tsx")
c = p.read_text()
c = c.replace(
    '<span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400 text-3xl">robot_2</span>',
    '<Bot size={30} className="text-indigo-500 dark:text-indigo-400" />'
)
OLD2 = """                                                    <span className="material-symbols-outlined text-[16px]">
                                                        {file.type === 'PDF' ? 'picture_as_pdf' : 'description'}
                                                    </span>"""
NEW2 = "{file.type === 'PDF' ? <FileText size={16} /> : <FileText size={16} />}"
c = c.replace(OLD2, NEW2)
c = add_import(c, {'Bot', 'FileText'})
p.write_text(c)
print("✅ agentes/novo/page.tsx")

# ──────────────────────────────────────────────
# agentes/[id]/editar/page.tsx
# ──────────────────────────────────────────────
p = Path("src/app/(dashboard)/agentes/[id]/editar/page.tsx")
c = p.read_text()
c = c.replace(
    '<span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400 text-3xl">robot_2</span>',
    '<Bot size={30} className="text-indigo-500 dark:text-indigo-400" />'
)
OLD3 = """                                                    <span className="material-symbols-outlined text-[16px]">
                                                        {file.type === 'PDF' ? 'picture_as_pdf' : 'description'}
                                                    </span>"""
NEW3 = "{file.type === 'PDF' ? <FileText size={16} /> : <FileText size={16} />}"
c = c.replace(OLD3, NEW3)
# Fix the broken Eye/EyeOff from earlier pass
c = c.replace(
    '<span className="material-symbols-outlined text-[20px]">{status === \'inativo\' ? <Eye size={18} /> : <EyeOff size={18} />}</span>',
    '{status === \'inativo\' ? <Eye size={18} /> : <EyeOff size={18} />}'
)
c = add_import(c, {'Bot', 'FileText', 'Eye', 'EyeOff'})
p.write_text(c)
print("✅ agentes/[id]/editar/page.tsx")

# ──────────────────────────────────────────────
# roteiros/page.tsx
# ──────────────────────────────────────────────
p = Path("src/app/(dashboard)/roteiros/page.tsx")
c = p.read_text()
OLD4 = """                                <span className="material-symbols-outlined text-[14px]">
                                  {savingId === r.id ? 'autorenew' : editingId === r.id ? 'check' : 'edit'}
                                </span>"""
NEW4 = "{savingId === r.id ? <RefreshCw size={14} /> : editingId === r.id ? <Check size={14} /> : <Pencil size={14} />}"
c = c.replace(OLD4, NEW4)
c = add_import(c, {'RefreshCw', 'Check', 'Pencil'})
p.write_text(c)
print("✅ roteiros/page.tsx")

# ──────────────────────────────────────────────
# bio-analyzer/page.tsx
# ──────────────────────────────────────────────
p = Path("src/app/(dashboard)/bio-analyzer/page.tsx")
c = p.read_text()
OLD5 = """                            "material-symbols-outlined",
                            item.status === 'good' ? "text-emerald-500" : item.status === 'warning' ? "text-orange-500" : "text-rose-500"
                          )}>
                            {item.status === 'good' ? 'check_circle' : item.status === 'warning' ? 'warning' : 'error'}"""
NEW5 = """item.status === 'good' ? "text-emerald-500" : item.status === 'warning' ? "text-orange-500" : "text-rose-500"
                          )}>
                            {item.status === 'good' ? <CheckCircle size={18} /> : item.status === 'warning' ? <AlertTriangle size={18} /> : <AlertCircle size={18} />}"""
c = c.replace(OLD5, NEW5)
# Also remove the cn( line that references material-symbols-outlined
c = add_import(c, {'CheckCircle', 'AlertTriangle', 'AlertCircle'})
p.write_text(c)
print("✅ bio-analyzer/page.tsx")

# ──────────────────────────────────────────────
# jornada/page.tsx
# ──────────────────────────────────────────────
p = Path("src/app/(dashboard)/jornada/page.tsx")
c = p.read_text()
OLD6 = """                                <span className="material-symbols-outlined text-xl">
                                  {isDone ? 'undo' : 'check_circle'}
                                </span>"""
NEW6 = "{isDone ? <Undo size={20} /> : <CheckCircle size={20} />}"
c = c.replace(OLD6, NEW6)
c = add_import(c, {'Undo', 'CheckCircle'})
p.write_text(c)
print("✅ jornada/page.tsx")

# ──────────────────────────────────────────────
# perfil/GamifiedQuestion.tsx
# ──────────────────────────────────────────────
p = Path("src/components/perfil/GamifiedQuestion.tsx")
c = p.read_text()
OLD7 = """                  <span className="material-symbols-outlined text-sm">
                    {opt.icon || (isSelected ? 'check' : 'radio_button_unchecked')}
                  </span>"""
NEW7 = "{opt.icon ? <DynamicIcon name={opt.icon} size={14} /> : isSelected ? <Check size={14} /> : <Circle size={14} />}"
c = c.replace(OLD7, NEW7)
c = add_import(c, {'Check', 'Circle'})
c = add_dynamic_import(c)
p.write_text(c)
print("✅ GamifiedQuestion.tsx")

# ──────────────────────────────────────────────
# ModeSelector.tsx
# ──────────────────────────────────────────────
p = Path("src/components/roteirista/ModeSelector.tsx")
c = p.read_text()
OLD8 = '<span className={cn("material-symbols-outlined text-3xl mb-3 block", mode.color)}>\n              {mode.icon}\n            </span>'
NEW8 = '<DynamicIcon name={mode.icon} size={30} className={cn("mb-3 block", mode.color)} />'
c = c.replace(OLD8, NEW8)
c = add_dynamic_import(c)
p.write_text(c)
print("✅ ModeSelector.tsx")

# Final count
remaining = sum(1 for f in Path("src").rglob("*.tsx") if "material-symbols-outlined" in f.read_text())
print(f"\n📊 Final remaining: {remaining} files")
