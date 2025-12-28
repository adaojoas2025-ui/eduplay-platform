import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api.config';

export default function AppDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState('FREE_WITH_ADS');
  const [showAdSense, setShowAdSense] = useState(false);

  useEffect(() => {
    fetchApp();
  }, [slug]);

  const fetchApp = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/apps/${slug}`);
      setApp(response.data.data);

      // Define versão padrão baseada no que está disponível
      if (response.data.data.freeWithAdsActive) {
        setSelectedVersion('FREE_WITH_ADS');
      } else if (response.data.data.paidNoAdsActive) {
        setSelectedVersion('PAID_NO_ADS');
      }
    } catch (error) {
      console.error('Error fetching app:', error);
      alert('App não encontrado');
      navigate('/apps');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    // Se for versão paga, verificar se usuário está logado e redirecionar para pagamento
    if (selectedVersion === 'PAID_NO_ADS') {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Você precisa estar logado para comprar a versão sem propaganda');
        navigate('/login');
        return;
      }

      // Iniciar processo de compra
      await handlePurchaseApp();
      return;
    }

    // Versão gratuita - mostrar AdSense antes do download
    if (app.adsenseEnabled && selectedVersion === 'FREE_WITH_ADS') {
      setShowAdSense(true);
      // Aguardar 5 segundos antes de permitir download
      setTimeout(() => {
        initiateDownload();
      }, 5000);
    } else {
      initiateDownload();
    }
  };

  const handlePurchaseApp = async () => {
    try {
      const token = localStorage.getItem('token');

      // Criar pedido de compra do app
      const response = await axios.post(
        `${API_URL}/apps/${app.id}/purchase`,
        {
          version: selectedVersion,
          price: app.paidNoAdsPrice
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { initPoint, orderId } = response.data.data;

      // Salvar orderId no localStorage para verificar depois
      localStorage.setItem('appPurchaseOrderId', orderId);
      localStorage.setItem('appPurchaseAppId', app.id);

      // Redirecionar para Mercado Pago
      window.location.href = initPoint;
    } catch (error) {
      console.error('Error purchasing app:', error);
      alert(error.response?.data?.message || 'Erro ao processar compra. Tente novamente.');
    }
  };

  const initiateDownload = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/apps/${app.id}/download?version=${selectedVersion}`
      );

      const downloadUrl = response.data.data.downloadUrl;
      if (downloadUrl) {
        // Abrir URL de download em nova aba
        window.open(downloadUrl, '_blank');
        setShowAdSense(false);
        alert('Download iniciado! Se o download não começar automaticamente, verifique o bloqueador de pop-ups.');
      }
    } catch (error) {
      console.error('Error downloading app:', error);
      alert('Erro ao baixar app. Tente novamente.');
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

  if (!app) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex gap-6 items-start">
            {/* App Icon */}
            {app.iconUrl ? (
              <img src={app.iconUrl} alt={app.title} className="w-32 h-32 rounded-2xl shadow-lg flex-shrink-0" />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl flex-shrink-0">
                📱
              </div>
            )}

            {/* App Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{app.title}</h1>
              <p className="text-lg text-blue-600 mb-3">{app.developer}</p>

              <div className="flex items-center gap-6 text-sm mb-4">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-xl">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-bold">{app.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-gray-500">{app.totalRatings.toLocaleString()} avaliações</p>
                </div>

                <div className="text-center">
                  <p className="text-xl font-bold">{app.downloads.toLocaleString()}</p>
                  <p className="text-gray-500">downloads</p>
                </div>

                <div className="text-center">
                  <p className="text-xl font-bold px-3 py-1 bg-blue-100 text-blue-800 rounded">{app.ageRating}</p>
                  <p className="text-gray-500">Classificação</p>
                </div>
              </div>

              {/* Download Options */}
              <div className="space-y-3">
                {app.freeWithAdsActive && (
                  <div
                    onClick={() => setSelectedVersion('FREE_WITH_ADS')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedVersion === 'FREE_WITH_ADS'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg text-gray-800">Grátis com propaganda</p>
                        <p className="text-sm text-gray-600">Download gratuito - Contém anúncios</p>
                      </div>
                      <div className="text-2xl font-bold text-green-600">GRÁTIS</div>
                    </div>
                  </div>
                )}

                {app.paidNoAdsActive && (
                  <div
                    onClick={() => setSelectedVersion('PAID_NO_ADS')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedVersion === 'PAID_NO_ADS'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg text-gray-800">Sem propaganda</p>
                        <p className="text-sm text-gray-600">Compre e use sem anúncios</p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        R$ {app.paidNoAdsPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="mt-4 w-full md:w-auto px-12 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700 transition shadow-lg"
              >
                {selectedVersion === 'FREE_WITH_ADS' ? 'Baixar Grátis' : `Comprar por R$ ${app.paidNoAdsPrice.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AdSense Modal */}
      {showAdSense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Aguarde alguns segundos...</h2>
            <p className="text-gray-600 mb-6">O download começará automaticamente em breve</p>

            {/* AdSense Placeholder */}
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center min-h-[250px] flex items-center justify-center">
              <div>
                <p className="text-gray-500 text-lg mb-2">📢 Espaço para Anúncio do Google AdSense</p>
                <p className="text-gray-400 text-sm">Slot ID: {app.adsenseSlot || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Preparando download...</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Screenshots */}
        {app.coverImages && app.coverImages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Screenshots</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {app.coverImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Screenshot ${index + 1}`}
                  className="h-96 rounded-lg shadow-md flex-shrink-0"
                />
              ))}
            </div>
          </div>
        )}

        {/* About */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sobre este jogo</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{app.description}</p>
        </div>

        {/* What's New */}
        {app.whatsNew && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">O que há de novo</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{app.whatsNew}</p>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Informações Adicionais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Atualizado em</p>
              <p className="font-semibold">{new Date(app.lastUpdate).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Tamanho</p>
              <p className="font-semibold">{app.fileSize}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Versão</p>
              <p className="font-semibold">{app.version}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Categoria</p>
              <p className="font-semibold">{app.category}</p>
            </div>
            {app.requiresInternet && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Conexão</p>
                <p className="font-semibold">Requer internet</p>
              </div>
            )}
            {app.inAppPurchases && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Compras</p>
                <p className="font-semibold">Contém compras no app</p>
              </div>
            )}
          </div>

          {/* Permissions */}
          {app.permissions && app.permissions.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-2">Permissões</p>
              <div className="flex flex-wrap gap-2">
                {app.permissions.map((permission, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {app.tags && app.tags.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {app.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Avaliações e comentários</h2>

          {app.reviews && app.reviews.length > 0 ? (
            <div className="space-y-4">
              {app.reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center gap-3 mb-2">
                    {review.userAvatar ? (
                      <img src={review.userAvatar} alt={review.userName} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{review.userName}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
          )}
        </div>
      </div>
    </div>
  );
}
