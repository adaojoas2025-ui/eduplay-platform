import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';

export default function OrderPixPending() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState(null);
  const [pixData, setPixData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('pixData_' + id);
    if (stored) {
      try { setPixData(JSON.parse(stored)); } catch {}
    }
    fetchOrder();
  }, [id]);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await orderAPI.getById(id);
      const o = res.data.data || res.data.order;
      setOrder(o);
      if (o?.status === 'COMPLETED') {
        sessionStorage.removeItem('pixData_' + id);
        navigate(`/order/${id}/success`);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  // Poll every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const handleCopy = () => {
    if (pixData?.pixQrCode) {
      navigator.clipboard.writeText(pixData.pixQrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">

          <div className="text-5xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Aguardando pagamento PIX</h2>
          <p className="text-gray-500 mb-6">
            Escaneie o QR Code com o app do seu banco ou copie o código
          </p>

          {pixData?.pixQrCodeBase64 ? (
            <div className="mb-6 flex justify-center">
              <img
                src={`data:image/png;base64,${pixData.pixQrCodeBase64}`}
                alt="QR Code PIX"
                className="w-56 h-56 border rounded-lg p-2"
              />
            </div>
          ) : (
            <div className="mb-6 w-56 h-56 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">QR Code indisponível</span>
            </div>
          )}

          {pixData?.pixQrCode && (
            <div className="mb-6 text-left">
              <p className="text-xs text-gray-500 mb-2 font-medium">PIX Copia e Cola:</p>
              <div className="flex gap-2 items-center">
                <input
                  readOnly
                  value={pixData.pixQrCode}
                  className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 truncate"
                />
                <button
                  onClick={handleCopy}
                  className="shrink-0 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                >
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-sm text-blue-700 text-left">
            <p className="font-medium mb-1">⏳ Verificando automaticamente...</p>
            <p>Após o pagamento, você será redirecionado em alguns segundos.</p>
            {pixData?.pixExpiresAt && (
              <p className="mt-1 text-xs text-blue-500">
                Expira: {new Date(pixData.pixExpiresAt).toLocaleString('pt-BR')}
              </p>
            )}
          </div>

          {order && (
            <div className="text-sm text-gray-600 mb-6 bg-gray-50 rounded-lg p-4 text-left">
              <p className="font-medium text-gray-800 mb-1">Detalhes do pedido:</p>
              <p>{order.product?.title}</p>
              <p className="text-purple-600 font-bold">
                R$ {Number(order.amount).toFixed(2).replace('.', ',')}
              </p>
            </div>
          )}

          <Link to="/marketplace" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Voltar ao marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
