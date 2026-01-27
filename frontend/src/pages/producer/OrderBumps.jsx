import { useEffect, useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiTrendingUp, FiEye, FiMousePointer } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function OrderBumps() {
  const [bumps, setBumps] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBump, setEditingBump] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    title: '',
    description: '',
    discountPercent: 0,
    triggerType: 'ANY',
    triggerValues: [],
    priority: 0,
    isActive: true
  });

  useEffect(() => {
    fetchBumps();
    fetchProducts();
  }, []);

  async function fetchBumps() {
    try {
      const response = await api.get('/order-bumps/producer/my-bumps');
      setBumps(response.data.data || []);
    } catch (error) {
      console.error('Error fetching order bumps:', error);
      toast.error('Erro ao carregar order bumps');
    } finally {
      setLoading(false);
    }
  }

  async function fetchProducts() {
    try {
      const response = await api.get('/seller/products');
      setProducts(response.data.data?.items || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  function resetForm() {
    setFormData({
      productId: '',
      title: '',
      description: '',
      discountPercent: 0,
      triggerType: 'ANY',
      triggerValues: [],
      priority: 0,
      isActive: true
    });
    setEditingBump(null);
  }

  function handleEdit(bump) {
    setEditingBump(bump);
    setFormData({
      productId: bump.productId,
      title: bump.title,
      description: bump.description,
      discountPercent: bump.discountPercent || 0,
      triggerType: bump.triggerType,
      triggerValues: bump.triggerValues || [],
      priority: bump.priority || 0,
      isActive: bump.isActive
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.productId) {
      toast.error('Selecione um produto');
      return;
    }
    if (!formData.title) {
      toast.error('Digite um titulo');
      return;
    }
    if (!formData.description) {
      toast.error('Digite uma descricao');
      return;
    }

    try {
      if (editingBump) {
        await api.put(`/order-bumps/${editingBump.id}`, formData);
        toast.success('Order Bump atualizado!');
      } else {
        await api.post('/order-bumps', formData);
        toast.success('Order Bump criado!');
      }

      fetchBumps();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving order bump:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar order bump');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja deletar este order bump?')) return;

    try {
      await api.delete(`/order-bumps/${id}`);
      toast.success('Order Bump deletado!');
      setBumps(bumps.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting order bump:', error);
      toast.error('Erro ao deletar order bump');
    }
  }

  async function handleToggleActive(bump) {
    try {
      await api.put(`/order-bumps/${bump.id}`, { isActive: !bump.isActive });
      toast.success(bump.isActive ? 'Order Bump desativado' : 'Order Bump ativado');
      fetchBumps();
    } catch (error) {
      console.error('Error toggling order bump:', error);
      toast.error('Erro ao alterar status');
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Order Bumps</h1>
          <p className="text-gray-600 mt-1">
            Aumente suas vendas oferecendo produtos complementares no checkout
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="h-5 w-5 mr-2" />
          Novo Order Bump
        </button>
      </div>

      {/* Stats Cards */}
      {bumps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <FiEye className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Impressoes</p>
                <p className="text-2xl font-bold">
                  {bumps.reduce((sum, b) => sum + (b.impressions || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FiMousePointer className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cliques</p>
                <p className="text-2xl font-bold">
                  {bumps.reduce((sum, b) => sum + (b.clicks || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <FiTrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Conversoes</p>
                <p className="text-2xl font-bold">
                  {bumps.reduce((sum, b) => sum + (b.conversions || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <FiTrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Taxa de Conversao</p>
                <p className="text-2xl font-bold">
                  {(() => {
                    const totalImpressions = bumps.reduce((sum, b) => sum + (b.impressions || 0), 0);
                    const totalConversions = bumps.reduce((sum, b) => sum + (b.conversions || 0), 0);
                    return totalImpressions > 0
                      ? ((totalConversions / totalImpressions) * 100).toFixed(1)
                      : 0;
                  })()}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {bumps.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {bumps.map((bump) => (
            <div key={bump.id} className="card">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {bump.product?.thumbnailUrl && (
                    <img
                      src={bump.product.thumbnailUrl}
                      alt={bump.product.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{bump.title}</h3>
                    <p className="text-gray-600 mb-2 line-clamp-2">{bump.description}</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {bump.product?.title}
                      </span>
                      {bump.discountPercent > 0 && (
                        <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                          {bump.discountPercent}% desconto
                        </span>
                      )}
                      <span className={`text-sm px-2 py-1 rounded ${
                        bump.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {bump.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(bump.product?.price || 0)}
                      </span>
                    </div>

                    {/* Analytics */}
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FiEye className="h-4 w-4" />
                        <span>{bump.impressions || 0} impressoes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiMousePointer className="h-4 w-4" />
                        <span>{bump.clicks || 0} cliques</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiTrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-semibold">
                          {bump.conversions || 0} conversoes
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-semibold">
                          {(bump.impressions || 0) > 0
                            ? (((bump.conversions || 0) / bump.impressions) * 100).toFixed(1)
                            : 0}% taxa
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(bump)}
                    className={`btn ${bump.isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                  >
                    {bump.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => handleEdit(bump)}
                    className="btn btn-outline flex items-center"
                  >
                    <FiEdit className="h-4 w-4 mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(bump.id)}
                    className="btn bg-red-600 text-white hover:bg-red-700 flex items-center"
                  >
                    <FiTrash2 className="h-4 w-4 mr-1" />
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-xl font-semibold mb-2">Nenhum Order Bump criado</h3>
          <p className="text-gray-600 mb-6">
            Order Bumps aparecem no checkout e podem aumentar suas vendas em ate 50%!
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn btn-primary inline-flex items-center"
          >
            <FiPlus className="h-5 w-5 mr-2" />
            Criar Primeiro Order Bump
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingBump ? 'Editar Order Bump' : 'Novo Order Bump'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Produto a oferecer *
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Selecione um produto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.title} - {formatPrice(product.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titulo da oferta *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Adicione este curso agora!"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descricao persuasiva *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Aprenda ainda mais com este conteudo complementar..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Desconto (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe 0 para nao aplicar desconto
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maior prioridade aparece primeiro
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Ativo (visivel no checkout)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 btn btn-outline"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 btn btn-primary">
                    {editingBump ? 'Salvar Alteracoes' : 'Criar Order Bump'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
