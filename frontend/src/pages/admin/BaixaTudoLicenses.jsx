import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const PREFIX = 'BT';
const STATUS_LABELS = { active: 'Ativo', expired: 'Vencido', blocked: 'Bloqueado', revoked: 'Revogado', missing: 'Sem licenca' };
const ACTION_LABELS = { activate: 'Ativacao', validate: 'Uso/validacao', heartbeat: 'Uso continuo', sync: 'Sincronizacao' };

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function maskKey(value) {
  if (!value) return '-';
  if (value.length <= 14) return value;
  return value.slice(0, 8) + '...' + value.slice(-4);
}
function shortValue(value, size = 22) {
  if (!value) return '-';
  if (value.length <= size) return value;
  return value.slice(0, size) + '...';
}
function statusClass(status) {
  if (status === 'active') return 'bg-green-100 text-green-800';
  if (status === 'expired') return 'bg-yellow-100 text-yellow-800';
  if (status === 'blocked' || status === 'revoked') return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
}
function attemptClass(valid) {
  return valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
}

export default function AdminBaixaTudoLicenses() {
  const [licenses, setLicenses] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [attemptSummary, setAttemptSummary] = useState({});
  const [total, setTotal] = useState(0);
  const [attemptTotal, setAttemptTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [email, setEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [attemptValid, setAttemptValid] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 50;

  const totals = useMemo(() => licenses.reduce((acc, license) => {
    if (license.status === 'active') acc.active += 1;
    if (license.status === 'expired') acc.expired += 1;
    if (license.status === 'blocked') acc.blocked += 1;
    return acc;
  }, { active: 0, expired: 0, blocked: 0 }), [licenses]);

  useEffect(() => { loadData(); }, [page, status, searchEmail, attemptValid]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [licensesResponse, attemptsResponse] = await Promise.all([
        api.get('/licenses/admin/list', { params: { page, limit, status: status || undefined, email: searchEmail || undefined, prefix: PREFIX } }),
        api.get('/licenses/admin/attempts', { params: { page: 1, limit: 30, valid: attemptValid || undefined, prefix: PREFIX } }),
      ]);
      setLicenses(licensesResponse.data?.licenses || []);
      setTotal(licensesResponse.data?.total || 0);
      setAttempts(attemptsResponse.data?.attempts || []);
      setAttemptTotal(attemptsResponse.data?.total || 0);
      setAttemptSummary(attemptsResponse.data?.summary || {});
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao carregar dados do BaixaTudo.');
    } finally {
      setLoading(false);
    }
  }
  function applyFilters(event) { event.preventDefault(); setPage(1); setSearchEmail(email.trim()); }
  function clearFilters() { setEmail(''); setSearchEmail(''); setStatus(''); setAttemptValid(''); setPage(1); }
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin - Licencas BaixaTudo</h1>
            <p className="mt-1 text-gray-600">Consulta das licencas do BaixaTudo e do uso/tentativas de validacao feitas pela extensao.</p>
          </div>
          <button type="button" onClick={loadData} disabled={loading} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50">
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>

        {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="rounded-lg border bg-white p-4 shadow-sm"><div className="text-sm font-semibold text-gray-500">Licencas encontradas</div><div className="mt-2 text-3xl font-bold text-gray-900">{total}</div></div>
          <div className="rounded-lg border bg-white p-4 shadow-sm"><div className="text-sm font-semibold text-gray-500">Ativas na pagina</div><div className="mt-2 text-3xl font-bold text-green-700">{totals.active}</div></div>
          <div className="rounded-lg border bg-white p-4 shadow-sm"><div className="text-sm font-semibold text-gray-500">Vencidas na pagina</div><div className="mt-2 text-3xl font-bold text-yellow-700">{totals.expired}</div></div>
          <div className="rounded-lg border bg-white p-4 shadow-sm"><div className="text-sm font-semibold text-gray-500">Usando em 24h</div><div className="mt-2 text-3xl font-bold text-blue-700">{Number(attemptSummary.activeDevices24h || 0)}</div></div>
          <div className="rounded-lg border bg-white p-4 shadow-sm"><div className="text-sm font-semibold text-gray-500">Bloqueadas 24h</div><div className="mt-2 text-3xl font-bold text-red-700">{Number(attemptSummary.denied24h || 0)}</div></div>
        </section>

        <section className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
          <form onSubmit={applyFilters} className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_180px_180px_auto_auto] md:items-end">
            <div><label className="mb-1 block text-sm font-semibold text-gray-700">Buscar por email</label><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none" placeholder="cliente@email.com" /></div>
            <div><label className="mb-1 block text-sm font-semibold text-gray-700">Status licenca</label><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"><option value="">Todos</option><option value="active">Ativas</option><option value="expired">Vencidas</option><option value="blocked">Bloqueadas</option></select></div>
            <div><label className="mb-1 block text-sm font-semibold text-gray-700">Tentativas</label><select value={attemptValid} onChange={(event) => setAttemptValid(event.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"><option value="">Todas</option><option value="true">Permitidas</option><option value="false">Bloqueadas</option></select></div>
            <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">Filtrar</button>
            <button type="button" onClick={clearFilters} className="rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">Limpar</button>
          </form>
        </section>

        <section className="mb-6 overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="border-b px-4 py-3"><h2 className="text-lg font-bold text-gray-900">Licencas BaixaTudo</h2></div>
          <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
            {['Email','Status','Vence em','Ultimo uso','Versao','Dispositivo','Chave'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>)}
          </tr></thead><tbody className="divide-y divide-gray-100 bg-white">
            {loading ? <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-600">Carregando licencas BaixaTudo...</td></tr> : licenses.length === 0 ? <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-600">Nenhuma licenca encontrada.</td></tr> : licenses.map((license) => (
              <tr key={license.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{license.email || '-'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm"><span className={['rounded-full px-2.5 py-1 text-xs font-semibold', statusClass(license.status)].join(' ')}>{STATUS_LABELS[license.status] || license.status || '-'}</span></td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{formatDate(license.expiresAt)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{formatDate(license.lastSeenAt)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{license.extensionVersion || '-'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700" title={license.activeDeviceId || ''}>{shortValue(license.activeDeviceId)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700" title={license.licenseKey || ''}>{maskKey(license.licenseKey)}</td>
              </tr>
            ))}
          </tbody></table></div>
          <div className="flex flex-col gap-3 border-t px-4 py-3 md:flex-row md:items-center md:justify-between"><div className="text-sm text-gray-600">Pagina {page} de {totalPages} - {total} registro{total === 1 ? '' : 's'}</div><div className="flex gap-2"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Anterior</button><button type="button" disabled={page >= totalPages || loading} onClick={() => setPage((current) => current + 1)} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Proxima</button></div></div>
        </section>

        <section className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="border-b px-4 py-3 md:flex md:items-center md:justify-between"><div><h2 className="text-lg font-bold text-gray-900">Uso e tentativas recentes</h2><p className="text-sm text-gray-600">Mostra chamadas permitidas e bloqueadas feitas pela extensao BaixaTudo.</p></div><div className="mt-2 text-sm text-gray-600 md:mt-0">Total: {attemptTotal} | Permitidas: {Number(attemptSummary.allowed || 0)} | Bloqueadas: {Number(attemptSummary.denied || 0)}</div></div>
          <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
            {['Quando','Resultado','Acao','Motivo','Versao','Dispositivo','Chave','IP'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>)}
          </tr></thead><tbody className="divide-y divide-gray-100 bg-white">
            {loading ? <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-600">Carregando tentativas...</td></tr> : attempts.length === 0 ? <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-600">Nenhuma tentativa registrada ainda.</td></tr> : attempts.map((attempt) => (
              <tr key={attempt.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{formatDate(attempt.createdAt)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm"><span className={['rounded-full px-2.5 py-1 text-xs font-semibold', attemptClass(attempt.valid)].join(' ')}>{attempt.valid ? 'Permitida' : 'Bloqueada'}</span></td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{ACTION_LABELS[attempt.action] || attempt.action || '-'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700" title={attempt.message || ''}>{attempt.reason || '-'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{attempt.extensionVersion || '-'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700" title={attempt.deviceId || ''}>{shortValue(attempt.deviceId)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700" title={attempt.licenseKey || ''}>{maskKey(attempt.licenseKey)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{shortValue(attempt.ip, 18)}</td>
              </tr>
            ))}
          </tbody></table></div>
        </section>
      </div>
    </div>
  );
}
