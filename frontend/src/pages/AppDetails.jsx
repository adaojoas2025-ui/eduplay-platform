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
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    fetchApp();
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [slug]);

  useEffect(() => {
    if (app && user) {
      checkIfUserPurchased();
    }
  }, [app, user]);

  const fetchApp = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/apps/${slug}`);
      setApp(response.data.data);
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

  const checkIfUserPurchased = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/orders/purchases`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const purchases = response.data.data;
        // Verificar se existe compra deste app
        const appPurchase = purchases.find(purchase =>
          purchase.metadata &&
          purchase.metadata.type === 'APP_PURCHASE' &&
          purchase.metadata.appId === app.id &&
          (purchase.status === 'COMPLETED' || purchase.status === 'APPROVED')
        );

        if (appPurchase) {
          console.log('✅ Usuário já comprou este app!');
          setHasPurchased(true);
          setSelectedVersion('PAID_NO_ADS'); // Selecionar versão paga automaticamente
        }
      }
    } catch (error) {
      console.error('Error checking purchase:', error);
    }
  };

  const handleDownload = async () => {
    if (selectedVersion === 'PAID_NO_ADS') {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Você precisa estar logado para baixar a versão sem propaganda');
        navigate('/login');
        return;
      }

      // Se usuário já comprou, permitir download direto
      if (hasPurchased) {
        initiateDownload();
        return;
      }

      // Se não comprou, não faz nada (o checkout aparecerá)
      return;
    }
    if (app.adsenseEnabled && selectedVersion === 'FREE_WITH_ADS') {
      setShowAdSense(true);
      setTimeout(() => { initiateDownload(); }, 5000);
    } else {
      initiateDownload();
    }
  };

  const handlePurchaseApp = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      console.log('🔄 Criando pedido do app...');
      const orderResponse = await axios.post(`${API_URL}/apps/${app.id}/purchase`, { version: selectedVersion, price: app.paidNoAdsPrice }, { headers: { Authorization: `Bearer ${token}` } });
      const orderId = orderResponse.data.data.orderId;
      console.log('✅ Pedido criado:', orderId);
      console.log('💰 Aprovando pagamento de teste...');
      await axios.post(`${API_URL}/test/approve-payment/${orderId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      console.log('✅ Pagamento aprovado!');
      alert(`Compra aprovada com sucesso! Pedido: ${orderId}\n\nRedirecionando para Meus Produtos...`);
      navigate('/my-products');
    } catch (err) {
      console.error('❌ Erro na compra:', err);
      setError(err.response?.data?.message || 'Erro ao processar compra. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const initiateDownload = async () => {
    try {
      const response = await axios.get(`${API_URL}/apps/${app.id}/download?version=${selectedVersion}`);
      const downloadUrl = response.data.data.downloadUrl;
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
        setShowAdSense(false);
        alert('Download iniciado!');
      }
    } catch (error) {
      console.error('Error downloading app:', error);
      alert('Erro ao baixar app.');
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

  // Se usuário selecionou versão paga MAS já comprou, não mostrar checkout
  if (selectedVersion === 'PAID_NO_ADS' && !hasPurchased) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Finalizar Compra</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Itens do Pedido</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                    {app.iconUrl ? (
                      <img src={app.iconUrl} alt={app.title} className="w-20 h-20 object-cover rounded-lg" />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl">📱</div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{app.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">Versão sem propaganda</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800">R$ {app.paidNoAdsPrice.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
              {user && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Dados do Comprador</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Nome</p>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">E-mail</p>
                      <p className="font-semibold text-gray-800">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumo</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal (1 item)</span>
                    <span>R$ {app.paidNoAdsPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Desconto</span>
                    <span>R$ 0.00</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-800">
                      <span>Total</span>
                      <span>R$ {app.paidNoAdsPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
                )}
                <button onClick={handlePurchaseApp} disabled={loading} className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processando Pagamento...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Pagar Agora - Aprovação Instantânea
                    </span>
                  )}
                </button>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 text-center">
                    <span className="font-semibold">✨ Pagamento de Teste:</span> Aprovação instantânea sem necessidade de cartão. Você poderá baixar a versão sem propaganda imediatamente.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Pagamento seguro via Mercado Pago</span>
                </div>
                <button onClick={() => window.location.reload()} className="block w-full text-center text-blue-600 hover:underline mt-4">← Voltar às opções</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex gap-6 items-start">
            {app.iconUrl ? (
              <img src={app.iconUrl} alt={app.title} className="w-32 h-32 rounded-2xl shadow-lg flex-shrink-0" />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl flex-shrink-0">📱</div>
            )}
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
              <div className="space-y-3">
                {app.freeWithAdsActive && (
                  <div onClick={() => setSelectedVersion('FREE_WITH_ADS')} className={`p-4 border-2 rounded-lg cursor-pointer transition ${selectedVersion === 'FREE_WITH_ADS' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
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
                  <div onClick={() => setSelectedVersion('PAID_NO_ADS')} className={`p-4 border-2 rounded-lg cursor-pointer transition ${selectedVersion === 'PAID_NO_ADS' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg text-gray-800">Sem propaganda</p>
                        <p className="text-sm text-gray-600">
                          {hasPurchased ? '✅ Você já possui esta versão!' : 'Compre e use sem anúncios'}
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {hasPurchased ? '✅ ADQUIRIDO' : `R$ ${app.paidNoAdsPrice.toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {selectedVersion === 'FREE_WITH_ADS' && (
                <button onClick={handleDownload} className="mt-4 w-full px-12 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700 transition shadow-lg">Baixar Grátis</button>
              )}
              {selectedVersion === 'PAID_NO_ADS' && hasPurchased && (
                <button onClick={handleDownload} className="mt-4 w-full px-12 py-4 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700 transition shadow-lg">
                  📱 Baixar Versão Sem Propaganda
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {showAdSense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Aguarde alguns segundos...</h2>
            <p className="text-gray-600 mb-6">O download começará automaticamente em breve</p>
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
        {app.coverImages && app.coverImages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Screenshots</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {app.coverImages.map((image, index) => (
                <img key={index} src={image} alt={`Screenshot ${index + 1}`} className="h-96 rounded-lg shadow-md flex-shrink-0" />
              ))}
            </div>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sobre este jogo</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{app.description}</p>
        </div>
        {app.whatsNew && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">O que há de novo</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{app.whatsNew}</p>
          </div>
        )}
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
          {app.permissions && app.permissions.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-2">Permissões</p>
              <div className="flex flex-wrap gap-2">
                {app.permissions.map((permission, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{permission}</span>
                ))}
              </div>
            </div>
          )}
          {app.tags && app.tags.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {app.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">#{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
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
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">{review.userName.charAt(0).toUpperCase()}</div>
                    )}
                    <div>
                      <p className="font-semibold">{review.userName}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}>⭐</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</p>
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
