/**
 * Check Environment Variables
 * Verifica se as variáveis de ambiente estão configuradas
 */

console.log('🔍 VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE\n');
console.log('═'.repeat(60));
console.log('');

// Variáveis críticas para email
const emailVars = {
  'NODE_ENV': process.env.NODE_ENV,
  'EMAIL_FROM': process.env.EMAIL_FROM,
  'SENDGRID_API_KEY': process.env.SENDGRID_API_KEY ?
    `${process.env.SENDGRID_API_KEY.substring(0, 10)}...${process.env.SENDGRID_API_KEY.substring(process.env.SENDGRID_API_KEY.length - 4)}` :
    '❌ NÃO ENCONTRADA',
  'RESEND_API_KEY': process.env.RESEND_API_KEY ?
    `${process.env.RESEND_API_KEY.substring(0, 10)}...` :
    'não configurada',
};

console.log('📧 Variáveis de Email:');
console.log('');
Object.entries(emailVars).forEach(([key, value]) => {
  const status = value && value !== '❌ NÃO ENCONTRADA' ? '✅' : '❌';
  console.log(`${status} ${key}: ${value || '(vazio)'}`);
});

console.log('');
console.log('═'.repeat(60));
console.log('');

// Diagnóstico
if (process.env.SENDGRID_API_KEY) {
  console.log('✅ SENDGRID_API_KEY está configurada!');
  console.log('');
  console.log('O SendGrid deve estar funcionando.');
  console.log('');
  console.log('Se os emails não estão chegando:');
  console.log('  1. Verifique se o sender está verificado no SendGrid');
  console.log('  2. Execute: node scripts/vvc-sendgrid.js');
} else {
  console.log('❌ SENDGRID_API_KEY NÃO ESTÁ CONFIGURADA!');
  console.log('');
  console.log('Passos para resolver:');
  console.log('');
  console.log('1. Acesse o Render:');
  console.log('   https://dashboard.render.com/web/srv-d5a5badactks73f4mcq0/env');
  console.log('');
  console.log('2. Verifique se a variável SENDGRID_API_KEY existe');
  console.log('');
  console.log('3. Se não existe, adicione:');
  console.log('   Key: SENDGRID_API_KEY');
  console.log('   Value: sua-api-key-do-sendgrid');
  console.log('');
  console.log('4. Se existe, clique em "Manual Deploy" para forçar rebuild');
  console.log('');
}

console.log('═'.repeat(60));
