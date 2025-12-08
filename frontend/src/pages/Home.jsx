import { Link } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiDollarSign, FiStar } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products?limit=6');
      setFeaturedProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              A Maior Plataforma de<br />Produtos Digitais do Brasil
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Compre e venda cursos, ebooks, mentorias e muito mais
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/marketplace" className="bg-white text-primary-500 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all duration-200">
                Explorar Produtos
              </Link>
              <Link to="/seller/products/new" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-primary-500 transition-all duration-200">
                Começar a Vender
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Como Funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="text-4xl text-primary-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Encontre o Produto</h3>
              <p className="text-gray-600">
                Navegue por milhares de produtos digitais de qualidade
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShoppingBag className="text-4xl text-primary-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Compre com Segurança</h3>
              <p className="text-gray-600">
                Pagamento seguro via Mercado Pago com garantia de 7 dias
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiDollarSign className="text-4xl text-primary-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Acesso Imediato</h3>
              <p className="text-gray-600">
                Receba acesso instantâneo após aprovação do pagamento
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold">Produtos em Destaque</h2>
            <Link to="/marketplace" className="text-primary-500 font-semibold hover:underline">
              Ver todos →
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Comece a Vender Seus Produtos Hoje
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Junte-se a milhares de produtores que já faturam na EDUPLAY
          </p>
          <Link to="/seller/products/new" className="bg-white text-primary-500 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all duration-200 inline-block">
            Começar a Vender
          </Link>
        </div>
      </section>
    </div>
  );
}
