#!/usr/bin/env node
// Script para adicionar variáveis de ambiente no Vercel automaticamente
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🚀 Adicionando variáveis de ambiente no Vercel...\n');

// Ler variáveis do .env.local
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ Arquivo .env.local não encontrado!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

const requiredVars = [
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'BACKEND_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'MERCADOPAGO_ACCESS_TOKEN',
  'MERCADOPAGO_WEBHOOK_SECRET',
  'SMMMIDIA_API_URL',
  'SMMMIDIA_API_KEY',
  'SMMMIDIA_SERVICE_ID'
];

console.log('📋 Variáveis encontradas no .env.local:\n');
requiredVars.forEach(key => {
  if (envVars[key]) {
    const preview = envVars[key].length > 30 ? envVars[key].substring(0, 30) + '...' : envVars[key];
    console.log(`   ✅ ${key}: ${preview}`);
  } else {
    console.log(`   ❌ ${key}: NÃO ENCONTRADO`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('⚠️  IMPORTANTE: Você precisa estar logado no Vercel');
console.log('='.repeat(60) + '\n');

console.log('🔐 Fazendo login no Vercel...\n');

try {
  // Fazer login no Vercel
  execSync('vercel login', { stdio: 'inherit' });
  
  console.log('\n✅ Login realizado com sucesso!\n');
  console.log('📤 Adicionando variáveis de ambiente...\n');

  let successCount = 0;
  let errorCount = 0;

  // Adicionar cada variável
  requiredVars.forEach(key => {
    if (envVars[key]) {
      try {
        const value = envVars[key];
        
        // Adicionar para Production
        console.log(`   Adicionando ${key} (Production)...`);
        execSync(`vercel env add ${key} production`, {
          input: value + '\n',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        // Adicionar para Preview
        console.log(`   Adicionando ${key} (Preview)...`);
        execSync(`vercel env add ${key} preview`, {
          input: value + '\n',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        // Adicionar para Development
        console.log(`   Adicionando ${key} (Development)...`);
        execSync(`vercel env add ${key} development`, {
          input: value + '\n',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        console.log(`   ✅ ${key} adicionado com sucesso!\n`);
        successCount++;
      } catch (error) {
        console.log(`   ⚠️  ${key} pode já existir ou houve erro\n`);
        errorCount++;
      }
    }
  });

  console.log('='.repeat(60));
  console.log(`✅ Processo concluído!`);
  console.log(`   ${successCount} variáveis adicionadas`);
  if (errorCount > 0) {
    console.log(`   ${errorCount} variáveis com erro (podem já existir)`);
  }
  console.log('='.repeat(60) + '\n');

  console.log('🔄 Próximo passo: Fazer redeploy');
  console.log('   Execute: vercel --prod\n');

} catch (error) {
  console.error('\n❌ Erro ao executar:', error.message);
  console.log('\n💡 Tente configurar manualmente:');
  console.log('   https://vercel.com/dashboard → painelsmm-two → Settings → Environment Variables\n');
  process.exit(1);
}
