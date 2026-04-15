function parse(text) {
  let titulo = 'Roteiro';
  
  const regexGancho = /(?:\*\*)?\[GANCHO\](?:\*\*)?[\s\S]*?(?=(?:\*\*)?\[DESENVOLVIMENTO\](?:\*\*)?)/i;
  const regexDev = /(?:\*\*)?\[DESENVOLVIMENTO\](?:\*\*)?[\s\S]*?(?=(?:\*\*)?\[CTA E FINAL\](?:\*\*)?|$)/i;
  const regexCta = /(?:\*\*)?\[CTA E FINAL\](?:\*\*)?[\s\S]*/i;

  const mGancho = text.match(regexGancho);
  const mDev = text.match(regexDev);
  const mCta = text.match(regexCta);

  if (!mGancho && !mDev) {
    let cleanText = text.replace(titulo, '').trim();
    if (!cleanText) cleanText = text.trim();

    const firstPuncResult = cleanText.match(/[.?!]+[\s\n]+/);
    if (!firstPuncResult) return null;

    let ganchoEndIndex = firstPuncResult.index + firstPuncResult[0].length;
    const gancho = cleanText.substring(0, ganchoEndIndex).trim();

    const reversedTokens = cleanText.match(/[^.?!]+[.?!]+(?:[\s\n]|$)/g);
    let cta = '';
    let ctaLength = 0;
    if (reversedTokens && reversedTokens.length >= 6) {
       cta = reversedTokens[reversedTokens.length - 2].trim() + ' ' + reversedTokens[reversedTokens.length - 1].trim();
       ctaLength = reversedTokens[reversedTokens.length - 2].length + reversedTokens[reversedTokens.length - 1].length;
    } else if (reversedTokens && reversedTokens.length >= 4) {
       cta = reversedTokens[reversedTokens.length - 1].trim();
       ctaLength = reversedTokens[reversedTokens.length - 1].length;
    } else {
        cta = reversedTokens ? reversedTokens[reversedTokens.length - 1] : '';
        ctaLength = cta.length;
    }

    const devStart = ganchoEndIndex;
    const devEnd = cleanText.length - ctaLength;
    const desenvolvimento = cleanText.substring(devStart, devEnd).trim();

    return { titulo, gancho, desenvolvimento, cta }
  }

  const pureText = (blockMatch, tagName) => 
    blockMatch ? blockMatch[0].replace(tagName, '').replace(/\*\*/g, '').trim() : '';

  return {
    titulo,
    gancho: pureText(mGancho, /(?:\*\*)?\[GANCHO\](?:\*\*)?/i),
    desenvolvimento: pureText(mDev, /(?:\*\*)?\[DESENVOLVIMENTO\](?:\*\*)?/i),
    cta: pureText(mCta, /(?:\*\*)?\[CTA E FINAL\](?:\*\*)?/i),
  };
}

let aiGenerated = `(Mostra print de criadores usando ChatGPT)
Reel, legenda, email, post carrossel... (Mais prints)
Virou febre!
Aí você vai lá, joga um tema, e volta um textão genérico, sem graça, que não engaja ninguém. (Faz cara de decepção)
E a gente perde um tempão editando, tentando dar um jeito, pra no fim das contas não viralizar. (Balança a cabeça negativamente)
Sério, miga, para de sofrer! (Faz sinal de stop com a mão)
Enquanto o ChatGPT te entrega mais do mesmo, o Claude te dá uma visão estratégica, sabe? (Faz joinha com a mão)
Ele entende a sua persona, o seu nicho, e te ajuda a criar conteúdos que realmente convertem. (Gesticula positivamente)
É tipo ter um estrategista do seu lado, 24 horas por dia, sem te cobrar uma fortuna. (Sorri)
Confia na sua amiga aqui: testei os dois, e o Claude me salvou de cada roubada... (Aponta para si mesma)
É ele que me ajuda a ter ideias criativas e a otimizar meu tempo. (Dá piscadinha)
E aí, vai continuar sofrendo com o ChatGPT ou vai dar uma chance pro Claude? (Levanta as sobrancelhas, esperando a resposta)`;

let generatedReel = aiGenerated;
let parsed = parse(generatedReel);

console.log("INITIAL PARSED:");
console.log(parsed);

// User edits Gancho to 'aa'
function updateReel(p, newBlocks) {
    const merged = { ...p, ...newBlocks }
    return \`**\${merged.titulo}**\n\n[GANCHO]\n\${merged.gancho}\n\n[DESENVOLVIMENTO]\n\${merged.desenvolvimento}\n\n[CTA E FINAL]\n\${merged.cta}\`
}

generatedReel = updateReel(parsed, { gancho: 'aa' });
console.log("\\nAFTER USER UPDATE 1:");
console.log(generatedReel);

let parsed2 = parse(generatedReel);
console.log("\\nPARSED 2:");
console.log(parsed2);

// User deletes changing to 'a'
generatedReel = updateReel(parsed2, { gancho: 'a' });
console.log("\\nAFTER USER UPDATE 2:");
console.log(generatedReel);

let parsed3 = parse(generatedReel);
console.log("\\nPARSED 3:");
console.log(parsed3);
