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

  // Background and border transformations for glassmorphism
  // This EXPLICITLY keeps dark mode mathematically identical by prefixing the original class with 'dark:'
  content = content.replace(/bg-white\/(5|10|15|20)(?!\d)/g, 'bg-black/$1 dark:bg-white/$1');
  content = content.replace(/border-white\/(5|10|15|20)(?!\d)/g, 'border-slate-300/$1 dark:border-white/$1');

  // Text adjustments - we DO NOT alter the brightness of dark mode. We keep the original class for dark!
  content = content.replace(/text-slate-200(?!\d)/g, 'text-slate-800 dark:text-slate-200');
  content = content.replace(/text-slate-300(?!\d)/g, 'text-slate-800 dark:text-slate-300');
  content = content.replace(/text-slate-400(?!\d)/g, 'text-slate-600 dark:text-slate-400');
  content = content.replace(/text-slate-500(?!\d)/g, 'text-slate-700 dark:text-slate-500'); 
  content = content.replace(/text-slate-600(?!\d)/g, 'text-slate-800 dark:text-slate-600'); 

  // Direct text-white needs to be dark text in light mode, except when on blue backgrounds
  content = content.replace(/text-white(?!\/)/g, 'text-slate-900 dark:text-white');
  
  // Revert texts that are on primary colored backgrounds back to always white
  content = content.replace(/bg-\[#0ea5e9\] text-slate-900 dark:text-white/g, 'bg-[#0ea5e9] text-white');
  content = content.replace(/bg-blue-600 text-slate-900 dark:text-white/g, 'bg-blue-600 text-white');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated: ' + filePath);
  }
}

walkDir(path.join(__dirname, 'src'), processFile);
console.log('Done replacement passes!');
