---
name: formato-modelador
description: >
  Gera roteiros novos para Reels do Instagram modelados em formatos virais reais com métricas comprovadas.
  Use SEMPRE que o usuário pedir para criar um roteiro, script, vídeo, Reel, conteúdo para Instagram,
  ou quando mencionar palavras como "formato viral", "modelar conteúdo", "criar roteiro", "script de vídeo",
  "gancho", "estrutura de Reel" ou "adaptar formato". Também use quando o usuário descrever um tema
  e quiser saber como transformá-lo em conteúdo de vídeo curto.
---

# Skill: Modelador de Formatos Virais

Gera roteiros completos para Reels baseados em padrões extraídos de formatos virais reais.

## Fluxo de execução

### 1. Coletar inputs do usuário

Antes de gerar o roteiro, extraia (pode já estar na mensagem ou perguntar):

| Campo | Descrição | Obrigatório |
|-------|-----------|-------------|
| `tema` | Assunto do vídeo | ✅ |
| `nicho` | Área de atuação (ex: nutrição, vendas, IA) | ✅ |
| `produto_ou_oferta` | O que vende/promove ao final | ❌ |
| `emocao` | Curiosidade / Identificação / Inspiração / Confiança / Utilidade | ❌ |
| `formato_preferido` | Nome do arquétipo (lista abaixo) ou "sugerir melhor" | ❌ |
| `persona` | Quem fala no vídeo (especialista, criador, personagem) | ❌ |
| `duracao` | Curto (≤30s) / Médio (30-60s) / Longo (60-90s) | ❌ |

Se `emocao` ou `formato_preferido` não forem informados, **você escolhe o melhor** com base no tema.

---

### 2. Consultar a base de formatos virais

Leia `/references/base-viral.md` para selecionar o arquétipo mais adequado ao tema.

**Critério de escolha do formato:**

| Se o tema é sobre... | Use o arquétipo |
|----------------------|----------------|
| Erro comum do público | CERTO/ERRADO ou LISTA |
| Hábito cotidiano com risco | ANCORAGEM / PERGUNTA IMPACTANTE |
| Dúvida técnica/jurídica/médica | PERGUNTA E RESPOSTA |
| Ferramenta ou processo | TUTORIAL RÁPIDO |
| Diferencial de negócio/marca | BASTIDORES COM COMPARAÇÃO |
| Mentalidade ou comportamento | LIGAÇÃO OCULTA ou REACT |
| Comparação de abordagens | COMPARAÇÃO RICO/POBRE |
| Dicas práticas empilhadas | LISTA PROBLEMA/SOLUÇÃO |

---

### 3. Gerar o roteiro

Produza o roteiro completo neste formato:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 ROTEIRO — [TÍTULO DO VÍDEO]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 ARQUÉTIPO: [nome do formato usado]
🎯 EMOÇÃO: [emoção âncora]
⏱ DURAÇÃO ESTIMADA: [X segundos]
📊 ESTRUTURA: [estrutura macro]

━━━ GANCHO ━━━
[Gancho em 1-2 linhas — exatamente como aparece na tela/fala]

━━━ ROTEIRO COMPLETO ━━━
[Linha por linha do roteiro com instruções visuais entre parênteses]
(Texto na tela: "X") → para textos sobrepostos
(mostra X) → para indicações visuais
[PAUSA] → para respiros dramáticos

━━━ CTA ━━━
[Call to action integrado à última dica ou frase]

━━━ LEGENDA SUGERIDA ━━━
[Legenda para o post com 2-3 linhas + hashtags]

━━━ POR QUE ESSE FORMATO ━━━
[1 parágrafo explicando por que esse arquétipo funciona para esse tema]
```

---

### 4. Regras obrigatórias do roteiro

Estas regras são extraídas dos virais reais da base. **Nunca viole nenhuma delas:**

1. **Gancho ≤ 2 linhas** — deve funcionar lido em voz alta em 3 segundos
2. **Primeiro frame = conflito ou pergunta** — nunca comece com apresentação
3. **Nunca explique o tema antes de criar o gancho** — o gancho é a abertura
4. **Tira a culpa do público** — o problema é da falta de informação, não da pessoa
5. **Entrega valor antes do CTA** — mínimo 3 itens/pontos antes de pedir ação
6. **CTA embutido na última dica** — integrar o follow/salvar na conclusão natural
7. **Instruções visuais entre parênteses** — (mostra X), (texto na tela: "X"), (corte para Y)
8. **Lista: 3-7 itens** — nem raso, nem cansativo
9. **Uma emoção âncora** — construir todo o roteiro em torno de uma única emoção dominante
10. **Linguagem do público** — usar termos que o nicho usa, não linguagem acadêmica

---

### 5. Output adicional (opcional, oferecer ao usuário)

Após o roteiro, ofereça:
- **Variação de gancho** — 2 ganchos alternativos para teste A/B
- **Versão curta** — roteiro condensado para ≤30s
- **Adaptação para carrossel** — transformar o mesmo tema em slides

---

## Arquétipos disponíveis

Para detalhes completos de cada arquétipo (receita, exemplos reais, métricas), leia `/references/base-viral.md`.

| Arquétipo | Emoção | Melhor para |
|-----------|--------|-------------|
| LIGAÇÃO OCULTA | Identificação | Comportamento, marketing, autoconhecimento |
| BASTIDORES COM COMPARAÇÃO | Confiança | Negócios locais, varejo, serviços |
| REACT / EXPERIMENTO MENTAL | Inspiração | Coaching, comunicação, vendas |
| LISTA PROBLEMA/SOLUÇÃO | Curiosidade | Casa, nutrição, finanças, produtividade |
| CERTO/ERRADO | Empoderamento | Saúde, direito, consumo, gramática |
| ANCORAGEM / PERGUNTA IMPACTANTE | Urgência | Saúde, segurança, direito do consumidor |
| PERGUNTA E RESPOSTA | Confiança | Direito, medicina, finanças, nutrição |
| COMPARAÇÃO RICO/POBRE | Aspiração | Negócios, vendas, gestão |
| TUTORIAL RÁPIDO | Utilidade | Tecnologia, processos, ferramentas |

---

## Notas de qualidade

- Se o tema for muito genérico, peça ao usuário um exemplo concreto ou situação específica
- Se a emoção pedida conflitar com o formato sugerido, mencione o conflito e proponha alternativas
- Evite ganchos com palavras como "hoje vou te ensinar" — começos diretos performam melhor
- O CTA nunca deve ser "me segue" solto — sempre integrá-lo à última entrega de valor
