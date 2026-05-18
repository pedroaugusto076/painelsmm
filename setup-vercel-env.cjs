// Script para adicionar variáveis de ambiente no Vercel via API
const https = require('https');
const fs = require('fs');
const path = require('path');

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

console.log('\n🔧 Setup de Variáveis de Ambiente no Vercel\n');
console.log('Para usar este script, você precisa:');
console.log('1. Ter um token de API do Vercel');
console.log('2. Saber o ID do seu projeto\n');

console.log('📝 Como obter o token:');
console.log('   1. Acesse: https://vercel.com/account/tokens');
console.log('   2. Clique em "Create Token"');
console.log('   3. Dê um nome (ex: "painelsmm-env")');
console.log('   4. Copie o token gerado\n');

console.log('📝 Como obter o Project ID:');
console.log('   1. Acesse: https://vercel.com/dashboard');
console.log('   2. Selecione o projeto "painelsmm-two"');
console.log('   3. Vá em Settings');
console.log('   4. O Project ID está no topo da página\n');

console.log('💡 Ou configure manualmente no painel:');
console.log('   https://vercel.com/dashboard → painelsmm-two → Settings → Environment Variables\n');

console.log('📋 Variáveis que precisam ser adicionadas:\n');

Object.keys(envVars).forEach(key => {
  const value = envVars[key];
  const preview = value.length > 40 ? value.substring(0, 40) + '...' : value;
  console.log(`   ${key}=${preview}`);
});

console.log('\n' + '='.repeat(60));
console.log('⚠️  IMPORTANTE: Configure no painel do Vercel!');
console.log('='.repeat(60) + '\n');
