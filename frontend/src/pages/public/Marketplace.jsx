import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import Loading from '../../components/Loading';
import { productService } from '../../services/productService';
import { FiSearch, FiFilter } from 'react-icons/fi';
import './Marketplace.css';

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest'
  });

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchParams.get('search'),
        category: searchParams.get('category'),
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sort: filters.sort
      };
      const data = await productService.getAll(params);
      setProducts(data.products || data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery) {
      newParams.set('search', searchQuery);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="marketplace-page">
      <div className="marketplace-header">
        <h1 className="page-title">Marketplace</h1>
        <p className="page-subtitle">Explore milhares de produtos digitais</p>
      </div>

      <div className="marketplace-content">
        <aside className="filters-sidebar">
          <div className="filter-section">
            <h3 className="filter-title">Filtros</h3>
            
            <div className="filter-group">
              <label>Categoria</label>
              <select
                className="input-field"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">Todas</option>
                <option value="courses">Cursos</option>
                <option value="ebooks">E-books</option>
                <option value="templates">Templates</option>
                <option value="mentorship">Mentorias</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Ordenar por</label>
              <select
                className="input-field"
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <option value="newest">Mais Recentes</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
                <option value="popular">Mais Populares</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Faixa de Preço</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  className="input-field"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="input-field"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            <button onClick={fetchProducts} className="btn-primary w-full">
              Aplicar Filtros
            </button>
          </div>
        </aside>

        <main className="products-section">
          <div className="search-bar">
            <form onSubmit={handleSearch} className="search-form-full">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="search-input-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn-primary">Buscar</button>
            </form>
          </div>

          {loading ? (
            <Loading />
          ) : products.length > 0 ? (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>Nenhum produto encontrado</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Marketplace;
