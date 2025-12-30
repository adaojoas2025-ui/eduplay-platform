import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api.config';
import { getUser } from '../lib/auth';

const CATEGORIES = [
  { name: 'Todos', value: '' },
  { name: 'Jogos', value: 'Jogos' },
  { name: 'Educação', value: 'Educação' },
  { name: 'Ferramentas', value: 'Ferramentas' },
  { name: 'Entretenimento', value: 'Entretenimento' },
  { name: 'Produtividade', value: 'Produtividade' },
];

export default function AppsStore() {
  const [apps, setApps] = useState([]);
  const [popularApps, setPopularApps] = useState([]);
  const [newApps, setNewApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const user = getUser();

  useEffect(() => {
    fetchApps();
    fetchPopularAndNew();
  }, [category]);

  // Auto-rotate featured apps
  useEffect(() => {
    const featuredApps = apps.filter(app => app.featured);
    if (featuredApps.length > 1) {
      const interval = setInterval(() => {
        setFeaturedIndex((prev) => (prev + 1) % featuredApps.length);
      }, 5000); // Change every 5 seconds
      return () => clearInterval(interval);
    }
  }, [apps]);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50,
        sortBy: 'downloads',
        order: 'desc',
      };

      if (category) params.category = category;
      if (search) params.search = search;

      const response = await axios.get(`${API_URL}/apps`, { params });
      setApps(response.data.data.items || []);
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularAndNew = async () => {
    try {
      // Fetch popular apps (most downloads)
      const popularResponse = await axios.get(`${API_URL}/apps`, {
        params: {
          limit: 6,
          sortBy: 'downloads',
          order: 'desc',
        },
      });
      setPopularApps(popularResponse.data.data.items || []);

      // Fetch new apps (most recent)
      const newResponse = await axios.get(`${API_URL}/apps`, {
        params: {
          limit: 6,
          sortBy: 'createdAt',
          order: 'desc',
        },
      });
      setNewApps(newResponse.data.data.items || []);
    } catch (error) {
      console.error('Error fetching popular and new apps:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchApps();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Apps & Jogos</h1>
          <p className="text-xl text-blue-100 mb-8">
            Baixe os melhores aplicativos e jogos gratuitamente ou sem propaganda
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar apps, jogos..."
                className="flex-1 px-6 py-4 rounded-lg text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Admin Button */}
        {user?.role === 'ADMIN' && (
          <div className="mb-6 flex justify-end">
            <Link
              to="/admin/apps"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <span className="text-xl">➕</span>
              <span>Publicar Novo App</span>
            </Link>
          </div>
        )}

        {/* Categories */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition ${
                  category === cat.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando apps...</p>
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhum app encontrado</h2>
            <p className="text-gray-600">Tente buscar com outros termos ou em outra categoria</p>
          </div>
        ) : (
          <>
            {/* Featured Apps Carousel */}
            {apps.some(app => app.featured) && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-3xl">🌟</span>
                  Em Destaque
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {apps.filter(app => app.featured).slice(0, 3).map((app) => (
                    <Link
                      key={app.id}
                      to={`/apps/${app.slug}`}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
                    >
                      {/* Cover Image */}
                      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden relative">
                        {app.coverImages && app.coverImages[0] ? (
                          <img
                            src={app.coverImages[0]}
                            alt={app.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-6xl">📱</span>
                          </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-2 right-2 flex flex-col gap-2">
                          {app.freeWithAdsUrl && (
                            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold shadow-lg">
                              GRÁTIS
                            </span>
                          )}
                          {app.paidWithoutAdsUrl && (
                            <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-bold shadow-lg">
                              SEM ADS
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex gap-4 mb-3">
                          {/* Icon */}
                          {app.iconUrl ? (
                            <img src={app.iconUrl} alt={app.title} className="w-16 h-16 rounded-xl shadow-md" />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-3xl shadow-md">
                              📱
                            </div>
                          )}

                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-blue-600 transition">
                              {app.title}
                            </h3>
                            <p className="text-sm text-gray-600">{app.developer}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="font-semibold text-gray-800">{app.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-gray-600">{app.downloads.toLocaleString()} downloads</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Apps */}
            {popularApps.length > 0 && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-3xl">🔥</span>
                  Mais Populares
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {popularApps.map((app) => (
                    <Link
                      key={app.id}
                      to={`/apps/${app.slug}`}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                    >
                      {/* Icon */}
                      <div className="p-4 flex justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        {app.iconUrl ? (
                          <img src={app.iconUrl} alt={app.title} className="w-20 h-20 rounded-xl shadow-md" />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-3xl shadow-md">
                            📱
                          </div>
                        )}
                      </div>

                      <div className="p-3 border-t">
                        <h3 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition">
                          {app.title}
                        </h3>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold text-gray-700">{app.rating.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{app.downloads.toLocaleString()} downloads</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* New Apps */}
            {newApps.length > 0 && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-3xl">✨</span>
                  Novos Aplicativos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {newApps.map((app) => (
                    <Link
                      key={app.id}
                      to={`/apps/${app.slug}`}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group relative"
                    >
                      {/* NEW Badge */}
                      <div className="absolute top-2 right-2 z-10">
                        <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-bold shadow-lg">
                          NOVO
                        </span>
                      </div>

                      {/* Icon */}
                      <div className="p-4 flex justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        {app.iconUrl ? (
                          <img src={app.iconUrl} alt={app.title} className="w-20 h-20 rounded-xl shadow-md" />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-3xl shadow-md">
                            📱
                          </div>
                        )}
                      </div>

                      <div className="p-3 border-t">
                        <h3 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition">
                          {app.title}
                        </h3>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold text-gray-700">{app.rating.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{app.downloads.toLocaleString()} downloads</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All Apps */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {category ? `${category}` : 'Todos os Apps'}
                <span className="text-gray-500 text-lg ml-2">({apps.length})</span>
              </h2>

              <div className="space-y-4">
                {apps.map((app) => (
                  <Link
                    key={app.id}
                    to={`/apps/${app.slug}`}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-4 flex gap-4 items-center group"
                  >
                    {/* Icon */}
                    {app.iconUrl ? (
                      <img src={app.iconUrl} alt={app.title} className="w-20 h-20 rounded-xl flex-shrink-0 shadow-md" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-3xl flex-shrink-0 shadow-md">
                        📱
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-blue-600 transition">{app.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{app.developer}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{app.shortDescription || app.description}</p>

                      <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold text-gray-800">{app.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-gray-500">{app.downloads.toLocaleString()} downloads</span>
                        {app.fileSize && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">{app.fileSize}</span>
                        )}
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-semibold">
                          {app.ageRating}
                        </span>
                        {app.freeWithAdsUrl && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-bold">
                            GRÁTIS
                          </span>
                        )}
                        {app.paidWithoutAdsUrl && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs font-bold">
                            SEM ADS
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Download Button */}
                    <div className="flex-shrink-0">
                      <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg">
                        Baixar
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
