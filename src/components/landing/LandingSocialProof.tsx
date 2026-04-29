// Logos de plataformas onde os criadores atuam — prova de contexto
export function LandingSocialProof() {
  const logos = [
    { name: 'Instagram', color: '#E1306C' },
    { name: 'TikTok', color: '#69C9D0' },
    { name: 'YouTube', color: '#FF0000' },
    { name: 'Kwai', color: '#FF6B00' },
  ]

  return (
    <section className="border-y border-white/[0.05] bg-white/[0.02] py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16">
        <p className="text-xs font-bold uppercase tracking-widest text-white/30 shrink-0">
          Funciona para criadores que postam em
        </p>
        <div className="flex items-center gap-10">
          {logos.map(l => (
            <div key={l.name} className="flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity">
              <span className="size-2 rounded-full" style={{ background: l.color }} />
              <span className="text-sm font-bold text-white">{l.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
