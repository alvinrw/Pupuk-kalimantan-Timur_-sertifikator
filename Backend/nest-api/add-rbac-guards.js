const fs = require('fs');
const path = require('path');

const controllers = [
  'activity-logs/activity-logs.controller.ts',
  'certificates/certificates.controller.ts',
  'csv-import/csv-import.controller.ts',
  'document-history/document-history.controller.ts',
  'iuran-keanggotaan/iuran-keanggotaan.controller.ts',
  'master-items/master-items.controller.ts',
  'monitoring/monitoring.controller.ts'
];

const basePath = path.join(__dirname, 'src', 'modules');

for (const file of controllers) {
  const filePath = path.join(basePath, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has UseGuards(JwtAuthGuard
  if (content.includes('UseGuards(JwtAuthGuard')) continue;

  // Add imports
  content = content.replace(/import { Controller,([^}]*)} from '@nestjs\/common';/, "import { Controller,$1, UseGuards } from '@nestjs/common';");
  
  const depth = file.split('/').length;
  let relativeAuthPath = '../auth';
  if (depth > 1) {
     relativeAuthPath = '../'.repeat(depth) + 'auth';
  }
  content = `import { JwtAuthGuard } from '${relativeAuthPath}/jwt-auth.guard';\nimport { RolesGuard } from '${relativeAuthPath}/roles.guard';\nimport { Roles } from '${relativeAuthPath}/roles.decorator';\n` + content;

  // Add class level decorators
  content = content.replace(/@Controller\([^)]*\)/, "$&\n@UseGuards(JwtAuthGuard, RolesGuard)\n@Roles('Admin 1', 'Admin 2', 'Admin 3', 'User', 'Viewer')");

  // Add method level overrides for write operations
  // Note: we want to match @Post(...), @Put(...), @Patch(...), @Delete(...) 
  // and inject @Roles('Admin 1', 'Admin 2', 'Admin 3', 'User') above them.
  const writeOpsRegex = /@(Post|Put|Patch|Delete)\([^)]*\)\n/g;
  content = content.replace(writeOpsRegex, (match) => {
    return `@Roles('Admin 1', 'Admin 2', 'Admin 3', 'User')\n  ${match}`;
  });

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
