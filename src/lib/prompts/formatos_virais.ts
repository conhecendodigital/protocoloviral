// 8 Formatos Virais Consolidados e Validados (Ref: skillmac/guia-formatos-virais.md)
// Estes prompts ditam a arquitetura dos blocos bloqueando alucinação na Roteirista Pro.

export const FORMATOS_VIRAIS_PROMPTS: Record<string, string> = {
  "ancoragem": `[📍 FORMATO DEFINIDO: ANCORAGEM]
OBJETIVO: Usar uma narrativa envolvente e extrema como âncora para reter a atenção e vender uma solução ou método no final.
ESTRUTURA OBRIGATÓRIA (4 BLOCOS):
1. [GANCHO DE VIDA OU MORTE]: Chame a emoção instantaneamente relatando uma situação extrema ou resultado absurdo (Ex: "Como fulano sobreviveu à X" ou "A grata surpresa de faturar X"). Contexto forte.
2. [TENSÃO/PROBLEMA]: Construa o cenário mostrando a ineficácia dos caminhos óbvios e convencionais que falharam miseravelmente.
3. [INTERVENÇÃO BRILHANTE]: Apresente a sua solução (método, IA, consultoria) como a virada de chave completamente fora da caixa que mudou tudo.
4. [CTA MAGNÉTICO]: Chamada para ação visceral para que o espectador digite uma palavra nos comentários para receber a solução no Direct.`,

  "perguntas-e-respostas": `[📍 FORMATO DEFINIDO: PERGUNTAS E RESPOSTAS / DUAL-PERSONA]
OBJETIVO: Dinâmica rápida entre duas personas (alguém perguntando a dor top 1 do nicho e o especialista respondendo com autoridade).
ESTRUTURA OBRIGATÓRIA (4 BLOCOS):
1. [PERGUNTA/GANCHO]: A audiência ou outra pessoa lança a "dúvida de 1 milhão de dólares" diretamente na tela. Tem que ser a maior objeção do nicho.
2. [A RESPOSTA SECA]: O criador responde de forma direta, quebrando o mito ou senso comum instantaneamente. "Não, isso não funciona."
3. [O BASTIDOR (PROVA)]: Explicação relacional revelando *por que* aquilo é verdade, usando um exemplo prático do dia a dia do criador ou cliente.
4. [CTA RELACIONAL]: Peça para a audiência comentar o que acham ou enviar uma palavra específica para aprofundar o assunto na DM.`,

  "preguicoso": `[📍 FORMATO DEFINIDO: PREGUIÇOSO]
OBJETIVO: Roteiro super veloz e visual que requer o mínimo de esforço da fala. O foco é visual apontando erros comuns com texto grande na tela.
ESTRUTURA OBRIGATÓRIA (3 BLOCOS):
1. [O ERRO GROTESCO (TEXTO NA TELA)]: Gancho visual instantâneo alertando sobre o maior erro que o público está cometendo. Sem falar muito.
2. [X vs CHECK VERDE]: Demonstração acelerada, tipo "Não faça isso (Amador ❌), Faça isso (Estrategista ✅)". Textos descritivos super enxutos.
3. [CTA CURTÍSSIMO]: Apenas "Gostou da dica ouro? Me segue pra mais." Fim. A ideia é fazer a pessoa reassistir lendo.`,

  "tela-dividida": `[📍 FORMATO DEFINIDO: TELA DIVIDIDA / LADO A LADO]
OBJETIVO: Formato 100% visual comparativo. Mostra a maneira amadora falhando de um lado vs o seu método funcionando no outro.
ESTRUTURA OBRIGATÓRIA (3 BLOCOS):
1. [GANCHO DE CONTRASTE]: "Maneira Amadora VS Maneira Pro de fazer X". Apresente o embate em dois segundos.
2. [PROVA VISUAL A ACELERADA]: Enumere as diferenças cruciais em itens curtos: "Eles fazem X (ruim). Você faz Y (excelente com sua solução)." Sem texto longo, palavras afiadas de impacto.
3. [CTA DE RECOMPENSA]: "De qual lado você está? Comenta X que eu libero meu material completo no seu direct."`,

  "varias-cenas": `[📍 FORMATO DEFINIDO: MÚLTIPLAS CENAS / VLOG LISTA]
OBJETIVO: Mudança constante de cenário ou enquadramento a cada nova frase/item para manter dopamina no talo. Ideal para Listas ("Isso ou Aquilo").
ESTRUTURA OBRIGATÓRIA (4 BLOCOS):
1. [GANCHO AGRUPADOR]: "5 coisas que te fazem perder X". Impacto logo de cara em movimento. Mantenha a coerência com a quantidade prometida.
2. [DESENVOLVIMENTO DOS ITENS]: Detalhe CADA item profundo da lista prometida (Se o gancho promete 5, entregue os 5). Troque o cenário ou angulo metaforicamente e desenvolva amplamente.
3. [ITEM MATADOR (Final)]: O último item da lista deve ser o mais longo, o plot twist ou revelação mais chocante, mudando totalmente a perspectiva de quem assiste.
4. [CTA FOCADO]: Encaminhe o usuário direto para agir. "Se você fez o erro 3, me chama no link da bio urgente."`,

  "reacao": `[📍 FORMATO DEFINIDO: REAÇÃO (REACT)]
OBJETIVO: Surfar num conceito externo (um vídeo viral bizarro do nicho, uma notícia, um post polêmico) agregando autoridade técnica.
ESTRUTURA OBRIGATÓRIA (4 BLOCOS):
1. [GANCHO SOBREPOSTO]: "Olha o absurdo que aconteceu aqui..." ou "Foi assim que ele destruiu a empresa em 1 dia." Reação forte a algo externo.
2. [DECODIFICAÇÃO TÉCNICA]: Pare o elemento "react" e explique sob a ótica de um especialista o motivo profundo por trás do que deu errado/certo.
3. [TRANSPOSIÇÃO PARA O ESPECTADOR]: Alerte o espectador que ele está cometendo exatamente o mesmo erro sutilmente. Traga a lição para a realidade dele.
4. [CTA MANTENHA A AUTORIDADE]: "Para não cair nesse truque, continua me seguindo aqui e comenta X para blindar sua estratégia."`,

  "caixinha-perguntas": `[📍 FORMATO DEFINIDO: CAIXINHA DE PERGUNTAS INVERTIDA]
OBJETIVO: Usar o formato visual do box de stories do Instagram simulando uma conversa franca e "sem papas na língua" com a audiência. Falar a verdade nua e crua.
ESTRUTURA OBRIGATÓRIA (3 BLOCOS):
1. [A PERGUNTA POLÊMICA]: Inicie lendo a caixinha de perguntas fictícia contendo uma desculpa do público (ex: "Não tenho dinheiro" ou "Meu engajamento morreu").
2. [O TAPA NA CARA (BEM-INTENCIONADO)]: Desmonte a objeção sem dó, mostrando o erro de mentalidade. Argumentação irrefutável focada em ação, não em pena. Traga uma verdade indigesta.
3. [CHAMADA DE DESPERTAR ]: "Se você cansou de dar essa desculpa, comenta [PALAVRA] que eu te mando a solução real na sua DM".`,

  "tutorial": `[📍 FORMATO DEFINIDO: TUTORIAL (PASSO A PASSO)]
OBJETIVO: Roteiro focado em utilidade ("Salve esse vídeo"). Apontando para a tela e ensinando "Como X" num ritmo muito dinâmico e detalhado.
ESTRUTURA OBRIGATÓRIA (4 BLOCOS):
1. [GANCHO DE UTILIDADE EXTREMA]: "Como eu automatizo todo meu negócio fazendo apenas 3 passos simples."
2. [O GRANDE POR QUÊ]: "Enquanto todo mundo gasta 10 horas nisso, eu gasto 10 minutos." Razão óbvia do vídeo explicada.
3. [PASSO A PASSO PROFUNDO]: Entregue TODOS os passos prometidos. Vá a fundo e seja detalhista. Mastigado.
4. [BÔNUS & CTA]: Ofereça o material mastigado: "Não anotou? Comenta 'GUIA' aqui que a minha IA te manda o PDF na DM agora mesmo."`
};
