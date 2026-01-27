import { useState, useEffect } from 'react';
import { FiPlus, FiCheck } from 'react-icons/fi';
import api from '../services/api';

export default function OrderBumpSuggestion({ cartItems, onAddBump }) {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedBumps, setSelectedBumps] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, [cartItems]);

  const loadSuggestions = async () => {
    if (!cartItems || cartItems.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const productIds = cartItems.map(item => item.productId || item.product?.id).filter(Boolean).join(',');
      const category = cartItems[0]?.product?.category;

      const response = await api.get('/order-bumps/suggestions', {
        params: { productIds, category }
      });

      if (response.data.success && response.data.data?.length > 0) {
        setSuggestions(response.data.data);

        // Track impressions
        response.data.data.forEach(bump => {
          api.post(`/order-bumps/${bump.id}/track`, { event: 'impression' }).catch(() => {});
        });
      }
    } catch (error) {
      console.error('Error loading order bump suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBump = async (bump) => {
    const isSelected = selectedBumps.has(bump.id);

    if (isSelected) {
      // Remove bump
      const newSelected = new Set(selectedBumps);
      newSelected.delete(bump.id);
      setSelectedBumps(newSelected);
      onAddBump(bump, false);
    } else {
      // Add bump
      setSelectedBumps(new Set([...selectedBumps, bump.id]));
      onAddBump(bump, true);

      // Track click
      api.post(`/order-bumps/${bump.id}/track`, { event: 'click' }).catch(() => {});
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  if (loading || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 mb-6 border-2 border-orange-300 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl">🎁</span>
        <h3 className="text-xl font-bold text-orange-800">
          Aproveite esta oferta especial!
        </h3>
      </div>

      <p className="text-gray-700 mb-4 text-sm">
        Fortaleça sua compra adicionando estes produtos complementares agora!
      </p>

      <div className="space-y-3">
        {suggestions.map(bump => {
          const isSelected = selectedBumps.has(bump.id);
          const originalPrice = bump.product?.price || 0;
          const finalPrice = bump.discountPercent
            ? originalPrice * (1 - bump.discountPercent / 100)
            : originalPrice;

          return (
            <div
              key={bump.id}
              className={`flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer ${
                isSelected
                  ? 'bg-green-100 border-2 border-green-500'
                  : 'bg-white border-2 border-gray-200 hover:border-orange-300'
              }`}
              onClick={() => handleToggleBump(bump)}
            >
              <div className="flex items-center gap-4 flex-1">
                {bump.product?.thumbnailUrl && (
                  <img
                    src={bump.product.thumbnailUrl}
                    alt={bump.product.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}

                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">
                    {bump.title || bump.product?.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {bump.description}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    {bump.discountPercent > 0 && (
                      <span className="text-xs text-red-600 line-through">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                    <span className="font-bold text-green-600">
                      {formatPrice(finalPrice)}
                    </span>
                    {bump.discountPercent > 0 && (
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                        {bump.discountPercent}% OFF
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-green-500 text-white'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleBump(bump);
                }}
              >
                {isSelected ? (
                  <>
                    <FiCheck />
                    Adicionado
                  </>
                ) : (
                  <>
                    <FiPlus />
                    Adicionar
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
