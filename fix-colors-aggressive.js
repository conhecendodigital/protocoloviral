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

  // The user explicitly requested WHITE text in dark mode for all small text, without gradients/alphas that make it dim.
  content = content.replace(/dark:text-white\/40/g, 'dark:text-white/90');
  content = content.replace(/dark:text-white\/50/g, 'dark:text-white/90');
  content = content.replace(/dark:text-white\/60/g, 'dark:text-white/90');
  content = content.replace(/dark:text-white\/70/g, 'dark:text-white/90');
  
  // Replace dark:text-slate-400 or dark:text-slate-500 directly with white just to be safe
  content = content.replace(/dark:text-slate-[456]00/g, 'dark:text-white/90');
  
  // Specific dark:text-white/50 was generated earlier, let's catch any generic forms
  content = content.replace(/text-slate-500(?!\d)/g, 'text-slate-600 dark:text-white/90');
  content = content.replace(/text-slate-400(?!\d)/g, 'text-slate-600 dark:text-white/90');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Forced solid white text in: ' + filePath);
  }
}

walkDir(path.join(__dirname, 'src'), processFile);
console.log('Done aggressively applying white text for dark mode!');
