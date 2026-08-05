const fs = require('fs');
const path = require('path');

const directory = 'src';

const replacements = {
  'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ': ' - ',
  'ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤': '≤',
  'ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢': '•',
  'ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢': '→',
  'ÃƒÂ¢Ã¢â‚¬Â Ã¢â€šÂ¬': '-',
  'ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“': '✓',
  'ÃƒÂ¢Ã…Â¡Ã‚Â¡': '⚡',
  'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“': ' - ',
  'Ã¢â‚¬â€œ': '-'
};

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walkDir(directory);
let modifiedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  for (const [bad, good] of Object.entries(replacements)) {
    // Escape special characters for regex if necessary, but split/join is safer for exact string matching
    content = content.split(bad).join(good);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedFiles++;
    console.log(`Fixed: ${file}`);
  }
});

console.log(`Done! Fixed ${modifiedFiles} files.`);
