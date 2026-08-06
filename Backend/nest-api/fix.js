const fs = require('fs');
const files = [
  'certificates/certificates.controller.ts',
  'csv-import/csv-import.controller.ts',
  'document-history/document-history.controller.ts',
  'iuran-keanggotaan/iuran-keanggotaan.controller.ts',
  'master-items/master-items.controller.ts',
  'monitoring/monitoring.controller.ts'
];

files.forEach(f => {
  const p = 'src/modules/' + f;
  let content = fs.readFileSync(p, 'utf8');
  
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/@(?:Post|Put|Patch|Delete)\b/)) {
      if (i > 0 && !lines[i-1].includes('@Roles')) {
        lines.splice(i, 0, "  @Roles('Admin 1', 'Admin 2', 'Admin 3', 'User')");
        i++; // skip the newly inserted line
      }
    }
  }
  
  if (f === 'master-items/master-items.controller.ts') {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('getTaskCenterData()')) {
        if (lines[i-1].includes('@Get')) {
          if (!lines[i-2].includes('@Roles')) {
            lines.splice(i-1, 0, "  @Roles('Admin 1', 'Admin 2', 'Admin 3', 'User')");
            i++;
          }
        }
      }
    }
  }
  
  fs.writeFileSync(p, lines.join('\r\n'));
  console.log('Fixed methods in ' + p);
});
