// Mapeamento dos Prompts Matadores Por Nicho/Filtro
// Estes prompts serão injetados no contexto para obrigar a IA a agir exatamente como o formato.

export const PROMPTS_MATADORES: Record<string, string> = {
  "bastidores": `[📍 PROMPT MATADOR: BASTIDORES]
OBJETIVO: Quebrar a expectativa instantaneamente mostrando um contraste brutal (Ex: "Esse é o tijolo do concorrente X. Esse é o meu.").
ESTRUTURA DE EXECUÇÃO:
1. Gancho de Contraste (0-3s): Mostre o processo tradicional VS o seu método (A x B). Afirmação direta sem rodeios.
2. Identificação da Dor (3-15s): Pontue rapidamente por que o método tradicional (A) frustra o cliente ou perde dinheiro.
3. Demonstração Rápida (15-35s): Faça uma chuva de diferenciais (chuva de valor) em cortes rápidos mostrando o seu produto (B) resolvendo o que A falhou.
4. Social Proof & CTA (35-60s): Mostre um número ou prova indiscutível. Chame para o Direct ou Mensagem.`,

  "problema / solução": `[📍 PROMPT MATADOR: PROBLEMA / SOLUÇÃO]
OBJETIVO: Tocar diretamente na ferida do usuário e oferecer uma pílula mágica visual.
ESTRUTURA DE EXECUÇÃO:
1. Gancho de Dissonância (0-3s): Fale com o espectador enquanto faz uma ação contraintuitiva ou mostre uma consequência visual ruim de algo cotidiano (Ex: "Se você faz X, pare agora!").
2. Explicação Descomplicada (3-20s): Revele o erro pontuando as perdas de tempo/dinheiro da audência. Crie ansiedade.
3. A Solução Ouro (20-45s): Mostre a solução de maneira ridiculamente simples ("Tudo que você precisa é..."). Use 3 pilares rápidos de benefício.
4. CTA Salvamento (45-60s): Peça apenas para SALVAR o vídeo, gerando engajamento de alta retenção.`,

  "tutorial": `[📍 PROMPT MATADOR: TUTORIAL]
OBJETIVO: Roteiro rápido e de corte acelerado ensinando "Como X" apontando para a tela/solução.
ESTRUTURA DE EXECUÇÃO:
1. Gancho de Curiosidade Imediata (0-3s): "Como consegui X fazendo apenas Y."
2. Prova Contextual (3-10s): Dê a razão incontestável de porquê isso é importante agora ("Você sabia que a função X lançou ontem?").
3. Passo a Passo Rápido (10-45s): Fale no imperativo ("Aperte aqui", "Vá até ali", "Substitua X por Y"). Tudo mastigado sem pausas dramáticas.
4. Bônus & CTA (45-60s): Ofereça um prompt ou PDF de presente, "Comente X para eu te mandar no direct".`,

  "react": `[📍 PROMPT MATADOR: REACT / ANÁLISE]
OBJETIVO: Surfar num vídeo viral de terceiros agregando muito valor com uma lição de autoridade.
ESTRUTURA DE EXECUÇÃO:
1. Gancho Sobreposto (0-5s): Apresente ou reproduza um evento chocante/viral e chame a atenção de corte: "Olha o que aconteceu aqui..." ou "Com quantos anos você descobriu que..."
2. Decodificação Técnica (5-25s): Pare a cena ou narre o que *realmente* está acontecendo sob a ótica de um especialista. Revele a "verdade oculta".
3. Transposição para o Espectador (25-45s): Indique como o espectador está cometendo o mesmo erro que a pessoa do vídeo na própria vida/negócio.
4. CTA Autoritário (45-60s): "Para não ser a pessoa errando na tela, me segue para entender os fundamentos reais."`,

  "curiosidade": `[📍 PROMPT MATADOR: CURIOSIDADE]
OBJETIVO: Reter a atenção até o absoluto último segundo revelando um mistério insano do nicho.
ESTRUTURA DE EXECUÇÃO:
1. Gancho Hipnótico e Oculto (0-4s): Fale uma afirmação contrária ao senso comum ("Vou te provar que você não é burro, você é desinformado").
2. Contar a História Intrigante (4-30s): Detalhe o 'como' algo ocorreu. Mantenha as cartas fechadas até o limite da história ("Todo mundo achou que foi a falha no motor, mas não foi...").
3. O Grande Plot (30-45s): Revele a verdade que resolve todo o mistério. Mostre que é aplicável na vida ou no negócio de quem assiste.
4. CTA Viral (45-60s): "Conhece alguém que faz assim achando que tá certo? Manda isso pra ele agora."`,

  "nutrição": `[📍 PROMPT MATADOR: DESMISTIFICAÇÃO DE PRODUTO (NUTRIÇÃO/CONSUMO)]
OBJETIVO: Pegar mitos de consumo ou alimentos do dia a dia e provar o erro usando rótulos ou fatos inquestionáveis.
ESTRUTURA DE EXECUÇÃO:
1. Gancho Físico (0-3s): Segure um produto conhecido e bata o martelo: "Tire isso daqui agora." (ex: Banana fora da geladeira, suco no lixo).
2. Ciência Fácil (3-25s): Leia um trecho, mostre o rótulo ou traga o dado invisível ("As pessoas compram pelo nome C, mas a composição revela o veneno D").
3. Solução Barata (25-45s): Mostre qual é a troca saudável, de rápido acesso e econômica.
4. CTA Desafio (45-60s): Desafia o espectador a olhar a própria geladeira/armário e deixar o feedback.`,

  "lista": `[📍 PROMPT MATADOR: LISTA CHOCANTE]
OBJETIVO: Enumerar de forma acelerada "X coisas que...", focando em itens que as pessoas têm muita confiança mas estão erradas.
ESTRUTURA DE EXECUÇÃO:
1. Gancho Agrupador (0-5s): "5 coisas que você gasta dinheiro à toa achando que está arrasando..."
2. Itens Progressivos (5-45s): O item 1 deve ser brando. O item 3 deve ser uma meia polêmica. O último deve ser a revelação explosiva do vídeo. Use transições hiper velozes e cortes secos para manter dopamina. Sem respiros.
3. CTA Focado (45-60s): Foque no erro listado que mais causa dor e encaminhe o lead para um curso gratuito, PDF ou feed.`,

  "ancoragem": `[📍 PROMPT MATADOR: ANCORAGEM/STORYTELLING ENGAJADOR]
OBJETIVO: Usar uma narrativa envolvente e extrema como âncora para vender uma solução ou método no final.
ESTRUTURA DE EXECUÇÃO:
1. Gancho de Vida ou Morte (0-5s): Exemplo "Como fulano sobreviveu à X" ou "A grávida que foi salva pelo ChatGPT". Chame a emoção.
2. Narrativa Clímax/Tensão (5-30s): Construa o problema mostrando a ineficácia dos caminhos óbvios e convencionais que falharam miseravelmente.
3. Intervenção Brilhante (Metodologia) (30-50s): Apresente como algo completamente fora da caixa (sua solução, inteligência artificial, sua consultoria) mudou o rumo. Ancore essa qualidade suprema na mente do lead.
4. CTA Magnético (50-60s): "Se você quiser ter uma arma dessas a seu favor, digite APRENDER nos comentários."`,

  "preguiçoso": `[📍 PROMPT MATADOR: ESTILO PREGUIÇOSO/SEM ESFORÇO]
OBJETIVO: Roteiro rápido e visual que requer pouca explicação vocal, focando em dor super específica (como Erros Comuns apontados, ou texto sobreposto sem o criador falar muito).
ESTRUTURA DE EXECUÇÃO:
1. Gancho Visual: Título gigante em cena com um erro grotesco sendo circulado (Ex: "SEMPRE COM VÍRGULA!").
2. Dinamismo Focado (0-20s): Demonstre as 3 opções e mostre o [X] vermelho gigante e as correções com "VERDADEIRO". O áudio é só uma música em alta ou voz serena.
3. Valor Gratuito: O usuário se sente obrigado a repetir / rebobinar para captar a resposta. 
4. CTA Curtíssimo: "Gostou da dica de ouro? Segue."`,

  "pergunta/resposta": `[📍 PROMPT MATADOR: PERGUNTA E RESPOSTA (FAQ VIRAL)]
OBJETIVO: Responder à dor número 1 do nicho com autoridade de forma direta, sem a introdução clichê.
ESTRUTURA DE EXECUÇÃO:
1. Gancho Invertido (0-3s): Comece com a Pergunta na tela e alguém (ou você mesmo) a reproduzindo ("Quantos Reels postar por dia?").
2. Autoridade Seca (3-15s): Entregue a resposta óbvia, mas quebre a regra! "Postar todo dia não adianta nada se..."
3. Profundidade Relacional (15-45s): Mostre o SEU processo interno ou o bastidor de como resolveu isso na sua empresa / na sua própria vida. Traga proximidade. A prova real de que a regra deve ser essa.
4. CTA Relacional (45-60s): Fomente a discussão nos comentários ("O que você tem feito? Funciona? Comenta ai embaixo.").`,

  "ensino oculto": `[📍 PROMPT MATADOR: ENSINO OCULTO]
OBJETIVO: Mostrar que existe uma técnica/habilidade desconhecida pelo grande público que pode resolver tudo (Ex: pisar na cadeira 100x por dia).
ESTRUTURA DE EXECUÇÃO:
1. Revelação Secreta (0-4s): "Você ainda não conta com esse detalhe, mas..." aponte para um objeto ou técnica boba, que pareceria óbvia.
2. Demonstração Prática Silenciosa e Ativa (4-30s): Mostre você fisicamente exercutando a ação oculta e pontuando os benefícios enormes de realizá-la (Ex: "Abaixa o nível glicêmico, reduz fadiga mental...").
3. Questionamento + Validação (30-45s): Antecipe a desculpa do seguidor ("Mas eu não tenho tempo pra isso?") e responda com uma solução definitiva e ultra enxuta.
4. CTA Matador de Desculpas (45-60s): Faça o espectador se comprometer: "Coloca um 🔥 se você topa testar por 21 dias".`,

  "dica útil": `[📍 PROMPT MATADOR: DICA ÚTIL DO DIA A DIA]
OBJETIVO: Uma pílula de dopamina de alto alcance (Low Hanging Fruit) para o iniciante da ferramenta / nicho sentir-se inteligente.
ESTRUTURA DE EXECUÇÃO:
1. Promessa Surpresa (0-5s): "Ele não sabe ainda, mas esse truque com [ferramenta] me rende 2 horas de folga por dia." 
2. Tutoria Express (5-25s): Enfoque em mostrar na tela ou no físico. Ferramenta ou técnica simples e funcional. Fale devagar.
3. Enfoque e Empatia (25-45s): Diga que errava como espectador, mas tudo mudou quando ativou esse novo caminho simples.
4. CTA Gratidão (45-60s): "Manda isso para o seu amigo que sempre reclama que não tem tempo, para ele parar de reclamar."`
}
