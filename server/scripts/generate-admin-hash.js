import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('='.repeat(50));
console.log('GERADOR DE HASH PARA SENHA DE ADMIN');
console.log('='.repeat(50));
console.log('');

rl.question('Digite a senha para o admin: ', (password) => {
  if (!password || password.length < 6) {
    console.error('❌ Senha deve ter pelo menos 6 caracteres!');
    rl.close();
    return;
  }

  console.log('');
  console.log('🔐 Gerando hash...');
  
  const hash = bcrypt.hashSync(password, 10);
  
  console.log('');
  console.log('✅ Hash gerado com sucesso!');
  console.log('');
  console.log('='.repeat(50));
  console.log('COPIE O HASH ABAIXO:');
  console.log('='.repeat(50));
  console.log(hash);
  console.log('='.repeat(50));
  console.log('');
  console.log('📋 Use este SQL no Supabase para criar o admin:');
  console.log('');
  console.log(`INSERT INTO users (name, email, password_hash, is_admin, role, email_verified)`);
  console.log(`VALUES (`);
  console.log(`  'Administrador',`);
  console.log(`  'admin@seudominio.com',`);
  console.log(`  '${hash}',`);
  console.log(`  TRUE,`);
  console.log(`  'admin',`);
  console.log(`  TRUE`);
  console.log(`);`);
  console.log('');
  console.log('⚠️  IMPORTANTE: Altere o email antes de executar!');
  console.log('');
  
  rl.close();
});
