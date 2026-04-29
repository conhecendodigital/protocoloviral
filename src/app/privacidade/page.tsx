import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Privacidade — Mapa do Engajamento',
  description: 'Saiba como o Mapa do Engajamento coleta, usa e protege seus dados pessoais conforme a LGPD.',
}

export default function PrivacidadePage() {
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
            <div className="size-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck size={14} className="text-emerald-500" />
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-white/80">Mapa do Engajamento</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Title block */}
        <div className="mb-12">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-3">Documento Legal</p>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Política de Privacidade
          </h1>
          <p className="text-slate-500 dark:text-white/50 text-sm">
            Última atualização: <strong>29 de abril de 2025</strong>
          </p>
          <div className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
            <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 dark:text-white/70 leading-relaxed">
              O Mapa do Engajamento está em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>. Suas informações são tratadas com responsabilidade e transparência.
            </p>
          </div>
        </div>

        <div className="space-y-10 text-[15px] leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-black flex items-center justify-center shrink-0">1</span>
              Controlador dos Dados
            </h2>
            <p className="text-slate-600 dark:text-white/70">
              O controlador dos seus dados pessoais é o <strong>Mapa do Engajamento</strong>, operado por Matheus Daia. Para exercer seus direitos ou tirar dúvidas, entre em contato pelo e-mail:{' '}
              <a href="mailto:suporte@mapadoengajamento.com.br" className="text-emerald-500 font-semibold hover:underline">
                suporte@mapadoengajamento.com.br
              </a>
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-black flex items-center justify-center shrink-0">2</span>
              Dados que Coletamos
            </h2>
            <p className="text-slate-600 dark:text-white/70 mb-4">Coletamos as seguintes categorias de dados:</p>

            <div className="space-y-4">
              {[
                {
                  titulo: 'Dados de Cadastro',
                  itens: ['Nome e endereço de e-mail', 'Foto de perfil (se fornecida via Google OAuth)', 'Senha (armazenada de forma criptografada via Supabase Auth)'],
                },
                {
                  titulo: 'Dados de Perfil Criativo',
                  itens: ['Nicho de atuação e público-alvo', 'Produto/serviço que você vende', 'Tom de voz e estilo de comunicação', 'Informações preenchidas voluntariamente no onboarding'],
                },
                {
                  titulo: 'Dados de Uso',
                  itens: ['Roteiros gerados na plataforma', 'Formatos e ganchos utilizados', 'Histórico de interações com a IA', 'Dados de acesso (IP, browser, horário — apenas para fins de segurança)'],
                },
                {
                  titulo: 'Dados Financeiros',
                  itens: ['Dados de pagamento são processados pelo Mercado Pago — NÃO armazenamos dados de cartão', 'Histórico de plano e assinaturas'],
                },
              ].map((grupo, i) => (
                <div key={i} className="p-4 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                  <p className="font-bold text-slate-800 dark:text-white text-sm mb-2">{grupo.titulo}</p>
                  <ul className="space-y-1">
                    {grupo.itens.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-600 dark:text-white/60">
                        <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-black flex items-center justify-center shrink-0">3</span>
              Como Usamos seus Dados
            </h2>
            <p className="text-slate-600 dark:text-white/70 mb-3">Utilizamos seus dados para:</p>
            <ul className="space-y-2 text-slate-600 dark:text-white/70">
              {[
                'Fornecer e personalizar os serviços da Plataforma',
                'Gerar roteiros e conteúdo pela IA com base no seu perfil',
                'Processar pagamentos e gerenciar sua assinatura',
                'Enviar comunicações transacionais (confirmações, alertas de conta)',
                'Melhorar os algoritmos e a qualidade das respostas da IA (dados anonimizados)',
                'Cumprir obrigações legais e regulatórias',
                'Prevenir fraudes e garantir a segurança da Plataforma',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="size-5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-slate-600 dark:text-white/70 mt-4">
              <strong>Não vendemos seus dados a terceiros.</strong> Nunca.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-black flex items-center justify-center shrink-0">4</span>
              Base Legal para o Tratamento
            </h2>
            <p className="text-slate-600 dark:text-white/70">Tratamos seus dados com base nas seguintes hipóteses legais previstas na LGPD:</p>
            <ul className="mt-3 space-y-2 text-slate-600 dark:text-white/70">
              <li><strong>Execução de contrato</strong> — para fornecer os serviços contratados</li>
              <li><strong>Consentimento</strong> — para funcionalidades opcionais de personalização</li>
              <li><strong>Legítimo interesse</strong> — para segurança, prevenção de fraudes e melhoria do serviço</li>
              <li><strong>Cumprimento de obrigação legal</strong> — quando exigido por lei</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-black flex items-center justify-center shrink-0">5</span>
              Compartilhamento de Dados
            </h2>
            <p className="text-slate-600 dark:text-white/70 mb-3">Seus dados podem ser compartilhados com:</p>
            <div className="space-y-3">
              {[
                { nome: 'Supabase', desc: 'Banco de dados e autenticação (servidores na AWS, região us-east-1)' },
                { nome: 'Anthropic / OpenAI / Google', desc: 'Processamento das mensagens pela IA — apenas o conteúdo necessário para gerar o roteiro é enviado, sem dados identificadores pessoais' },
                { nome: 'Mercado Pago', desc: 'Processamento de pagamentos — sujeito à política de privacidade própria do Mercado Pago' },
                { nome: 'Vercel', desc: 'Hospedagem da aplicação (servidores nos EUA)' },
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                  <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0 mt-0.5">{p.nome}</span>
                  <p className="text-sm text-slate-600 dark:text-white/60">{p.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-black flex items-center justify-center shrink-0">6</span>
              Segurança dos Dados
            </h2>
            <p className="text-slate-600 dark:text-white/70">
              Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados, incluindo:
            </p>
            <ul className="mt-3 space-y-2 text-slate-600 dark:text-white/70">
              <li>Criptografia de senhas (bcrypt via Supabase Auth)</li>
              <li>Comunicação HTTPS em todas as conexões</li>
              <li>Controle de acesso por Row Level Security (RLS) no banco de dados</li>
              <li>Tokens JWT de curta duração para sessões de usuário</li>
              <li>Headers de segurança HTTP (CSP, HSTS, X-Frame-Options)</li>
            </ul>
            <p className="text-slate-600 dark:text-white/70 mt-3">
              Em caso de incidente de segurança que possa afetar seus dados, você será notificado dentro do prazo legal estabelecido pela LGPD.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-black flex items-center justify-center shrink-0">7</span>
              Retenção de Dados
            </h2>
            <p className="text-slate-600 dark:text-white/70">
              Mantemos seus dados pelo período necessário para a prestação dos serviços e cumprimento de obrigações legais:
            </p>
            <ul className="mt-3 space-y-2 text-slate-600 dark:text-white/70">
              <li>Dados de conta: enquanto a conta estiver ativa</li>
              <li>Roteiros gerados: armazenados indefinidamente até solicitação de exclusão</li>
              <li>Dados de pagamento (registros): 5 anos (obrigação fiscal)</li>
              <li>Logs de segurança: 90 dias</li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-black flex items-center justify-center shrink-0">8</span>
              Seus Direitos (LGPD)
            </h2>
            <p className="text-slate-600 dark:text-white/70 mb-3">Como titular de dados, você tem direito a:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { titulo: 'Acesso', desc: 'Solicitar cópia de todos os seus dados' },
                { titulo: 'Correção', desc: 'Corrigir dados incompletos ou incorretos' },
                { titulo: 'Anonimização / Bloqueio', desc: 'Dados desnecessários ao tratamento' },
                { titulo: 'Portabilidade', desc: 'Receber seus dados em formato estruturado' },
                { titulo: 'Eliminação', desc: 'Solicitar exclusão dos seus dados pessoais' },
                { titulo: 'Revogação do consentimento', desc: 'A qualquer tempo, para tratamentos baseados em consentimento' },
              ].map((d, i) => (
                <div key={i} className="p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                  <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mb-1">{d.titulo}</p>
                  <p className="text-sm text-slate-600 dark:text-white/60">{d.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-slate-600 dark:text-white/70 mt-4">
              Para exercer qualquer desses direitos, envie um e-mail para{' '}
              <a href="mailto:suporte@mapadoengajamento.com.br" className="text-emerald-500 font-semibold hover:underline">
                suporte@mapadoengajamento.com.br
              </a>{' '}
              com o assunto "LGPD — [Seu Direito]". Responderemos em até 15 dias úteis.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-black flex items-center justify-center shrink-0">9</span>
              Cookies e Rastreamento
            </h2>
            <p className="text-slate-600 dark:text-white/70">
              Utilizamos cookies estritamente necessários para o funcionamento da autenticação e sessão. Não utilizamos cookies de rastreamento de terceiros ou publicidade comportamental.
            </p>
            <p className="text-slate-600 dark:text-white/70 mt-3">
              A Vercel Speed Insights coleta métricas de performance anônimas (Core Web Vitals) sem identificar usuários individualmente.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="size-7 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-black flex items-center justify-center shrink-0">10</span>
              Alterações nesta Política
            </h2>
            <p className="text-slate-600 dark:text-white/70">
              Podemos atualizar esta Política periodicamente. Alterações relevantes serão comunicadas por e-mail com pelo menos 15 dias de antecedência. A versão vigente sempre estará disponível em{' '}
              <Link href="/privacidade" className="text-emerald-500 font-semibold hover:underline">
                mapadoengajamento.com.br/privacidade
              </Link>
              .
            </p>
          </section>

        </div>

        {/* Bottom nav */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400 dark:text-white/30">
            © {new Date().getFullYear()} Mapa do Engajamento. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/termos" className="text-slate-500 dark:text-white/40 hover:text-[#0ea5e9] transition-colors">Termos de Uso</Link>
            <span className="text-slate-300 dark:text-white/20">·</span>
            <Link href="/privacidade" className="font-bold text-emerald-500">Política de Privacidade</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
