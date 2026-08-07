const fs = require('fs');
const path = require('path');

const directoryToSearch = [
  './src',
  './prisma',
  '../../frontent/src',
  '../../ROADMAP_RBAC.md'
];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replacements
  content = content.replace(/'Admin 1'/g, "'Super Admin'");
  content = content.replace(/"Admin 1"/g, '"Super Admin"');
  content = content.replace(/Admin 1/g, "Super Admin");

  // For arrays and decorators
  content = content.replace(/'Admin 2',\s*'Admin 3'/g, "'Admin'");
  content = content.replace(/"Admin 2",\s*"Admin 3"/g, '"Admin"');
  
  // Any remaining Admin 2 or Admin 3
  content = content.replace(/'Admin 2'/g, "'Admin'");
  content = content.replace(/"Admin 2"/g, '"Admin"');
  content = content.replace(/Admin 2/g, "Admin");

  content = content.replace(/'Admin 3'/g, "'Admin'");
  content = content.replace(/"Admin 3"/g, '"Admin"');
  content = content.replace(/Admin 3/g, "Admin");

  // Remove duplicate 'Admin', 'Admin' just in case
  content = content.replace(/'Admin',\s*'Admin'/g, "'Admin'");
  content = content.replace(/"Admin",\s*"Admin"/g, '"Admin"');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
        replaceInFile(dir);
        return;
    }
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.md')) {
        replaceInFile(fullPath);
      }
    }
  }
}

directoryToSearch.forEach(dir => walkDir(path.join(__dirname, dir)));
