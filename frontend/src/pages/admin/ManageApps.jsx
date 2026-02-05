import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api.config';

export default function ManageApps() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApps();
  }, [filter]);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? { status: filter.toUpperCase() } : {};

      const response = await axios.get(`${API_URL}/apps/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setApps(response.data.data.items || []);
    } catch (error) {
      console.error('Error fetching apps:', error);
      // Nao mostrar alerta - definir lista vazia
      // A UI ja mostra mensagem "Nenhum app encontrado"
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (appId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/apps/${appId}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('App publicado com sucesso!');
      fetchApps();
    } catch (error) {
      console.error('Error publishing app:', error);
      alert('Erro ao publicar app');
    }
  };

  const handleArchive = async (appId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/apps/${appId}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('App arquivado com sucesso!');
      fetchApps();
    } catch (error) {
      console.error('Error archiving app:', error);
      alert('Erro ao arquivar app');
    }
  };

  const handleDelete = async (appId) => {
    if (!confirm('Tem certeza que deseja excluir este app?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/apps/${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('App excluído com sucesso!');
      fetchApps();
    } catch (error) {
      console.error('Error deleting app:', error);
      alert('Erro ao excluir app');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando apps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gerenciar Apps/Jogos</h1>
            <p className="text-gray-600 mt-1">Publique e gerencie seus aplicativos e jogos</p>
          </div>
          <Link
            to="/admin/apps/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Novo App
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({apps.length})
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'published'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Publicados
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'draft'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rascunhos
            </button>
            <button
              onClick={() => setFilter('archived')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'archived'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Arquivados
            </button>
          </div>
        </div>

        {/* Apps Grid */}
        {apps.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhum app encontrado</h2>
            <p className="text-gray-600 mb-6">Comece publicando seu primeiro app na plataforma</p>
            <Link
              to="/admin/apps/new"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Publicar Primeiro App
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <div key={app.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                {/* App Icon */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {app.iconUrl ? (
                    <img src={app.iconUrl} alt={app.title} className="w-32 h-32 rounded-2xl shadow-lg" />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-white/20 flex items-center justify-center text-white text-4xl">
                      📱
                    </div>
                  )}
                </div>

                {/* App Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-800 flex-1">{app.title}</h3>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-800'
                          : app.status === 'ARCHIVED'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {app.status === 'PUBLISHED' ? 'Publicado' : app.status === 'ARCHIVED' ? 'Arquivado' : 'Rascunho'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-1">{app.developer}</p>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{app.shortDescription || app.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-sm">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold">{app.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-gray-500">{app.totalRatings} avaliações</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{app.downloads}</p>
                      <p className="text-xs text-gray-500">downloads</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{app.fileSize}</p>
                      <p className="text-xs text-gray-500">tamanho</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/apps/${app.id}/edit`}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold text-center"
                    >
                      Editar
                    </Link>

                    {app.status === 'DRAFT' && (
                      <button
                        onClick={() => handlePublish(app.id)}
                        className="flex-1 bg-green-100 text-green-800 px-3 py-2 rounded-lg hover:bg-green-200 transition text-sm font-semibold"
                      >
                        Publicar
                      </button>
                    )}

                    {app.status === 'PUBLISHED' && (
                      <button
                        onClick={() => handleArchive(app.id)}
                        className="flex-1 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg hover:bg-yellow-200 transition text-sm font-semibold"
                      >
                        Arquivar
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(app.id)}
                      className="bg-red-100 text-red-800 px-3 py-2 rounded-lg hover:bg-red-200 transition text-sm font-semibold"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
