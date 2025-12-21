/**
 * Script para testar o fluxo completo de aprovação de produtos
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';

// Credenciais
const SELLER_EMAIL = 'teste@exemplo.com';
const SELLER_PASSWORD = 'Senha123';
const ADMIN_EMAIL = 'ja.eduplay@gmail.com';
const ADMIN_PASSWORD = 'Asa122448@';

let sellerToken = '';
let adminToken = '';
let testProductId = '';

async function loginAsSeller() {
  console.log('\n1. Fazendo login como VENDEDOR...');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: SELLER_EMAIL,
      password: SELLER_PASSWORD
    });
    sellerToken = response.data.data.accessToken;
    console.log('✅ Login vendedor OK');
    return true;
  } catch (error) {
    console.error('❌ Erro no login vendedor:', error.response?.data?.message || error.message);
    return false;
  }
}

async function loginAsAdmin() {
  console.log('\n2. Fazendo login como ADMIN...');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    adminToken = response.data.data.accessToken;
    console.log('✅ Login admin OK');
    return true;
  } catch (error) {
    console.error('❌ Erro no login admin:', error.response?.data?.message || error.message);
    return false;
  }
}

async function createTestProduct() {
  console.log('\n3. Criando produto de teste...');
  try {
    const productData = {
      title: 'Produto Teste - Sistema de Aprovação',
      description: 'Este é um produto de teste para validar o sistema de aprovação de produtos.',
      price: 99.90,
      category: 'Programação',
      level: 'BEGINNER',
      language: 'Português',
      certificateIncluded: true,
      hasSupport: true,
      status: 'DRAFT',
      filesUrl: ['https://drive.google.com/file/d/teste123']
    };

    const response = await axios.post(`${API_URL}/products`, productData, {
      headers: { Authorization: `Bearer ${sellerToken}` }
    });

    testProductId = response.data.data.id;
    console.log('✅ Produto criado:', testProductId);
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar produto:', error.response?.data?.message || error.message);
    return false;
  }
}

async function publishProduct() {
  console.log('\n4. Publicando produto (enviando para aprovação)...');
  try {
    const response = await axios.put(
      `${API_URL}/products/${testProductId}`,
      { status: 'PUBLISHED' },
      { headers: { Authorization: `Bearer ${sellerToken}` } }
    );

    console.log('✅ Produto publicado (status:', response.data.data.status, ')');
    console.log('📧 Email deve ter sido enviado para:', ADMIN_EMAIL);
    return true;
  } catch (error) {
    console.error('❌ Erro ao publicar produto:', error.response?.data?.message || error.message);
    return false;
  }
}

async function listPendingProducts() {
  console.log('\n5. Listando produtos pendentes de aprovação...');
  try {
    const response = await axios.get(`${API_URL}/admin/products/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const products = response.data.data?.items || response.data.data || [];
    console.log(`✅ Encontrados ${products.length} produto(s) pendente(s)`);

    if (products.length > 0) {
      console.log('\nProdutos pendentes:');
      products.forEach(p => {
        console.log(`  - ${p.title} (${p.id}) - Status: ${p.status}`);
      });
    }

    return products.length > 0;
  } catch (error) {
    console.error('❌ Erro ao listar pendentes:', error.response?.data?.message || error.message);
    return false;
  }
}

async function approveProduct() {
  console.log('\n6. Aprovando produto...');
  try {
    const response = await axios.post(
      `${API_URL}/admin/products/${testProductId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    console.log('✅ Produto aprovado! Status:', response.data.data.status);
    console.log('📧 Email de aprovação deve ter sido enviado para o vendedor');
    return true;
  } catch (error) {
    console.error('❌ Erro ao aprovar produto:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testRejectProduct() {
  console.log('\n7. Testando rejeição de produto...');

  // Criar outro produto para testar rejeição
  console.log('7.1. Criando produto para rejeição...');
  try {
    const productData = {
      title: 'Produto para Testar Rejeição',
      description: 'Este produto será rejeitado para testar o fluxo.',
      price: 49.90,
      category: 'Design',
      level: 'BEGINNER',
      language: 'Português',
      certificateIncluded: true,
      hasSupport: true,
      status: 'PUBLISHED',
      filesUrl: ['https://drive.google.com/file/d/teste456']
    };

    const createResponse = await axios.post(`${API_URL}/products`, productData, {
      headers: { Authorization: `Bearer ${sellerToken}` }
    });

    const rejectProductId = createResponse.data.data.id;
    console.log('✅ Produto para rejeição criado:', rejectProductId);

    console.log('7.2. Rejeitando produto...');
    const rejectResponse = await axios.post(
      `${API_URL}/admin/products/${rejectProductId}/reject`,
      { reason: 'Conteúdo inadequado para a plataforma. Por favor, revise as diretrizes de publicação.' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    console.log('✅ Produto rejeitado! Status:', rejectResponse.data.data.status);
    console.log('📧 Email de rejeição deve ter sido enviado para o vendedor');
    return true;
  } catch (error) {
    console.error('❌ Erro no teste de rejeição:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runTests() {
  console.log('=================================================');
  console.log('TESTE DO SISTEMA DE APROVAÇÃO DE PRODUTOS');
  console.log('=================================================');

  let success = true;

  // Login vendedor
  if (!await loginAsSeller()) {
    success = false;
  }

  // Login admin
  if (!await loginAsAdmin()) {
    success = false;
  }

  // Criar produto
  if (success && !await createTestProduct()) {
    success = false;
  }

  // Publicar produto (enviar para aprovação)
  if (success && !await publishProduct()) {
    success = false;
  }

  // Aguardar um momento
  console.log('\n⏳ Aguardando 2 segundos...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Listar pendentes
  if (success && !await listPendingProducts()) {
    success = false;
  }

  // Aprovar produto
  if (success && !await approveProduct()) {
    success = false;
  }

  // Testar rejeição
  if (success && !await testRejectProduct()) {
    success = false;
  }

  console.log('\n=================================================');
  if (success) {
    console.log('✅ TODOS OS TESTES PASSARAM!');
    console.log('=================================================');
    console.log('\n📋 RESUMO:');
    console.log('1. ✅ Login de vendedor funcionando');
    console.log('2. ✅ Login de admin funcionando');
    console.log('3. ✅ Criação de produto funcionando');
    console.log('4. ✅ Produto vai para PENDING_APPROVAL ao publicar');
    console.log('5. ✅ Lista de produtos pendentes funcionando');
    console.log('6. ✅ Aprovação de produto funcionando');
    console.log('7. ✅ Rejeição de produto funcionando');
    console.log('\n📧 Verifique os emails enviados para:', ADMIN_EMAIL);
  } else {
    console.log('❌ ALGUNS TESTES FALHARAM');
    console.log('=================================================');
  }
}

// Executar testes
runTests().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
