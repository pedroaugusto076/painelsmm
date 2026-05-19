#!/usr/bin/env node
// Script para preparar o projeto para produção
const fs = require('fs');
const path = require('path');

console.log('\n🚀 Preparando projeto para produção...\n');

// Arquivos para processar
const filesToProcess = [
  'src/App.tsx',
  'src/components/Dashboard.tsx',
  'src/components/AdminPanel.tsx',
  'src/components/ApiDocs.tsx',
  'src/services/api.ts',
  'api/v1/index.js',
  'api/auth/index.js',
  'api/payments/balance.js',
  'api/payments/webhook.js',
  'api/admin/approve/[orderId].js'
];

let totalRemoved = 0;

filesToProcess.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Arquivo não encontrado: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalLength = content.split('\n').length;
  
  // Remover console.log, console.error, console.warn
  content = content.replace(/console\.(log|error|warn|info|debug)\([^)]*\);?\n?/g, '');
  
  // Remover linhas vazias consecutivas
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  const newLength = content.split('\n').length;
  const removed = originalLength - newLength;
  
  if (removed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file}: ${removed} linhas removidas`);
    totalRemoved += removed;
  } else {
    console.log(`✓  ${file}: já limpo`);
  }
});

console.log('\n' + '='.repeat(50));
console.log(`✅ Total de linhas removidas: ${totalRemoved}`);
console.log('='.repeat(50) + '\n');
console.log('📝 Próximos passos:');
console.log('   1. Revisar as mudanças: git diff');
console.log('   2. Testar localmente: npm run dev');
console.log('   3. Commitar: git add . && git commit -m "chore: preparar para producao"');
console.log('   4. Deploy: git push origin main\n');
