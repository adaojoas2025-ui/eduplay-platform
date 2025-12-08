import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlay, FiTrendingUp, FiUsers, FiDollarSign } from 'react-icons/fi';
import ProductCard from '../../components/ProductCard';
import Loading from '../../components/Loading';
import { productService } from '../../services/productService';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const data = await productService.getAll({ limit: 8, featured: true });
      setFeaturedProducts(data.products || data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Sua plataforma de
            <span className="gradient-text"> produtos digitais</span>
          </h1>
          <p className="hero-description">
            Compre e venda cursos online, e-books, templates e muito mais.
            Transforme seu conhecimento em renda.
          </p>
          <div className="hero-buttons">
            <Link to="/marketplace" className="btn-primary">
              Explorar Marketplace
            </Link>
            <Link to="/register" className="btn-secondary">
              Começar a Vender
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-card card-1">
            <FiPlay /> Cursos Online
          </div>
          <div className="floating-card card-2">
            <FiTrendingUp /> E-books
          </div>
          <div className="floating-card card-3">
            <FiUsers /> Mentorias
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-item">
          <div className="stat-icon"><FiUsers /></div>
          <h3 className="stat-number">10K+</h3>
          <p className="stat-label">Usuários Ativos</p>
        </div>
        <div className="stat-item">
          <div className="stat-icon"><FiPlay /></div>
          <h3 className="stat-number">5K+</h3>
          <p className="stat-label">Produtos</p>
        </div>
        <div className="stat-item">
          <div className="stat-icon"><FiDollarSign /></div>
          <h3 className="stat-number">R$ 1M+</h3>
          <p className="stat-label">Em Vendas</p>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">Produtos em Destaque</h2>
          <Link to="/marketplace" className="view-all-link">Ver todos</Link>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="products-grid">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="how-it-works-section">
        <h2 className="section-title">Como Funciona</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3 className="step-title">Cadastre-se</h3>
            <p className="step-description">
              Crie sua conta gratuitamente em poucos minutos
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3 className="step-title">Explore</h3>
            <p className="step-description">
              Descubra milhares de produtos digitais de qualidade
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3 className="step-title">Compre ou Venda</h3>
            <p className="step-description">
              Adquira conhecimento ou monetize suas habilidades
            </p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Pronto para começar?</h2>
          <p className="cta-description">
            Junte-se a milhares de criadores e consumidores de conteúdo digital
          </p>
          <Link to="/register" className="btn-primary btn-large">
            Criar Conta Gratuita
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
