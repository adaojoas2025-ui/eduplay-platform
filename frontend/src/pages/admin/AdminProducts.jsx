import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING_APPROVAL');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectPassword, setRejectPassword] = useState('');
  const [showRejectPassword, setShowRejectPassword] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let endpoint = '/products';

      if (filter === 'PENDING_APPROVAL') {
        endpoint = '/admin/products/pending';
      } else if (filter !== 'ALL') {
        endpoint = `/products?status=${filter}`;
      }

      const response = await api.get(endpoint);
      const productsData = response.data.data?.items || response.data.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Erro ao carregar produtos: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId) => {
    if (!confirm('Tem certeza que deseja aprovar este produto?')) {
      return;
    }

    try {
      setLoading(true);
      await api.post(`/admin/products/${productId}/approve`);
      alert('✅ Produto aprovado com sucesso! A lista será atualizada.');
      await fetchProducts();
    } catch (error) {
      console.error('Error approving product:', error);
      alert('Erro ao aprovar produto: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const handleReject = async (productId) => {
    if (!rejectReason.trim()) {
      alert('❌ Por favor, informe o motivo da rejeição.');
      return;
    }

    if (!rejectPassword.trim()) {
      alert('❌ Por favor, digite sua senha de administrador para confirmar a rejeição.');
      return;
    }

    try {
      // Valida a senha usando o novo endpoint
      const validateResponse = await api.post('/auth/validate-password', {
        password: rejectPassword
      });

      if (!validateResponse.data.data.valid) {
        alert('❌ Senha incorreta! A rejeição foi cancelada.');
        return;
      }

      // Se a senha estiver correta, rejeita o produto
      await api.post(`/admin/products/${productId}/reject`, { reason: rejectReason });
      alert('✅ Produto rejeitado com sucesso!');
      setRejectingId(null);
      setRejectReason('');
      setRejectPassword('');
      setShowRejectPassword(false);
      fetchProducts();
    } catch (error) {
      console.error('Error rejecting product:', error);
      if (error.response?.status === 401) {
        alert('❌ Senha incorreta! A rejeição foi cancelada.');
      } else {
        alert('❌ Erro ao rejeitar produto: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleDelete = async (productId) => {
    if (!deletePassword.trim()) {
      alert('❌ Por favor, digite sua senha de administrador para confirmar a exclusão.');
      return;
    }

    try {
      // Valida a senha usando o novo endpoint
      const validateResponse = await api.post('/auth/validate-password', {
        password: deletePassword
      });

      if (!validateResponse.data.data.valid) {
        alert('❌ Senha incorreta! A exclusão foi cancelada.');
        return;
      }

      // Se a senha estiver correta, deleta o produto
      await api.delete(`/admin/products/${productId}`);
      alert('✅ Produto deletado com sucesso!');
      setDeletingId(null);
      setDeletePassword('');
      setShowPassword(false);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      if (error.response?.status === 401) {
        alert('❌ Senha incorreta! A exclusão foi cancelada.');
      } else if (error.response?.status === 500 && error.response?.data?.message?.includes('foreign key')) {
        alert('❌ Este produto não pode ser deletado porque existem pedidos associados a ele.\n\nEm vez de deletar, você pode REJEITAR o produto para tirá-lo do ar.');
      } else {
        alert('❌ Erro ao deletar produto: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { label: 'Rascunho', color: 'bg-gray-500' },
      PENDING_APPROVAL: { label: 'Aguardando Aprovação', color: 'bg-yellow-500' },
      PUBLISHED: { label: 'Publicado', color: 'bg-green-500' },
      REJECTED: { label: 'Rejeitado', color: 'bg-red-500' },
      ARCHIVED: { label: 'Arquivado', color: 'bg-gray-400' },
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-500' };

    return (
      <span className={`${config.color} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Gerenciar Produtos</h1>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Voltar ao Dashboard
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Filtros</h2>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setFilter('PENDING_APPROVAL')}
              className={`px-4 py-2 rounded-lg font-semibold ${
                filter === 'PENDING_APPROVAL'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Aguardando Aprovação
            </button>
            <button
              onClick={() => setFilter('PUBLISHED')}
              className={`px-4 py-2 rounded-lg font-semibold ${
                filter === 'PUBLISHED'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Publicados
            </button>
            <button
              onClick={() => setFilter('REJECTED')}
              className={`px-4 py-2 rounded-lg font-semibold ${
                filter === 'REJECTED'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Rejeitados
            </button>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg font-semibold ${
                filter === 'ALL'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
          </div>
        </div>

        {/* Lista de produtos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">Nenhum produto encontrado neste filtro.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{product.title}</h3>
                      {getStatusBadge(product.status)}
                    </div>
                    <p className="text-gray-600 mb-2">{product.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Vendedor:</span>
                        <p className="font-semibold">{product.producer?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <p className="font-semibold">{product.producer?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Preço:</span>
                        <p className="font-semibold text-green-600">R$ {product.price?.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Data de Criação:</span>
                        <p className="font-semibold">
                          {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    {product.filesUrl && product.filesUrl.length > 0 && (
                      <div className="mt-3">
                        <span className="text-gray-500 text-sm">Arquivos:</span>
                        <p className="text-sm font-semibold">{product.filesUrl.length} arquivo(s)</p>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col gap-2 ml-4">
                    {product.status === 'PENDING_APPROVAL' && (
                      <button
                        onClick={() => handleApprove(product.id)}
                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 font-semibold whitespace-nowrap"
                      >
                        Aprovar
                      </button>
                    )}
                    {(product.status === 'PENDING_APPROVAL' || product.status === 'PUBLISHED') && (
                      <button
                        onClick={() => setRejectingId(product.id)}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 font-semibold whitespace-nowrap"
                      >
                        Rejeitar
                      </button>
                    )}
                    <button
                      onClick={() => setDeletingId(product.id)}
                      className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-black font-semibold whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      🗑️ Deletar
                    </button>
                  </div>
                </div>

                {/* Modal de rejeição */}
                {rejectingId === product.id && (
                  <div className="mt-4 p-6 bg-red-50 border-2 border-red-500 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-3xl">⚠️</span>
                      <h4 className="font-bold text-lg text-red-800">CONFIRMAÇÃO DE REJEIÇÃO</h4>
                    </div>
                    <p className="text-red-700 mb-4 font-semibold">
                      Esta ação irá remover o produto do marketplace!
                    </p>
                    <p className="text-gray-800 mb-4">
                      Produto: <strong>"{product.title}"</strong>
                    </p>
                    <h4 className="font-bold mb-2">Motivo da Rejeição:</h4>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Informe o motivo da rejeição para o vendedor..."
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none mb-4"
                      rows="3"
                    />
                    <h4 className="font-bold mb-2">Confirme sua senha de administrador:</h4>
                    <div className="relative mb-4">
                      <input
                        type={showRejectPassword ? "text" : "password"}
                        value={rejectPassword}
                        onChange={(e) => setRejectPassword(e.target.value)}
                        placeholder="Digite sua senha de administrador"
                        className="w-full p-3 pr-12 border-2 border-red-300 rounded-lg focus:border-red-600 focus:outline-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleReject(product.id);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRejectPassword(!showRejectPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                      >
                        {showRejectPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(product.id)}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold"
                      >
                        ⚠️ Confirmar Rejeição
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason('');
                          setRejectPassword('');
                          setShowRejectPassword(false);
                        }}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 font-semibold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Modal de confirmação de exclusão com senha */}
                {deletingId === product.id && (
                  <div className="mt-4 p-6 bg-red-50 border-2 border-red-500 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-3xl">⚠️</span>
                      <h4 className="font-bold text-lg text-red-800">CONFIRMAÇÃO DE EXCLUSÃO</h4>
                    </div>
                    <p className="text-red-700 mb-4 font-semibold">
                      Esta ação é PERMANENTE e NÃO pode ser desfeita!
                    </p>
                    <p className="text-gray-800 mb-4">
                      Para confirmar a exclusão do produto <strong>"{product.title}"</strong>, digite sua senha de administrador:
                    </p>
                    <div className="relative mb-4">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Digite sua senha de administrador"
                        className="w-full p-3 pr-12 border-2 border-red-300 rounded-lg focus:border-red-600 focus:outline-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleDelete(product.id);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold"
                      >
                        🗑️ Confirmar Exclusão
                      </button>
                      <button
                        onClick={() => {
                          setDeletingId(null);
                          setDeletePassword('');
                          setShowPassword(false);
                        }}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 font-semibold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
