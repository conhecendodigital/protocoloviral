import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Termos de Uso — Mapa do Engajamento',
  description: 'Leia os Termos de Uso da plataforma Mapa do Engajamento antes de utilizar nossos serviços.',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050810] text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-white/[0.06] bg-white/80 dark:bg-[#050810]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar
          </Link>
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center">
              <FileText size={14} className="text-[#0ea5e9]" />
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-white/80">Mapa do Engajamento</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Title block */}
        <div className="mb-12">
          <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-3">Documento Legal</p>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Termos de Uso
          </h1>
          <p className="text-slate-500 dark:text-white/50 text-sm">
            Última atualização: <strong>29 de abril de 2025</strong>
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-10 text-[15px] leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-black flex items-center justify-center shrink-0">1</span>
              Aceitação dos Termos
            </h2>
            <p className="text-slate-600 dark:text-white/70">
              Ao acessar ou utilizar a plataforma <strong>Mapa do Engajamento</strong> ("Plataforma"), você concorda integralmente com estes Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize a Plataforma.
            </p>
            <p className="text-slate-600 dark:text-white/70 mt-3">
              Estes Termos constituem um acordo vinculativo entre você e <strong>Mapa do Engajamento</strong>, operado por Matheus Daia. Você deve ter pelo menos 18 anos de idade para usar a Plataforma.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-black flex items-center justify-center shrink-0">2</span>
              Descrição do Serviço
            </h2>
            <p className="text-slate-600 dark:text-white/70">
              O Mapa do Engajamento é uma plataforma de criação de conteúdo assistida por Inteligência Artificial, que oferece:
            </p>
            <ul className="mt-3 space-y-2 text-slate-600 dark:text-white/70 list-none pl-0">
              {[
                'Geração de roteiros virais por IA (Roteirista Pro)',
                'Banco de formatos e estruturas de vídeos de alta performance',
                'Tom de voz personalizado com base no perfil do criador',
                'Banco de ganchos e gatilhos mentais',
                'Ferramentas de planejamento de conteúdo',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="size-5 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-slate-600 dark:text-white/70 mt-3">
              O conteúdo gerado pela IA é fornecido como sugestão criativa. A revisão, adaptação e responsabilidade pelo uso final é inteiramente do usuário.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-black flex items-center justify-center shrink-0">3</span>
              Conta e Acesso
            </h2>
            <p className="text-slate-600 dark:text-white/70">Para usar a Plataforma, você deve:</p>
            <ul className="mt-3 space-y-2 text-slate-600 dark:text-white/70">
              <li>Fornecer informações de cadastro verídicas e mantê-las atualizadas</li>
              <li>Manter a confidencialidade de suas credenciais de acesso</li>
              <li>Ser o único responsável por todas as atividades realizadas em sua conta</li>
              <li>Notificar imediatamente qualquer uso não autorizado da sua conta</li>
            </ul>
            <p className="text-slate-600 dark:text-white/70 mt-3">
              Reservamos o direito de encerrar contas que violem estes Termos, a nosso exclusivo critério e sem aviso prévio.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-black flex items-center justify-center shrink-0">4</span>
              Planos e Pagamentos
            </h2>
            <p className="text-slate-600 dark:text-white/70">
              A Plataforma oferece um plano gratuito com limitações de uso e planos pagos (Premium). Ao assinar um plano pago:
            </p>
            <ul className="mt-3 space-y-2 text-slate-600 dark:text-white/70">
              <li>As cobranças são realizadas na periodicidade contratada (mensal ou anual)</li>
              <li>O pagamento é processado via Mercado Pago, sujeito aos termos daquele provedor</li>
              <li>O cancelamento pode ser feito a qualquer momento, sem multa</li>
              <li>Não há reembolso por períodos parciais já pagos, salvo obrigação legal contrária</li>
              <li>Reservamos o direito de alterar preços com aviso prévio de 30 dias</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-black flex items-center justify-center shrink-0">5</span>
              Uso Permitido e Proibições
            </h2>
            <p className="text-slate-600 dark:text-white/70">Você concorda em <strong>NÃO</strong>:</p>
            <ul className="mt-3 space-y-2 text-slate-600 dark:text-white/70">
              <li>Usar a Plataforma para criar conteúdo difamatório, fraudulento, ilegal ou que viole direitos de terceiros</li>
              <li>Compartilhar, revender ou distribuir acesso à sua conta</li>
              <li>Realizar engenharia reversa, descompilar ou tentar extrair o código-fonte da Plataforma</li>
              <li>Usar robôs, scrapers ou meios automatizados para acessar ou coletar dados da Plataforma</li>
              <li>Publicar conteúdo que viole direitos autorais, marcas registradas ou outros direitos de propriedade intelectual</li>
              <li>Usar a Plataforma para gerar spam, desinformação ou conteúdo enganoso</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-black flex items-center justify-center shrink-0">6</span>
              Propriedade Intelectual
            </h2>
            <p className="text-slate-600 dark:text-white/70">
              O conteúdo, design, código, banco de formatos, prompts e demais elementos da Plataforma são de propriedade exclusiva do Mapa do Engajamento e protegidos por leis de direitos autorais e propriedade intelectual.
            </p>
            <p className="text-slate-600 dark:text-white/70 mt-3">
              O conteúdo <strong>gerado por você</strong> com uso das ferramentas da Plataforma (seus roteiros, adaptações e produções) é de sua propriedade. Concedemos a você uma licença não exclusiva e intransferível para usar os recursos da Plataforma dentro dos limites do seu plano.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-black flex items-center justify-center shrink-0">7</span>
              Limitação de Responsabilidade
            </h2>
            <p className="text-slate-600 dark:text-white/70">
              A Plataforma é fornecida "no estado em que se encontra" ("as is"). Não garantimos que o serviço será ininterrupto, livre de erros ou que os resultados gerados pela IA serão precisos, adequados ou adequados para qualquer finalidade específica.
            </p>
            <p className="text-slate-600 dark:text-white/70 mt-3">
              Em nenhuma hipótese seremos responsáveis por danos indiretos, incidentais, especiais ou consequentes resultantes do uso ou da impossibilidade de uso da Plataforma, mesmo que tenhamos sido informados da possibilidade de tais danos.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-black flex items-center justify-center shrink-0">8</span>
              Modificações nos Termos
            </h2>
            <p className="text-slate-600 dark:text-white/70">
              Podemos atualizar estes Termos a qualquer momento. Alterações significativas serão comunicadas por e-mail ou por aviso na Plataforma com pelo menos 15 dias de antecedência. O uso continuado da Plataforma após esse prazo constitui aceitação dos novos Termos.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-black flex items-center justify-center shrink-0">9</span>
              Lei Aplicável e Foro
            </h2>
            <p className="text-slate-600 dark:text-white/70">
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer disputas decorrentes destes Termos, com exclusão de qualquer outro, por mais privilegiado que seja.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-black flex items-center justify-center shrink-0">10</span>
              Contato
            </h2>
            <p className="text-slate-600 dark:text-white/70">
              Para dúvidas sobre estes Termos, entre em contato pelo e-mail:{' '}
              <a href="mailto:suporte@mapadoengajamento.com.br" className="text-[#0ea5e9] font-semibold hover:underline">
                suporte@mapadoengajamento.com.br
              </a>
            </p>
          </section>

        </div>

        {/* Bottom nav */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400 dark:text-white/30">
            © {new Date().getFullYear()} Mapa do Engajamento. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/termos" className="font-bold text-[#0ea5e9]">Termos de Uso</Link>
            <span className="text-slate-300 dark:text-white/20">·</span>
            <Link href="/privacidade" className="text-slate-500 dark:text-white/40 hover:text-[#0ea5e9] transition-colors">Política de Privacidade</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
