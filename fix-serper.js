const fs = require('fs');
let code = fs.readFileSync('src/app/api/roteirista/route.ts', 'utf8');

// We will add a timeout wrapper inside route.ts to prevent Serper from hanging, 
// OR we just bypass Serper temporarily to confirm the bug!
code = code.replace(
  `const sRes = await fetch('https://google.serper.dev/search', {`,
  `// PATCH: Serper DNS resolution bug in Vercel sometimes ignores AbortController\n          const sRes = await Promise.race([\n            fetch('https://google.serper.dev/search', {\n`
);

code = code.replace(
  `signal: controller.signal\n          })`,
  `signal: controller.signal\n          }),\n            new Promise((_, reject) => setTimeout(() => reject(new Error("Serper timeout absoluto atingido")), 3500))\n          ]) as any;`
);

fs.writeFileSync('src/app/api/roteirista/route.ts', code);
