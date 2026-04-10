function parse(text) {
  let titulo = 'Roteiro';
  
  const regexGancho = /(?:\*\*)?\[GANCHO\](?:\*\*)?[\s\S]*?(?=(?:\*\*)?\[DESENVOLVIMENTO\](?:\*\*)?)/i;
  const regexDev = /(?:\*\*)?\[DESENVOLVIMENTO\](?:\*\*)?[\s\S]*?(?=(?:\*\*)?\[CTA E FINAL\](?:\*\*)?|$)/i;
  const regexCta = /(?:\*\*)?\[CTA E FINAL\](?:\*\*)?[\s\S]*/i;

  const mGancho = text.match(regexGancho);
  const mDev = text.match(regexDev);
  const mCta = text.match(regexCta);

  const pureText = (blockMatch, tagName) => 
    blockMatch ? blockMatch[0].replace(tagName, '').replace(/\*\*/g, '').trim() : '';

  return {
    titulo,
    gancho: pureText(mGancho, /(?:\*\*)?\[GANCHO\](?:\*\*)?/i),
    desenvolvimento: pureText(mDev, /(?:\*\*)?\[DESENVOLVIMENTO\](?:\*\*)?/i),
    cta: pureText(mCta, /(?:\*\*)?\[CTA E FINAL\](?:\*\*)?/i),
  };
}

let generatedReel = `**Título**

[SALA_DE_ROTEIRISTAS]
blah

[GANCHO]
Você viu o chatGPT?

[DESENVOLVIMENTO]
A OpenAI nadou..

[CTA E FINAL]
Quer usar o Claude?

EXEMPLO DE FORMATO CORRETO:
[SALA_DE_ROTEIRISTAS]
(analysis)
[GANCHO]
gancho exemplo
[DESENVOLVIMENTO]
(dev)
[CTA E FINAL]
(cta)
`

let parsed = parse(generatedReel);
console.log("PARSE 1 CTA:");
console.log(parsed.cta);

function updateReel(p, newBlocks) {
    const merged = { ...p, ...newBlocks }
    return \`**\${merged.titulo}**\n\n[GANCHO]\n\${merged.gancho}\n\n[DESENVOLVIMENTO]\n\${merged.desenvolvimento}\n\n[CTA E FINAL]\n\${merged.cta}\`
}

generatedReel = updateReel(parsed, { gancho: 'a' });
console.log("UPDATE 1 REEL:");
console.log(generatedReel);

parsed = parse(generatedReel);
console.log("PARSE 2 CTA:");
console.log(parsed.cta);
