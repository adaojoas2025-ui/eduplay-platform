// COLE ESTE CÓDIGO NO CONSOLE DO NAVEGADOR (F12 -> Console)
// Este script vai te fazer um re-login completo para garantir que tudo funcione

(async function() {
  console.log('🔧 Iniciando correção completa de autenticação...');

  // Pegar email do usuário atual
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const email = currentUser.email;

  if (!email) {
    console.error('❌ Nenhum usuário encontrado!');
    alert('Por favor, faça login primeiro.');
    return;
  }

  console.log('👤 Email:', email);

  // Perguntar a senha
  const password = prompt('Digite sua senha para re-autenticar:');

  if (!password) {
    console.log('❌ Cancelado pelo usuário');
    return;
  }

  console.log('🔄 Fazendo re-login...');

  try {
    // Fazer login novamente
    const response = await fetch('https://eduplay-backend-2f0c.onrender.com/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!data.success) {
      console.error('❌ Erro no login:', data.message);
      alert('Erro: ' + data.message);
      return;
    }

    console.log('✅ Login bem-sucedido!');
    console.log('👤 Usuário:', data.data.user.name);
    console.log('📋 Role:', data.data.user.role);

    // Limpar tudo
    localStorage.clear();

    // Salvar novos tokens e dados
    localStorage.setItem('token', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));

    console.log('✅ SUCESSO! Autenticação completa.');
    console.log('📢 Recarregando a página...');

    alert('✅ Autenticação corrigida!\n\nRole: ' + data.data.user.role + '\n\nA página será recarregada...');

    // Recarregar
    setTimeout(() => {
      location.reload();
    }, 1000);

  } catch (error) {
    console.error('❌ Erro:', error);
    alert('Erro ao fazer login. Verifique o console para mais detalhes.');
  }
})();
