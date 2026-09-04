import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const STATUS_LABELS = { active: 'Ativo', expired: 'Vencido', blocked: 'Bloqueado', revoked: 'Revogado', missing: 'Sem licenca' };
const ACTION_LABELS = { activate: 'Ativacao', validate: 'Uso/validacao', heartbeat: 'Uso continuo', trial: 'Teste gratis' };

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

export default function AdminIrpLicenses() {
  const [trials, setTrials] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [attemptSummary, setAttemptSummary] = useState({});
  const [total, setTotal] = useState(0);
  const [attemptTotal, setAttemptTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [attemptValid, setAttemptValid] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 50;

  const totals = useMemo(() => trials.reduce((acc, trial) => {
    if (trial.status === 'active') acc.active += 1;
    if (trial.status === 'expired') acc.expired += 1;
    if (trial.status === 'blocked') acc.blocked += 1;
    return acc;
  }, { active: 0, expired: 0, blocked: 0 }), [trials]);

  useEffect(() => { loadData(); }, [page, state, searchEmail, attemptValid]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [trialsResponse, attemptsResponse] = await Promise.all([
        api.get('/licenses/admin/trials', { params: { page, limit, state: state || undefined, email: searchEmail || undefined } }),
        api.get('/licenses/admin/attempts', { params: { page: 1, limit: 30, valid: attemptValid || undefined } }),
      ]);
      setTrials(trialsResponse.data?.trials || []);
      setTotal(trialsResponse.data?.total || 0);
      setAttempts(attemptsResponse.data?.attempts || []);
      setAttemptTotal(attemptsResponse.data?.total || 0);
      setAttemptSummary(attemptsResponse.data?.summary || {});
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao carregar dados IRP.');
    } finally {
      setLoading(false);
    }
  }
  function applyFilters(event) { event.preventDefault(); setPage(1); setSearchEmail(email.trim()); }
  function clearFilters() { setEmail(''); setSearchEmail(''); setState(''); setAttemptValid(''); setPage(1); }
  const totalPages = Math.max(1, Math.ceil(total / limit));

  async function apagarTeste(trial) {
    if (!trial.email) return;
    if (!window.confirm('Apagar POR COMPLETO o teste gratis de "' + trial.email + '"? Isso remove a licenca de teste (IRP-*), o registro de "ja usou o teste" e o historico ligado a ela. Nao pode ser desfeito. Licencas pagas/cortesia desse e-mail nao sao afetadas.')) return;
    try {
      await api.post('/licenses/admin/reset-trial-claim', { email: trial.email });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao apagar registro de teste.');
    }
  }

  async function limparTentativas() {
    if (!window.confirm('Apagar TODO o historico de uso e tentativas (' + attemptTotal + ' registro(s))? So um log de auditoria, nao afeta nenhuma licenca ativa. Nao pode ser desfeito.')) return;
    try {
      await api.post('/licenses/admin/clear-attempts');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao limpar historico.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin - Licencas IRP</h1>
            <p className="mt-1 text-gray-600">Consulta dos usuarios que ativaram teste gratis, usaram a extensao ou tiveram acesso bloqueado.</p>
          </div>
          <button type="button" onClick={loadData} disabled={loading} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50">
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>

        {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="rounded-lg border bg-white p-4 shadow-sm"><div className="text-sm font-semibold text-gray-500">Testes encontrados</div><div className="mt-2 text-3xl font-bold text-gray-900">{total}</div></div>
          <div className="rounded-lg border bg-white p-4 shadow-sm"><div className="text-sm font-semibold text-gray-500">Ativos na pagina</div><div className="mt-2 text-3xl font-bold text-green-700">{totals.active}</div></div>
          <div className="rounded-lg border bg-white p-4 shadow-sm"><div className="text-sm font-semibold text-gray-500">Vencidos na pagina</div><div className="mt-2 text-3xl font-bold text-yellow-700">{totals.expired}</div></div>
          <div className="rounded-lg border bg-white p-4 shadow-sm"><div className="text-sm font-semibold text-gray-500">Usando em 24h</div><div className="mt-2 text-3xl font-bold text-blue-700">{Number(attemptSummary.activeDevices24h || 0)}</div></div>
          <div className="rounded-lg border bg-white p-4 shadow-sm"><div className="text-sm font-semibold text-gray-500">Bloqueadas 24h</div><div className="mt-2 text-3xl font-bold text-red-700">{Number(attemptSummary.denied24h || 0)}</div></div>
        </section>

        <section className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
          <form onSubmit={applyFilters} className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_180px_180px_auto_auto] md:items-end">
            <div><label className="mb-1 block text-sm font-semibold text-gray-700">Buscar por email</label><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none" placeholder="cliente@email.com" /></div>
            <div><label className="mb-1 block text-sm font-semibold text-gray-700">Status teste</label><select value={state} onChange={(event) => { setState(event.target.value); setPage(1); }} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"><option value="">Todos</option><option value="active">Ativos</option><option value="expired">Vencidos</option></select></div>
            <div><label className="mb-1 block text-sm font-semibold text-gray-700">Tentativas</label><select value={attemptValid} onChange={(event) => setAttemptValid(event.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"><option value="">Todas</option><option value="true">Permitidas</option><option value="false">Bloqueadas</option></select></div>
            <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">Filtrar</button>
            <button type="button" onClick={clearFilters} className="rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">Limpar</button>
          </form>
        </section>

        <section className="mb-6 overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="border-b px-4 py-3"><h2 className="text-lg font-bold text-gray-900">Testes gratis (limite de itens por automacao)</h2><p className="text-sm text-gray-600">Cada teste libera um numero limitado de itens (padrao 11) EM CADA automacao (UASG, Detalhes, Beneficios) separadamente, nao mais um total compartilhado nem um prazo de 24h/1 dia. "Vence em" agora e so uma rede de seguranca (30 dias), raramente o motivo real de bloqueio.</p></div>
          <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
            {['Email','Status','Inicio','Itens usados/limite (por automacao)','Vence em (rede de seguranca)','Ultimo uso','Versao','Dispositivo','Fingerprint','Chave',''].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>)}
          </tr></thead><tbody className="divide-y divide-gray-100 bg-white">
            {loading ? <tr><td colSpan="11" className="px-4 py-8 text-center text-gray-600">Carregando testes IRP...</td></tr> : trials.length === 0 ? <tr><td colSpan="11" className="px-4 py-8 text-center text-gray-600">Nenhum teste encontrado.</td></tr> : trials.map((trial) => (
              <tr key={trial.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{trial.email}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm"><span className={['rounded-full px-2.5 py-1 text-xs font-semibold', statusClass(trial.status)].join(' ')}>{STATUS_LABELS[trial.status] || trial.status || '-'}</span></td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{formatDate(trial.createdAt)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700" title="Cada automacao tem seu proprio limite de itens">{trial.trialItemsLimit != null ? `UASG ${trial.trialItemsUsedUasg ?? 0}/${trial.trialItemsLimit} · Detalhes ${trial.trialItemsUsedDetalhes ?? 0}/${trial.trialItemsLimit} · Beneficios ${trial.trialItemsUsedBeneficios ?? 0}/${trial.trialItemsLimit}` : '-'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{formatDate(trial.expiresAt)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{formatDate(trial.lastSeenAt)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{trial.extensionVersion || '-'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700" title={trial.deviceId || ''}>{shortValue(trial.deviceId)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700" title={trial.clientFingerprint || ''}>{shortValue(trial.clientFingerprint, 18)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700" title={trial.licenseKey || ''}>{maskKey(trial.licenseKey)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm"><button type="button" onClick={() => apagarTeste(trial)} className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50">Apagar</button></td>
              </tr>
            ))}
          </tbody></table></div>
          <div className="flex flex-col gap-3 border-t px-4 py-3 md:flex-row md:items-center md:justify-between"><div className="text-sm text-gray-600">Pagina {page} de {totalPages} - {total} registro{total === 1 ? '' : 's'}</div><div className="flex gap-2"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Anterior</button><button type="button" disabled={page >= totalPages || loading} onClick={() => setPage((current) => current + 1)} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Proxima</button></div></div>
        </section>

        <section className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="border-b px-4 py-3 md:flex md:items-center md:justify-between"><div><h2 className="text-lg font-bold text-gray-900">Uso e tentativas recentes</h2><p className="text-sm text-gray-600">Mostra chamadas permitidas e bloqueadas feitas pela extensao.</p></div><div className="mt-2 flex items-center gap-3 md:mt-0"><div className="text-sm text-gray-600">Total: {attemptTotal} | Permitidas: {Number(attemptSummary.allowed || 0)} | Bloqueadas: {Number(attemptSummary.denied || 0)}</div><button type="button" onClick={limparTentativas} className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Limpar</button></div></div>
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
