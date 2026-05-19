#!/usr/bin/env node
// Script para substituir alerts por toasts
const fs = require('fs');
const path = require('path');

console.log('\n🔄 Substituindo alerts por toasts...\n');

const files = [
  'src/components/Dashboard.tsx',
  'src/components/AdminPanel.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Arquivo não encontrado: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Adicionar import se não existir
  if (!content.includes("import { showSuccess, showError, showInfo, showWarning } from '../utils/toast';")) {
    // Encontrar a última linha de import
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
    const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]);
    const insertPosition = content.indexOf('\n', lastImportIndex) + 1;
    
    content = content.slice(0, insertPosition) + 
              "import { showSuccess, showError, showInfo, showWarning } from '../utils/toast';\n" +
              content.slice(insertPosition);
  }
  
  // Substituir alerts
  let replacements = 0;
  
  // alert('✅ ...') -> showSuccess
  content = content.replace(/alert\('✅([^']+)'\)/g, (match, msg) => {
    replacements++;
    return `showSuccess('${msg.trim()}')`;
  });
  
  // alert(`✅ ...`) -> showSuccess
  content = content.replace(/alert\(`✅([^`]+)`\)/g, (match, msg) => {
    replacements++;
    return `showSuccess(\`${msg.trim()}\`)`;
  });
  
  // alert('❌ ...') -> showError
  content = content.replace(/alert\('❌([^']+)'\)/g, (match, msg) => {
    replacements++;
    return `showError('${msg.trim()}')`;
  });
  
  // alert(`❌ ...`) -> showError
  content = content.replace(/alert\(`❌([^`]+)`\)/g, (match, msg) => {
    replacements++;
    return `showError(\`${msg.trim()}\`)`;
  });
  
  // alert('Erro: ...') -> showError
  content = content.replace(/alert\('Erro:([^']+)'\)/g, (match, msg) => {
    replacements++;
    return `showError('Erro:${msg}')`;
  });
  
  // alert(`Erro: ...`) -> showError
  content = content.replace(/alert\(`Erro:([^`]+)`\)/g, (match, msg) => {
    replacements++;
    return `showError(\`Erro:${msg}\`)`;
  });
  
  // alert(error.message ...) -> showError
  content = content.replace(/alert\(error\.message[^)]*\)/g, (match) => {
    replacements++;
    return `showError(error.message || 'Erro desconhecido')`;
  });
  
  // alert('...copiado!') -> showSuccess
  content = content.replace(/alert\('([^']+copiado!)'\)/g, (match, msg) => {
    replacements++;
    return `showSuccess('${msg}')`;
  });
  
  // Outros alerts genéricos -> showInfo
  content = content.replace(/alert\('([^']+)'\)/g, (match, msg) => {
    if (!msg.includes('Erro') && !msg.includes('❌')) {
      replacements++;
      return `showInfo('${msg}')`;
    }
    return match;
  });
  
  content = content.replace(/alert\(`([^`]+)`\)/g, (match, msg) => {
    if (!msg.includes('Erro') && !msg.includes('❌')) {
      replacements++;
      return `showInfo(\`${msg}\`)`;
    }
    return match;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ ${file}: ${replacements} alerts substituídos`);
});

console.log('\n✅ Concluído!\n');
