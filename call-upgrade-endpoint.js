// COLE ESTE CÓDIGO NO CONSOLE (F12) PARA CHAMAR O ENDPOINT DE UPGRADE

(async function() {
  console.log('🚀 Chamando endpoint de upgrade para PRODUCER...');

  const token = localStorage.getItem('token');

  if (!token) {
    console.error('❌ Token não encontrado! Faça login primeiro.');
    alert('Faça login primeiro!');
    return;
  }

  try {
    const response = await fetch('https://eduplay-backend-2f0c.onrender.com/api/v1/auth/upgrade-to-producer', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!data.success) {
      console.error('❌ Erro:', data.message);
      alert('Erro: ' + data.message);
      return;
    }

    console.log('✅ SUCESSO! Você agora é PRODUCER!');
    console.log('👤 Dados atualizados:', data.data);
    console.log('📋 Nova role:', data.data.role);

    // Atualizar localStorage
    localStorage.setItem('user', JSON.stringify(data.data));

    alert('✅ UPGRADE COMPLETO!\n\nVocê agora é PRODUCER!\n\nFazendo logout para garantir token fresh...');

    // Logout e redirecionar para login
    localStorage.clear();
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);

  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    alert('Erro ao fazer upgrade. Verifique o console.');
  }
})();
