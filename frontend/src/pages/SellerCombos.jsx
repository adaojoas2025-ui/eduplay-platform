import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiPackage, FiTag } from 'react-icons/fi';
import api from '../services/api';

export default function SellerCombos() {
  const [combos, setCombos] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountPrice: '',
    selectedProducts: []
  });

  useEffect(() => {
    fetchCombos();
    fetchMyProducts();
  }, []);

  const fetchCombos = async () => {
    try {
      const response = await api.get('/combos/producer/my-combos');
      setCombos(response.data.data || []);
    } catch (error) {
      console.error('Error fetching combos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProducts = async () => {
    try {
      // Fetch only the logged-in producer's products
      const response = await api.get('/seller/products');

      console.log('Response from /seller/products:', response.data);

      // The response structure is: { success: true, data: { items: [...], total: ... } }
      let productsData = [];
      if (response.data.data && response.data.data.items) {
        productsData = response.data.data.items;
      } else if (Array.isArray(response.data.data)) {
        productsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        productsData = response.data;
      }

      console.log('Products data:', productsData);

      // Filter only published products
      const publishedProducts = productsData.filter(p => p && p.status === 'PUBLISHED');
      console.log('Published products:', publishedProducts);

      setProducts(publishedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const handleOpenModal = (combo = null) => {
    if (combo) {
      setEditingCombo(combo);
      setFormData({
        title: combo.title,
        description: combo.description,
        discountPrice: combo.discountPrice,
        selectedProducts: combo.products.map(p => p.productId)
      });
    } else {
      setEditingCombo(null);
      setFormData({
        title: '',
        description: '',
        discountPrice: '',
        selectedProducts: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCombo(null);
    setFormData({
      title: '',
      description: '',
      discountPrice: '',
      selectedProducts: []
    });
  };

  const handleProductToggle = (productId) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter(id => id !== productId)
        : [...prev.selectedProducts, productId]
    }));
  };

  const calculateTotalPrice = () => {
    return formData.selectedProducts.reduce((total, productId) => {
      const product = products.find(p => p.id === productId);
      return total + (product?.price || 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.selectedProducts.length < 2) {
      alert('Selecione pelo menos 2 produtos para criar um combo');
      return;
    }

    const totalPrice = calculateTotalPrice();
    if (parseFloat(formData.discountPrice) >= totalPrice) {
      alert('O preço do combo deve ser menor que a soma dos produtos individuais');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        discountPrice: parseFloat(formData.discountPrice),
        productIds: formData.selectedProducts
      };

      if (editingCombo) {
        await api.put(`/combos/${editingCombo.id}`, payload);
        alert('Combo atualizado com sucesso!');
      } else {
        await api.post('/combos', payload);
        alert('Combo criado com sucesso!');
      }

      handleCloseModal();
      fetchCombos();
    } catch (error) {
      console.error('Error saving combo:', error);
      alert(error.response?.data?.message || 'Erro ao salvar combo');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este combo?')) return;

    try {
      await api.delete(`/combos/${id}`);
      alert('Combo deletado com sucesso!');
      fetchCombos();
    } catch (error) {
      console.error('Error deleting combo:', error);
      alert('Erro ao deletar combo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Combos</h1>
          <p className="text-gray-600 mt-1">Crie combos de produtos com descontos especiais para aumentar suas vendas</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
        >
          <FiPlus size={20} />
          Novo Combo
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex items-start">
          <FiPackage className="text-blue-500 mt-0.5 mr-3" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900">Como funcionam os combos?</h3>
            <p className="text-blue-700 text-sm mt-1">
              Combos incentivam clientes a comprar mais produtos por um preço menor. Quando um cliente adiciona os produtos do seu combo no carrinho, ele verá automaticamente a oferta especial!
            </p>
          </div>
        </div>
      </div>

      {/* Combos Grid */}
      {combos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FiPackage size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">Você ainda não criou nenhum combo</p>
          <p className="text-gray-400 text-sm mt-2">Combos ajudam a aumentar suas vendas oferecendo descontos para compras em conjunto</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 text-purple-600 hover:underline font-semibold"
          >
            Criar primeiro combo
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {combos.map((combo) => (
            <div key={combo.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{combo.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{combo.description}</p>
                  </div>
                  <FiPackage size={24} className="text-purple-600" />
                </div>

                {/* Products */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    {combo.productDetails?.length || 0} Produtos:
                  </p>
                  <div className="space-y-1">
                    {combo.productDetails?.map((product) => (
                      <div key={product.id} className="text-sm text-gray-600 flex justify-between">
                        <span className="truncate">{product.title}</span>
                        <span className="font-semibold ml-2">R$ {product.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Preço individual:</span>
                    <span className="line-through">R$ {combo.totalRegularPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Preço do combo:</span>
                    <span className="text-2xl font-bold text-purple-600">
                      R$ {combo.discountPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <FiTag className="text-green-600" />
                    <span className="text-green-600 font-semibold">
                      {combo.discountPercentage}% OFF
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleOpenModal(combo)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    <FiEdit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(combo.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    <FiTrash2 size={16} />
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingCombo ? 'Editar Combo' : 'Novo Combo'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Título do Combo *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                    placeholder="Ex: Kit Educação Infantil Completo"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    rows="3"
                    required
                    placeholder="Descreva o combo e seus benefícios"
                  />
                </div>

                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Selecionar Produtos * (mínimo 2)
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                    {products.length === 0 ? (
                      <p className="text-gray-500 text-center">
                        Você precisa ter produtos cadastrados para criar combos
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {products.map((product) => (
                          <label
                            key={product.id}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.selectedProducts.includes(product.id)}
                              onChange={() => handleProductToggle(product.id)}
                              className="w-5 h-5 text-purple-600"
                            />
                            <div className="flex-1 flex justify-between items-center">
                              <span className="text-sm">{product.title}</span>
                              <span className="text-sm font-semibold text-gray-700">
                                R$ {product.price.toFixed(2)}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.selectedProducts.length} produto(s) selecionado(s)
                  </p>
                </div>

                {/* Price Summary */}
                {formData.selectedProducts.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Preço total individual:</span>
                      <span className="font-semibold">R$ {calculateTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Preço do Combo * (com desconto)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={formData.discountPrice}
                          onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          required
                          placeholder="25.00"
                        />
                      </div>
                      {formData.discountPrice && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Economia:</p>
                          <p className="text-lg font-bold text-green-600">
                            R$ {(calculateTotalPrice() - parseFloat(formData.discountPrice || 0)).toFixed(2)}
                          </p>
                          <p className="text-sm text-green-600">
                            {((calculateTotalPrice() - parseFloat(formData.discountPrice || 0)) / calculateTotalPrice() * 100).toFixed(0)}% OFF
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    {editingCombo ? 'Atualizar' : 'Criar'} Combo
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
