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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const user = getUser();

  useEffect(() => {
    fetchApps();
  }, [category]);

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
            {/* Featured Apps */}
            {apps.some(app => app.featured) && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Em Destaque</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {apps.filter(app => app.featured).slice(0, 3).map((app) => (
                    <Link
                      key={app.id}
                      to={`/apps/${app.slug}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group"
                    >
                      {/* Cover Image */}
                      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
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
                      </div>

                      <div className="p-4">
                        <div className="flex gap-4 mb-3">
                          {/* Icon */}
                          {app.iconUrl ? (
                            <img src={app.iconUrl} alt={app.title} className="w-16 h-16 rounded-xl" />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-2xl">
                              📱
                            </div>
                          )}

                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800 mb-1">{app.title}</h3>
                            <p className="text-sm text-gray-600">{app.developer}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="font-semibold">{app.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-gray-600">{app.downloads.toLocaleString()} downloads</span>
                        </div>
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
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-4 flex gap-4 items-center"
                  >
                    {/* Icon */}
                    {app.iconUrl ? (
                      <img src={app.iconUrl} alt={app.title} className="w-20 h-20 rounded-xl flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gray-200 flex items-center justify-center text-3xl flex-shrink-0">
                        📱
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-800 mb-1">{app.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{app.developer}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{app.shortDescription || app.description}</p>

                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold">{app.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-gray-500">{app.downloads.toLocaleString()} downloads</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{app.fileSize}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          {app.ageRating}
                        </span>
                      </div>
                    </div>

                    {/* Download Button */}
                    <div className="flex-shrink-0">
                      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
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
