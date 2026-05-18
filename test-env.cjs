// Script para testar se as variáveis de ambiente estão configuradas
const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verificando variáveis de ambiente...\n');

// Ler o arquivo .env.local
const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ Arquivo .env.local não encontrado!');
  console.log('📝 Crie o arquivo .env.local com as variáveis necessárias');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

// Parse do arquivo .env
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

let allConfigured = true;

requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (value) {
    const preview = value.length > 30 ? value.substring(0, 30) + '...' : value;
    console.log(`✅ ${varName}: ${preview}`);
  } else {
    console.log(`❌ ${varName}: NÃO CONFIGURADO`);
    allConfigured = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allConfigured) {
  console.log('✅ Todas as variáveis estão configuradas localmente!');
  console.log('\n📝 Próximo passo:');
  console.log('   Configure essas mesmas variáveis no Vercel');
  console.log('   Veja o arquivo CONFIGURAR_VERCEL.md');
  console.log('\n🚀 Para configurar no Vercel:');
  console.log('   1. Acesse: https://vercel.com/dashboard');
  console.log('   2. Selecione o projeto: painelsmm-two');
  console.log('   3. Vá em Settings > Environment Variables');
  console.log('   4. Adicione TODAS as variáveis acima');
  console.log('   5. Faça Redeploy do projeto');
} else {
  console.log('❌ Algumas variáveis não estão configuradas!');
  console.log('\n📝 Verifique o arquivo .env.local');
}

console.log('='.repeat(50) + '\n');
