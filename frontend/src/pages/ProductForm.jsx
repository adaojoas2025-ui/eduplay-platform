import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api.config';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Programação',
    customCategory: '',
    level: 'Iniciante',
    language: 'Português',
    certificateIncluded: true,
    hasSupport: true,
    status: 'DRAFT',
    filesUrl: [],
    videoUrl: ''
  });

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/products/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const product = response.data.data;

      // Check if category is a predefined one
      const predefinedCategories = [
        'Programação', 'Design', 'Marketing', 'Idiomas',
        'Produtividade', 'Gestão', 'Finanças',
        'Desenvolvimento Pessoal', 'Material Pedagógico'
      ];

      const isCustomCategory = !predefinedCategories.includes(product.category);

      // Map backend level to Portuguese
      const levelMapReverse = {
        'BEGINNER': 'Iniciante',
        'INTERMEDIATE': 'Intermediário',
        'ADVANCED': 'Avançado'
      };

      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price || '',
        category: isCustomCategory ? 'Outra' : (product.category || 'Programação'),
        customCategory: isCustomCategory ? product.category : '',
        level: levelMapReverse[product.level] || 'Iniciante',
        language: product.language || 'Português',
        certificateIncluded: product.certificateIncluded ?? true,
        hasSupport: product.hasSupport ?? true,
        status: product.status || 'DRAFT',
        filesUrl: product.filesUrl || [],
        videoUrl: product.videoUrl || ''
      });
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Erro ao carregar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If changing category and it's not "Outra", clear customCategory
    if (name === 'category' && value !== 'Outra') {
      setFormData(prev => ({
        ...prev,
        category: value,
        customCategory: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const token = localStorage.getItem('token');

      // Mapeamento de nível de PT para EN
      const levelMap = {
        'Iniciante': 'BEGINNER',
        'Intermediário': 'INTERMEDIATE',
        'Avançado': 'ADVANCED',
        'Todos os níveis': 'BEGINNER'
      };

      // Filter out empty strings from filesUrl
      const validFilesUrl = formData.filesUrl.filter(url => url.trim() !== '');

      // VALIDAÇÃO: Se o produto está sendo PUBLICADO, precisa ter pelo menos 1 arquivo
      if (formData.status === 'PUBLISHED' && validFilesUrl.length === 0) {
        setError('⚠️ Para publicar o produto, você precisa adicionar pelo menos 1 arquivo para os compradores baixarem! Use o botão "+ Adicionar Link de Arquivo" abaixo.');
        setSaving(false);
        // Scroll to the files section
        document.querySelector('[name="filesUrl"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        level: levelMap[formData.level] || 'BEGINNER',
        category: formData.category === 'Outra' ? formData.customCategory : formData.category,
        filesUrl: validFilesUrl,
        // Remove videoUrl if empty
        videoUrl: formData.videoUrl.trim() || undefined
      };

      // Remove customCategory from the data sent to backend
      delete productData.customCategory;

      if (isEdit) {
        await axios.put(
          `${API_URL}/products/${id}`,
          productData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        await axios.post(
          `${API_URL}/products`,
          productData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      // Show message if product was submitted for approval
      if (formData.status === 'PUBLISHED') {
        alert('✅ Produto enviado para aprovação do administrador. Você receberá um email quando for aprovado.');
      }

      navigate('/seller/products');
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {isEdit ? 'Editar Produto' : 'Novo Produto'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Atualize as informações do seu produto' : 'Crie um novo curso ou infoproduto'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Título do Produto *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Ex: Curso Completo de Python"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Descreva o que os alunos vão aprender..."
            />
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preço (R$) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="197.00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="Programação">Programação</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Idiomas">Idiomas</option>
                <option value="Produtividade">Produtividade</option>
                <option value="Gestão">Gestão</option>
                <option value="Finanças">Finanças</option>
                <option value="Desenvolvimento Pessoal">Desenvolvimento Pessoal</option>
                <option value="Material Pedagógico">Material Pedagógico</option>
                <option value="Outra">Outra (Especificar abaixo)</option>
              </select>

              {formData.category === 'Outra' && (
                <input
                  type="text"
                  name="customCategory"
                  value={formData.customCategory || ''}
                  onChange={handleChange}
                  placeholder="Digite a categoria personalizada"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent mt-3"
                />
              )}
            </div>
          </div>

          {/* Level and Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nível
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
                <option value="Todos os níveis">Todos os níveis</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Idioma
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="Português">Português</option>
                <option value="Inglês">Inglês</option>
                <option value="Espanhol">Espanhol</option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="mb-6 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="certificateIncluded"
                checked={formData.certificateIncluded}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
              />
              <span className="ml-3 text-gray-700">Inclui certificado de conclusão</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="hasSupport"
                checked={formData.hasSupport}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
              />
              <span className="ml-3 text-gray-700">Oferece suporte ao aluno</span>
            </label>
          </div>

          {/* Product Files Section */}
          <div className="mb-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📦 Arquivos do Produto
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Adicione os links dos arquivos que o comprador receberá após a compra (PDFs, vídeos, materiais complementares)
            </p>

            {/* File URLs */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Links de Download dos Arquivos
              </label>

              {formData.filesUrl.map((url, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                      const newFilesUrl = [...formData.filesUrl];
                      newFilesUrl[index] = e.target.value;
                      setFormData({ ...formData, filesUrl: newFilesUrl });
                    }}
                    placeholder="https://drive.google.com/... ou link direto do arquivo"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newFilesUrl = formData.filesUrl.filter((_, i) => i !== index);
                      setFormData({ ...formData, filesUrl: newFilesUrl });
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, filesUrl: [...formData.filesUrl, ''] });
                }}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
              >
                + Adicionar Link de Arquivo
              </button>

              <p className="text-xs text-gray-500 mt-2">
                💡 Você pode usar Google Drive, Dropbox, ou qualquer serviço de hospedagem de arquivos
              </p>
            </div>

            {/* Video URL */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Link do Vídeo/Curso (opcional)
              </label>
              <input
                type="text"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/... ou link da plataforma de vídeo"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                📹 Link do YouTube, Vimeo, Hotmart, ou plataforma de hospedagem de vídeos
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="DRAFT">Rascunho</option>
              <option value="PUBLISHED">Enviar para Aprovação</option>
            </select>
            <p className="text-sm text-gray-500 mt-2">
              Ao publicar, o produto será enviado para aprovação do administrador
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : isEdit ? 'Atualizar Produto' : 'Criar Produto'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="px-8 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Dica</h3>
          <p className="text-sm text-blue-800">
            Os arquivos e vídeos adicionados estarão disponíveis para download/acesso pelos compradores
            assim que o pagamento for aprovado. Certifique-se de que os links estão públicos e acessíveis.
          </p>
        </div>
      </div>
    </div>
  );
}
