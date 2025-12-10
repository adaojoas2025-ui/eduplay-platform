// COLE ESTE CÓDIGO NO CONSOLE DO NAVEGADOR (F12 -> Console)
// Isso vai corrigir suas permissões INSTANTANEAMENTE

(function() {
  console.log('🔧 Iniciando correção de permissões...');

  // Pegar dados atuais
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!user.email) {
    console.error('❌ Nenhum usuário encontrado no localStorage!');
    console.log('Por favor, faça login primeiro.');
    return;
  }

  console.log('👤 Usuário encontrado:', user.email);
  console.log('📋 Role atual:', user.role);

  // Atualizar para PRODUCER
  user.role = 'PRODUCER';

  // Salvar de volta
  localStorage.setItem('user', JSON.stringify(user));

  console.log('✅ SUCESSO! Role atualizada para PRODUCER');
  console.log('📢 RECARREGUE A PÁGINA (F5) para aplicar as mudanças!');

  // Mostrar alerta
  alert('✅ Permissões corrigidas!\n\nPressione F5 para recarregar a página e testar a criação de produtos.');
})();
