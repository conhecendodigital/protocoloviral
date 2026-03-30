    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Identidade Demográfica */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <span className="material-symbols-outlined text-[80px] text-purple-400">person_pin</span>
        </div>
        <div className="flex items-center gap-3 mb-5">
          <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <span className="material-symbols-outlined text-purple-400 text-xl">badge</span>
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Perfil Demográfico</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Nome', value: data.demografico.nome, icon: 'person' },
            { label: 'Idade', value: data.demografico.idade, icon: 'cake' },
            { label: 'Gênero', value: data.demografico.genero, icon: 'wc' },
            { label: 'Estado Civil', value: data.demografico.estadoCivil, icon: 'favorite' },
            { label: 'Cidade', value: data.demografico.cidade, icon: 'location_on' },
            { label: 'Profissão', value: data.demografico.profissao, icon: 'work' },
            { label: 'Renda', value: data.demografico.renda, icon: 'payments' },
            { label: 'Escolaridade', value: data.demografico.escolaridade, icon: 'school' },
          ].map((item) => item.value && (
            <div key={item.label} className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="material-symbols-outlined text-purple-400 text-[14px]">{item.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40">{item.label}</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rotina Diária */}
      {data.rotina && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
              <span className="material-symbols-outlined text-sky-400 text-xl">schedule</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Rotina Diária</h3>
          </div>
          <div className="text-sm leading-relaxed"><FormattedContent text={data.rotina} /></div>
        </div>
      )}

      {/* Perfil Psicológico */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="size-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <span className="material-symbols-outlined text-rose-400 text-xl">psychology</span>
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Perfil Psicológico</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Dores Superficiais', subtitle: 'O que ela fala que é o problema', value: data.psicologico.doresSuperficiais, color: 'red', icon: 'sentiment_dissatisfied' },
            { label: 'Dores Profundas', subtitle: 'O que ela realmente sente', value: data.psicologico.doresProfundas, color: 'rose', icon: 'heart_broken' },
            { label: 'Desejos Declarados', subtitle: 'O que ela diz querer', value: data.psicologico.desejosDeclarados, color: 'amber', icon: 'star' },
            { label: 'Desejos Ocultos', subtitle: 'O que ela realmente quer sentir', value: data.psicologico.desejosOcultos, color: 'violet', icon: 'visibility_off' },
          ].map((item) => item.value && (
            <div key={item.label} className={`p-5 rounded-2xl bg-${item.color}-500/5 border border-${item.color}-500/10`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`material-symbols-outlined text-${item.color}-400 text-lg`}>{item.icon}</span>
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest text-${item.color}-400 block`}>{item.label}</span>
                </div>
              </div>
              <div className="text-sm leading-relaxed mt-2"><FormattedContent text={item.value} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Comportamento Digital */}
      {(data.comportamentoDigital.consumo || data.comportamentoDigital.influenciadores || data.comportamentoDigital.compra) && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="size-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <span className="material-symbols-outlined text-cyan-400 text-xl">phone_iphone</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Comportamento Digital</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.comportamentoDigital.consumo && (
              <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-2">Consumo de Conteúdo</span>
                <div className="text-sm leading-relaxed"><FormattedContent text={data.comportamentoDigital.consumo} /></div>
              </div>
            )}
            {data.comportamentoDigital.influenciadores && (
              <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-400 block mb-2">Influenciadores</span>
                <div className="text-sm leading-relaxed"><FormattedContent text={data.comportamentoDigital.influenciadores} /></div>
              </div>
            )}
            {data.comportamentoDigital.compra && (
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-2">Comportamento de Compra</span>
                <div className="text-sm leading-relaxed"><FormattedContent text={data.comportamentoDigital.compra} /></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Objeções */}
      {data.objecoes && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-orange-500/10 bg-orange-500/[0.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <span className="material-symbols-outlined text-orange-400 text-xl">block</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Objeções e Barreiras</h3>
          </div>
          <div className="text-sm leading-relaxed"><FormattedContent text={data.objecoes} /></div>
        </div>
      )}

      {/* Gatilhos */}
      {data.gatilhos && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/10 bg-emerald-500/[0.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <span className="material-symbols-outlined text-emerald-400 text-xl">bolt</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Gatilhos de Conexão</h3>
          </div>
          <div className="text-sm leading-relaxed"><FormattedContent text={data.gatilhos} /></div>
        </div>
      )}

      {/* Mapa de Empatia */}
      {data.mapaEmpatia && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-violet-500/10 bg-violet-500/[0.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
              <span className="material-symbols-outlined text-violet-400 text-xl">map</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Mapa de Empatia</h3>
          </div>
          <div className="text-sm leading-relaxed"><FormattedContent text={data.mapaEmpatia} /></div>
        </div>
      )}
    </motion.div>
