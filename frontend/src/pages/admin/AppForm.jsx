import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api.config';
import { uploadToCloudinary } from '../../utils/uploadToCloudinary';

const CATEGORIES = [
  'Jogos',
  'Educação',
  'Ferramentas',
  'Entretenimento',
  'Produtividade',
  'Estilo de vida',
  'Saúde e fitness',
  'Redes sociais',
  'Música',
  'Fotografia',
];

const AGE_RATINGS = ['Livre', '10+', '12+', '14+', '16+', '18+'];

export default function AppForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    developer: '',
    description: '',
    shortDescription: '',
    iconUrl: '',
    coverImages: [''],
    videoUrl: '',
    category: 'Jogos',
    ageRating: 'Livre',
    fileSize: '',
    version: '1.0.0',
    freeWithAdsUrl: '',
    freeWithAdsActive: true,
    paidNoAdsUrl: '',
    paidNoAdsPrice: 0,
    paidNoAdsActive: false,
    adsenseEnabled: false,
    adsenseSlot: '',
    whatsNew: '',
    permissions: [''],
    requiresInternet: false,
    inAppPurchases: false,
    tags: [''],
  });

  useEffect(() => {
    if (isEdit) {
      fetchApp();
    }
  }, [id]);

  const fetchApp = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/apps/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const app = response.data.data;

      setFormData({
        ...app,
        coverImages: app.coverImages.length > 0 ? app.coverImages : [''],
        permissions: app.permissions.length > 0 ? app.permissions : [''],
        tags: app.tags.length > 0 ? app.tags : [''],
      });
    } catch (error) {
      console.error('Error fetching app:', error);
      alert('Erro ao carregar app');
      navigate('/admin/apps');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray.length > 0 ? newArray : [''] });
  };

  const handleIconUpload = async (e) => {
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
      setUploadingIcon(true);
      const result = await uploadToCloudinary(file, 'image');
      setFormData({ ...formData, iconUrl: result.url });
      alert('Ícone enviado com sucesso!');
    } catch (error) {
      console.error('Error uploading icon:', error);
      alert('Erro ao enviar ícone. Tente novamente.');
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleScreenshotUpload = async (e, index) => {
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
      setUploadingScreenshot({ ...uploadingScreenshot, [index]: true });
      const result = await uploadToCloudinary(file, 'image');
      handleArrayChange('coverImages', index, result.url);
      alert('Screenshot enviado com sucesso!');
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      alert('Erro ao enviar screenshot. Tente novamente.');
    } finally {
      setUploadingScreenshot({ ...uploadingScreenshot, [index]: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Filter out empty strings from arrays
      const cleanedData = {
        ...formData,
        coverImages: formData.coverImages.filter(img => img.trim() !== ''),
        permissions: formData.permissions.filter(p => p.trim() !== ''),
        tags: formData.tags.filter(t => t.trim() !== ''),
        paidNoAdsPrice: parseFloat(formData.paidNoAdsPrice) || 0,
      };

      if (isEdit) {
        await axios.put(`${API_URL}/apps/${id}`, cleanedData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('App atualizado com sucesso!');
      } else {
        await axios.post(`${API_URL}/apps`, cleanedData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('App criado com sucesso!');
      }

      navigate('/admin/apps');
    } catch (error) {
      console.error('Error saving app:', error);
      alert(error.response?.data?.message || 'Erro ao salvar app');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            {isEdit ? 'Editar App' : 'Publicar Novo App'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Informações Básicas</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do App *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Bullet Army Run"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desenvolvedor *
                  </label>
                  <input
                    type="text"
                    name="developer"
                    value={formData.developer}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Supersonic Studios LTD"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classificação Etária *
                  </label>
                  <select
                    name="ageRating"
                    value={formData.ageRating}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {AGE_RATINGS.map((rating) => (
                      <option key={rating} value={rating}>{rating}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamanho do Arquivo *
                  </label>
                  <input
                    type="text"
                    name="fileSize"
                    value={formData.fileSize}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 121 MB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Versão *
                  </label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 1.0.0"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição Curta
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  maxLength={80}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Breve descrição (max 80 caracteres)"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.shortDescription.length}/80 caracteres</p>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição Completa *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descrição detalhada do app..."
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  O que há de novo nesta versão
                </label>
                <textarea
                  name="whatsNew"
                  value={formData.whatsNew}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Novidades e melhorias..."
                />
              </div>
            </div>

            {/* Imagens e Mídia */}
            <div className="border-b pb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Imagens e Mídia</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-blue-800 mb-1">💡 Como adicionar imagens:</p>
                  <ol className="text-blue-700 text-xs space-y-1 ml-4 list-decimal">
                    <li>Acesse <a href="https://imgur.com" target="_blank" className="underline font-semibold">Imgur.com</a></li>
                    <li>Clique em "New post" e faça upload da imagem</li>
                    <li>Copie o link direto (termina com .png ou .jpg)</li>
                    <li>Cole aqui no campo URL</li>
                  </ol>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ícone do App (quadrado, 512x512px recomendado) *
                </label>

                {/* Upload Button */}
                <div className="mb-3">
                  <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer font-semibold">
                    <span className="text-xl">📤</span>
                    {uploadingIcon ? 'Enviando...' : 'Enviar Imagem do Computador'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      disabled={uploadingIcon}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Ou cole um link abaixo (Google Drive, Imgur, etc.)
                  </p>
                </div>

                {/* URL Input */}
                <input
                  type="text"
                  name="iconUrl"
                  value={formData.iconUrl}
                  onChange={(e) => {
                    let value = e.target.value.trim();

                    // Auto-convert Google Drive links
                    if (value.includes('drive.google.com/file/d/')) {
                      const match = value.match(/\/d\/([a-zA-Z0-9_-]+)/);
                      if (match && match[1]) {
                        value = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                      }
                    }

                    setFormData({ ...formData, iconUrl: value });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ou cole o link da imagem aqui..."
                />

                {/* Preview */}
                {formData.iconUrl && (
                  <div className="mt-3 flex items-start gap-3">
                    <img
                      src={formData.iconUrl}
                      alt="Preview"
                      className="w-32 h-32 rounded-2xl object-cover border-2 border-gray-300 shadow-md"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23EF4444" width="100" height="100" rx="20"/%3E%3Ctext fill="white" font-size="40" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E❌%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-green-800 mb-1">✅ Ícone carregado com sucesso!</p>
                      <p className="text-xs text-green-700 break-all">{formData.iconUrl}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Screenshots (imagens de capa) - Opcional
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  📸 Adicione capturas de tela do seu app (recomendado: 3-5 imagens)
                </p>
                {formData.coverImages.map((img, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Screenshot {index + 1}</span>
                      {formData.coverImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('coverImages', index)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                        >
                          Remover
                        </button>
                      )}
                    </div>

                    {/* Upload Button */}
                    <div className="mb-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer text-sm font-semibold">
                        <span>📤</span>
                        {uploadingScreenshot[index] ? 'Enviando...' : 'Enviar Imagem'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleScreenshotUpload(e, index)}
                          disabled={uploadingScreenshot[index]}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* URL Input */}
                    <input
                      type="text"
                      value={img}
                      onChange={(e) => {
                        let value = e.target.value.trim();

                        // Auto-convert Google Drive links
                        if (value.includes('drive.google.com/file/d/')) {
                          const match = value.match(/\/d\/([a-zA-Z0-9_-]+)/);
                          if (match && match[1]) {
                            value = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                          }
                        }

                        handleArrayChange('coverImages', index, value);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ou cole o link da imagem aqui..."
                    />

                    {/* Preview */}
                    {img && (
                      <div className="mt-3">
                        <img
                          src={img}
                          alt={`Screenshot ${index + 1}`}
                          className="h-48 rounded-lg object-cover border-2 border-gray-300 shadow-md"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300"%3E%3Crect fill="%23EF4444" width="200" height="300" rx="10"/%3E%3Ctext fill="white" font-size="40" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E❌%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('coverImages')}
                  className="mt-2 px-6 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-semibold"
                >
                  + Adicionar Outro Screenshot
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL do Vídeo (opcional)
                </label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>

            {/* Versões e Downloads */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Versões e Downloads</h2>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    name="freeWithAdsActive"
                    checked={formData.freeWithAdsActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label className="font-semibold text-gray-800">Versão Gratuita com Propaganda</label>
                </div>
                <input
                  type="url"
                  name="freeWithAdsUrl"
                  value={formData.freeWithAdsUrl}
                  onChange={handleChange}
                  disabled={!formData.freeWithAdsActive}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="URL do arquivo APK com propaganda"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    name="paidNoAdsActive"
                    checked={formData.paidNoAdsActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label className="font-semibold text-gray-800">Versão Paga sem Propaganda</label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="url"
                    name="paidNoAdsUrl"
                    value={formData.paidNoAdsUrl}
                    onChange={handleChange}
                    disabled={!formData.paidNoAdsActive}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="URL do arquivo APK sem propaganda"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">R$</span>
                    <input
                      type="number"
                      name="paidNoAdsPrice"
                      value={formData.paidNoAdsPrice}
                      onChange={handleChange}
                      disabled={!formData.paidNoAdsActive}
                      step="0.01"
                      min="0"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Google AdSense */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Google AdSense</h2>

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  name="adsenseEnabled"
                  checked={formData.adsenseEnabled}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <label className="text-sm font-medium text-gray-700">
                  Habilitar AdSense na versão gratuita
                </label>
              </div>

              {formData.adsenseEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slot ID do AdSense
                  </label>
                  <input
                    type="text"
                    name="adsenseSlot"
                    value={formData.adsenseSlot}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 1234567890"
                  />
                </div>
              )}
            </div>

            {/* Informações Adicionais */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Informações Adicionais</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags / Palavras-chave
                </label>
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: casual, puzzle, divertido"
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('tags', index)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('tags')}
                  className="mt-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm font-semibold"
                >
                  + Adicionar Tag
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissões Necessárias
                </label>
                {formData.permissions.map((permission, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={permission}
                      onChange={(e) => handleArrayChange('permissions', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Armazenamento, Câmera, Localização"
                    />
                    {formData.permissions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('permissions', index)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('permissions')}
                  className="mt-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm font-semibold"
                >
                  + Adicionar Permissão
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="requiresInternet"
                    checked={formData.requiresInternet}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label className="text-sm text-gray-700">Requer conexão com internet</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="inAppPurchases"
                    checked={formData.inAppPurchases}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label className="text-sm text-gray-700">Contém compras no app</label>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/admin/apps')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : isEdit ? 'Atualizar App' : 'Criar App'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
