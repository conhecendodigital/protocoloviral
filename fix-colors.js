const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Make all dark mode small texts white/light gray!
  // Our previous script mapped text-slate-400 to text-slate-600 dark:text-slate-400. Let's make the dark mode explicitly white/80
  content = content.replace(/dark:text-slate-400(?!\d)/g, 'dark:text-white/70');
  content = content.replace(/dark:text-slate-500(?!\d)/g, 'dark:text-white/60');
  content = content.replace(/dark:text-slate-600(?!\d)/g, 'dark:text-white/50');
  
  // Also any raw slate text that missed the first pass
  content = content.replace(/text-slate-400(?!\d)/g, 'text-slate-600 dark:text-white/70');
  content = content.replace(/text-slate-500(?!\d)/g, 'text-slate-600 dark:text-white/60');
  
  // Fix background opacities that might be hardcoded as bg-black/* in light mode, which makes everything dark
  // Instead of bg-black/50, we want white/50 in light mode and black/50 in dark mode
  content = content.replace(/bg-black\/50(?!\s*dark:)/g, 'bg-white/80 dark:bg-black/50');
  content = content.replace(/bg-black\/80(?!\s*dark:)/g, 'bg-white/90 dark:bg-black/80');

  // Fix borders
  content = content.replace(/border-slate-300\/5 dark:border-white\/5/g, 'border-slate-200 dark:border-white/10');
  content = content.replace(/border-white\/10(?!\s*dark:)/g, 'border-slate-200 dark:border-white/10');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated texts in: ' + filePath);
  }
}

walkDir(path.join(__dirname, 'src'), processFile);
console.log('Done applying white text for dark mode!');
