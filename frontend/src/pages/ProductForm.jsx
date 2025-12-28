import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Programação',
    customCategory: '',
    thumbnailUrl: '',
    level: 'Todos os níveis',
    language: 'Português',
    certificateIncluded: false,
    hasSupport: false,
    filesUrl: [''],
    videoUrl: '',
    status: 'DRAFT',
  });

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const product = response.data;

      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || 'Programação',
        customCategory: product.customCategory || '',
        thumbnailUrl: product.thumbnailUrl || '',
        level: product.level || 'Todos os níveis',
        language: product.language || 'Português',
        certificateIncluded: product.certificateIncluded || false,
        hasSupport: product.hasSupport || false,
        filesUrl: product.filesUrl && product.filesUrl.length > 0 ? product.filesUrl : [''],
        videoUrl: product.videoUrl || '',
        status: product.status || 'DRAFT',
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
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    try {
      setUploadingThumbnail(true);
      const result = await uploadToCloudinary(file, 'image');
      setFormData({ ...formData, thumbnailUrl: result.url });
      alert('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      alert('Erro ao enviar imagem. Tente novamente.');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const token = localStorage.getItem('token');

      // Clean up filesUrl - remove empty strings
      const cleanFilesUrl = formData.filesUrl.filter(url => url.trim() !== '');

      const productData = {
        ...formData,
        filesUrl: cleanFilesUrl.length > 0 ? cleanFilesUrl : [],
        price: parseFloat(formData.price),
      };

      // If category is custom, use customCategory
      if (productData.category === 'Outra' && productData.customCategory) {
        productData.category = productData.customCategory;
      }

      delete productData.customCategory;

      if (isEdit) {
        await axios.put(`${API_URL}/products/${id}`, productData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/products`, productData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Show message if product was submitted for approval
      if (formData.status === 'PUBLISHED') {
        alert('Produto enviado para aprovação do administrador. Você receberá um email quando for aprovado.');
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb e Título */}
        <div className="mb-6">
          <nav className="text-sm text-gray-500 mb-3">
            <span className="hover:text-blue-600 cursor-pointer">Meus Produtos</span>
            <span className="mx-2">/</span>
            <span className="hover:text-blue-600 cursor-pointer">Novo Produto</span>
            <span className="mx-2">/</span>
            <span className="text-gray-700">Mercadologia</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">
            Novo Produto Digital
          </h1>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded shadow-sm">
            {/* Dados do produto */}
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Dados do produto</h2>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Título do produto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Título do produto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength="100"
                  placeholder="Digite o nome do seu produto"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Descrição do produto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Descrição do produto <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="8"
                    maxLength="5000"
                    placeholder="Escreva uma descrição detalhada do produto. Informe o que o usuário irá aprender, os benefícios, os pré-requisitos e tudo que for relevante."
                    className="w-full px-3 py-2 text-sm border-0 rounded focus:outline-none focus:ring-0 resize-none"
                  />
                  <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 text-xs text-gray-500">
                    Caracteres disponíveis: {5000 - formData.description.length}
                  </div>
                </div>
              </div>

              {/* URL da Imagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Imagem de Capa <span className="text-red-500">*</span>
                </label>

                {/* Upload Button */}
                <div className="mb-3">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {uploadingThumbnail ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Fazer Upload da Imagem
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      disabled={uploadingThumbnail}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Ou cole um link abaixo (Google Drive, Imgur, Cloudinary, etc.)
                  </p>
                </div>

                {/* URL Input */}
                <input
                  type="text"
                  name="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={handleChange}
                  required
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Recomendado: 1280x720px (16:9) em formato JPG ou PNG
                </p>

                {/* Preview */}
                {formData.thumbnailUrl && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Preview:</p>
                    <img
                      src={formData.thumbnailUrl}
                      alt="Preview"
                      className="w-full max-w-md h-48 object-cover rounded border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Categorias */}
            <div className="border-t border-gray-200 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Categorias</h2>
            </div>

            <div className="px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Categoria <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 mt-2"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nível de dificuldade
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                    <option value="Todos os níveis">Todos os níveis</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Precificação do produto */}
            <div className="border-t border-gray-200 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Precificação do produto</h2>
            </div>

            <div className="px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Preço <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-sm text-gray-500">R$</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Idioma
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Português">Português</option>
                    <option value="Inglês">Inglês</option>
                    <option value="Espanhol">Espanhol</option>
                  </select>
                </div>
              </div>

              {/* Recursos incluídos */}
              <div className="mt-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recursos incluídos
                </label>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="certificateIncluded"
                      checked={formData.certificateIncluded}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Certificado de conclusão</span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasSupport"
                      checked={formData.hasSupport}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Suporte ao aluno</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Conteúdo do produto */}
            <div className="border-t border-gray-200 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Conteúdo do produto</h2>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Links de arquivos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Links dos arquivos para download
                </label>
                <div className="space-y-2">
                  {formData.filesUrl.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => {
                          const newFilesUrl = [...formData.filesUrl];
                          newFilesUrl[index] = e.target.value;
                          setFormData({ ...formData, filesUrl: newFilesUrl });
                        }}
                        placeholder="https://drive.google.com/... ou link direto do arquivo"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newFilesUrl = formData.filesUrl.filter((_, i) => i !== index);
                          setFormData({ ...formData, filesUrl: newFilesUrl });
                        }}
                        className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, filesUrl: [...formData.filesUrl, ''] });
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Adicionar novo link
                </button>

                <p className="mt-2 text-xs text-gray-500">
                  Você pode usar Google Drive, Dropbox ou qualquer serviço de hospedagem
                </p>
              </div>

              {/* Link do vídeo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Link do vídeo/curso (opcional)
                </label>
                <input
                  type="text"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/... ou link da plataforma de vídeo"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Página de agradecimento */}
            <div className="border-t border-gray-200 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Página de agradecimento</h2>
            </div>

            <div className="px-6 py-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status do produto
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="DRAFT">Salvar como Rascunho</option>
                  <option value="PUBLISHED">Enviar para Aprovação</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Ao enviar para aprovação, seu produto será analisado pelo administrador antes de ser publicado
                </p>
              </div>

              {/* Info box */}
              <div className="mt-5 bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-sm text-blue-800">
                  Envie seus arquivos para a plataforma somente após seu produto ser aprovado pela administração. Certifique-se que todos os links estão funcionando corretamente antes de enviar para aprovação.
                </p>
              </div>
            </div>

            {/* Footer com botões */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/seller/products')}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Salvando...' : isEdit ? 'Atualizar produto' : 'Salvar produto'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
