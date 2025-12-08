import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Check, X, Ban } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const params = filter ? { status: filter } : {};
      const response = await adminAPI.getUsers(params);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    try {
      await adminAPI.approveProducer(id);
      fetchUsers();
      alert('Produtor aprovado com sucesso!');
    } catch (error) {
      alert('Erro ao aprovar produtor');
    }
  }

  async function handleReject(id) {
    if (!confirm('Tem certeza que deseja rejeitar este produtor?')) return;

    try {
      await adminAPI.rejectProducer(id);
      fetchUsers();
      alert('Produtor rejeitado');
    } catch (error) {
      alert('Erro ao rejeitar produtor');
    }
  }

  async function handleSuspend(id) {
    if (!confirm('Tem certeza que deseja suspender este usuário?')) return;

    try {
      await adminAPI.suspendUser(id);
      fetchUsers();
      alert('Usuário suspenso');
    } catch (error) {
      alert('Erro ao suspender usuário');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>

        <select
          className="input w-48"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendentes</option>
          <option value="APPROVED">Aprovados</option>
          <option value="REJECTED">Rejeitados</option>
          <option value="SUSPENDED">Suspensos</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-4">{user.name}</td>
                <td className="px-4 py-4">{user.email}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'PRODUCER' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.status === 'APPROVED' ? 'bg-success-100 text-success-800' :
                    user.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    user.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    {user.role === 'PRODUCER' && user.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="btn bg-success text-white hover:bg-success-700 flex items-center text-sm px-2 py-1"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          className="btn bg-red-600 text-white hover:bg-red-700 flex items-center text-sm px-2 py-1"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rejeitar
                        </button>
                      </>
                    )}
                    {user.status !== 'SUSPENDED' && user.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleSuspend(user.id)}
                        className="btn bg-gray-600 text-white hover:bg-gray-700 flex items-center text-sm px-2 py-1"
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Suspender
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <p className="text-center text-gray-600 py-8">Nenhum usuário encontrado</p>
        )}
      </div>
    </div>
  );
}
