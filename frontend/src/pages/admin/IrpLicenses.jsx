import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const STATUS_LABELS = {
  active: 'Ativo',
  expired: 'Vencido',
  blocked: 'Bloqueado',
  revoked: 'Revogado',
};

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function maskKey(value) {
  if (!value) return '-';
  if (value.length <= 14) return value;
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

function shortDevice(value) {
  if (!value) return '-';
  if (value.length <= 22) return value;
  return `${value.slice(0, 22)}...`;
}

function statusClass(status) {
  if (status === 'active') return 'bg-green-100 text-green-800';
  if (status === 'expired') return 'bg-yellow-100 text-yellow-800';
  if (status === 'blocked' || status === 'revoked') return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
}

export default function AdminIrpLicenses() {
  const [trials, setTrials] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 50;

  const totals = useMemo(() => {
    return trials.reduce(
      (acc, trial) => {
        const status = trial.status;
        if (status === 'active') acc.active += 1;
        if (status === 'expired') acc.expired += 1;
        if (status === 'blocked') acc.blocked += 1;
        return acc;
      },
      { active: 0, expired: 0, blocked: 0 }
    );
  }, [trials]);

  useEffect(() => {
    loadTrials();
  }, [page, state, searchEmail]);

  async function loadTrials() {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/licenses/admin/trials', {
        params: {
          page,
          limit,
          state: state || undefined,
          email: searchEmail || undefined,
        },
      });
      setTrials(response.data?.trials || []);
      setTotal(response.data?.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao carregar testes IRP.');
    } finally {
      setLoading(false);
    }
  }

  function applyFilters(event) {
    event.preventDefault();
    setPage(1);
    setSearchEmail(email.trim());
  }

  function clearFilters() {
    setEmail('');
    setSearchEmail('');
    setState('');
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin - Licencas IRP</h1>
            <p className="mt-1 text-gray-600">
              Consulta dos usuarios que ativaram o teste gratis de 1 dia da IRP Master.
            </p>
          </div>
          <button
            type="button"
            onClick={loadTrials}
            disabled={loading}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
          >
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-500">Total encontrado</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{total}</div>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-500">Ativos na pagina</div>
            <div className="mt-2 text-3xl font-bold text-green-700">{totals.active}</div>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-500">Vencidos na pagina</div>
            <div className="mt-2 text-3xl font-bold text-yellow-700">{totals.expired}</div>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-500">Bloqueados na pagina</div>
            <div className="mt-2 text-3xl font-bold text-red-700">{totals.blocked}</div>
          </div>
        </section>

        <section className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
          <form onSubmit={applyFilters} className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_180px_auto_auto] md:items-end">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Buscar por email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                placeholder="cliente@email.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Status
              </label>
              <select
                value={state}
                onChange={(event) => {
                  setState(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Todos</option>
                <option value="active">Ativos</option>
                <option value="expired">Vencidos</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
            >
              Filtrar
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Limpar
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Inicio</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Vence em</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Ultimo uso</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Versao</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Dispositivo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Chave</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-600">
                      Carregando testes IRP...
                    </td>
                  </tr>
                ) : trials.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-600">
                      Nenhum teste encontrado.
                    </td>
                  </tr>
                ) : (
                  trials.map((trial) => (
                    <tr key={trial.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{trial.email}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(trial.status)}`}>
                          {STATUS_LABELS[trial.status] || trial.status || '-'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{formatDate(trial.createdAt)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{formatDate(trial.expiresAt)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{formatDate(trial.lastSeenAt)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{trial.extensionVersion || '-'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700" title={trial.deviceId || ''}>{shortDevice(trial.deviceId)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700" title={trial.licenseKey || ''}>{maskKey(trial.licenseKey)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-gray-600">
              Pagina {page} de {totalPages} - {total} registro{total === 1 ? '' : 's'}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Proxima
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
