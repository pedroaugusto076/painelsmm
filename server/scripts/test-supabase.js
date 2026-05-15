import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar .env
dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔍 TESTE DE CONFIGURAÇÃO DO SUPABASE');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

console.log('📋 Valores encontrados no .env:');
console.log('');

// Verificar SUPABASE_URL
console.log('1️⃣  SUPABASE_URL:');
if (!url) {
  console.log('   ❌ NÃO ENCONTRADO no .env');
} else if (url === 'your_supabase_url_here' || url === 'https://seu-projeto.supabase.co') {
  console.log('   ⚠️  VALOR PADRÃO (não configurado)');
  console.log('   📝 Valor atual:', url);
} else if (!url.startsWith('https://')) {
  console.log('   ❌ FORMATO INCORRETO');
  console.log('   📝 Valor atual:', url);
  console.log('   ✅ Deve começar com: https://');
  console.log('   ✅ Exemplo correto: https://xyzabc123.supabase.co');
} else if (!url.includes('.supabase.co')) {
  console.log('   ❌ FORMATO INCORRETO');
  console.log('   📝 Valor atual:', url);
  console.log('   ✅ Deve terminar com: .supabase.co');
  console.log('   ✅ Exemplo correto: https://xyzabc123.supabase.co');
} else {
  console.log('   ✅ FORMATO CORRETO');
  console.log('   📝 Valor:', url);
}

console.log('');

// Verificar SUPABASE_ANON_KEY
console.log('2️⃣  SUPABASE_ANON_KEY:');
if (!key) {
  console.log('   ❌ NÃO ENCONTRADO no .env');
} else if (key.includes('your_supabase_anon_key_here') || key.includes('sua-chave-aqui')) {
  console.log('   ⚠️  VALOR PADRÃO (não configurado)');
  console.log('   📝 Valor atual:', key.substring(0, 50) + '...');
} else if (!key.startsWith('eyJ')) {
  console.log('   ❌ FORMATO INCORRETO');
  console.log('   📝 Valor atual:', key.substring(0, 50) + '...');
  console.log('   ✅ Deve começar com: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.');
  console.log('   ✅ É um JWT (JSON Web Token)');
} else if (key.length < 100) {
  console.log('   ⚠️  MUITO CURTO (pode estar incompleto)');
  console.log('   📝 Tamanho atual:', key.length, 'caracteres');
  console.log('   ✅ Deve ter centenas de caracteres');
} else {
  console.log('   ✅ FORMATO CORRETO');
  console.log('   📝 Tamanho:', key.length, 'caracteres');
  console.log('   📝 Início:', key.substring(0, 50) + '...');
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════');

// Resultado final
const urlOk = url && url.startsWith('https://') && url.includes('.supabase.co') && !url.includes('seu-projeto');
const keyOk = key && key.startsWith('eyJ') && key.length > 100 && !key.includes('sua-chave');

if (urlOk && keyOk) {
  console.log('✅ CONFIGURAÇÃO CORRETA!');
  console.log('');
  console.log('Próximo passo:');
  console.log('1. Execute: npm run dev');
  console.log('2. Você deve ver: "✅ Conectado ao Supabase"');
} else {
  console.log('❌ CONFIGURAÇÃO INCORRETA');
  console.log('');
  console.log('📚 Como corrigir:');
  console.log('');
  console.log('1. Acesse: https://supabase.com');
  console.log('2. Faça login e selecione seu projeto');
  console.log('3. Vá em: Settings > API');
  console.log('4. Copie:');
  console.log('   - Project URL → SUPABASE_URL');
  console.log('   - anon public → SUPABASE_ANON_KEY');
  console.log('5. Cole no arquivo: server/.env');
  console.log('6. Execute este teste novamente: npm run test-supabase');
  console.log('');
  console.log('📖 Guia completo: server/VALORES_CORRETOS.md');
}

console.log('═══════════════════════════════════════════════════════════════');
