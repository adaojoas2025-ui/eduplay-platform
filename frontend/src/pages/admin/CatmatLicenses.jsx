import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
const date = v => v ? new Date(v).toLocaleString('pt-BR') : '—';
const email = v => v && !/@sem-email\.irpmaster\.local$/i.test(v) ? v : 'Não informado';
const masked = v => v ? v.slice(0, 8) + '…' + v.slice(-4) : '—';
export default function CatmatLicenses() {
  const [licenses, setLicenses] = useState([]), [attempts, setAttempts] = useState([]), [summary, setSummary] = useState({});
  const [page, setPage] = useState(1), [attemptPage, setAttemptPage] = useState(1), [total, setTotal] = useState(0), [attemptTotal, setAttemptTotal] = useState(0);
  const [search, setSearch] = useState(''), [filter, setFilter] = useState(''), [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function load() {
    setBusy(true); setError('');
    try {
      const [l, a] = await Promise.all([
        api.get('/cacador-catmat/admin/licenses', { params: { page, limit: 30, email: filter || undefined, status: status || undefined } }),
        api.get('/cacador-catmat/admin/attempts', { params: { page: attemptPage, limit: 30, email: filter || undefined } })
      ]);
      setLicenses(l.data.licenses || []); setTotal(l.data.total || 0);
      setAttempts(a.data.attempts || []); setAttemptTotal(a.data.total || 0); setSummary(a.data.summary || {});
    } catch (e) { setError(e.response?.status === 403 ? 'Área exclusiva do administrador.' : e.response?.data?.message || 'Não foi possível carregar os registros.'); }
    finally { setBusy(false); }
  }
  useEffect(() => { load(); }, [page, attemptPage, filter, status]);
  async function action(id, command) {
    let days;
    if (command === 'renew') { const value = window.prompt('Quantos dias deseja acrescentar?'); if (!value) return; days = Number(value); if (!Number.isInteger(days) || days < 1 || days > 3650) return window.alert('Informe de 1 a 3650 dias.'); }
    if (command === 'free-device' && !window.confirm('Liberar a associação desta licença para uma nova ativação?')) return;
    setBusy(true);
    try { await api.post('/cacador-catmat/admin/licenses/' + id + '/' + command, { days }); await load(); }
    catch (e) { setError(e.response?.data?.message || 'Não foi possível concluir a ação.'); setBusy(false); }
  }
  const pager = (current, count, set) => <div className="flex items-center justify-between border-t p-4 text-sm"><span>Página {current} de {Math.max(1, Math.ceil(count / 30))} · {count} registros</span><span className="flex gap-2"><button disabled={busy || current <= 1} onClick={() => set(current - 1)} className="rounded border px-3 py-2 disabled:opacity-40">Anterior</button><button disabled={busy || current * 30 >= count} onClick={() => set(current + 1)} className="rounded border px-3 py-2 disabled:opacity-40">Próxima</button></span></div>;
  return <main className="min-h-screen bg-slate-50 p-5 text-slate-800"><div className="mx-auto max-w-7xl">
    <header className="my-5 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Caçador de CATMAT — Licenças e usuários</h1><p className="mt-2 text-sm text-slate-600">Registros exclusivos do produto CMT. O e-mail do Chrome pode ser diferente do titular da licença.</p></div><div className="flex gap-3"><Link to="/admin/extensions?product=cacador-catmat" className="rounded-lg bg-emerald-800 p-3 text-sm text-white">Gerar cortesia</Link><button onClick={load} disabled={busy} className="rounded-lg border bg-white p-3 text-sm">Atualizar</button></div></header>
    {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
    <div className="mb-5 grid gap-3 sm:grid-cols-3">{[['Licenças encontradas',total],['E-mails com uso em 24h',summary.activeEmails24h || 0],['Tentativas bloqueadas em 24h',summary.denied24h || 0]].map(([label, value]) => <div key={label} className="rounded-xl border bg-white p-5"><p className="text-sm">{label}</p><strong className="mt-2 block text-3xl text-emerald-800">{value}</strong></div>)}</div>
    <form onSubmit={e => { e.preventDefault(); setPage(1); setAttemptPage(1); setFilter(search.trim()); }} className="mb-5 flex flex-wrap gap-3 rounded-xl border bg-white p-4"><label className="flex-1 text-sm">Buscar e-mail<input value={search} onChange={e => setSearch(e.target.value)} className="mt-1 block w-full rounded border p-2" placeholder="cliente@email.com" /></label><label className="text-sm">Status<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="mt-1 block rounded border p-2"><option value="">Todos</option><option value="active">Ativas</option><option value="expired">Vencidas</option><option value="blocked">Bloqueadas</option><option value="cancelled">Canceladas</option></select></label><button className="self-end rounded bg-emerald-800 px-5 py-2 text-white">Filtrar</button></form>
    <section className="mb-7 overflow-hidden rounded-xl border bg-white"><h2 className="p-4 text-lg font-bold">Licenças, testes de 24h e cortesias</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-100"><tr>{['Titular','Chave','Status','Tipo','Vencimento','Último uso','Ações'].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{licenses.map(l => <tr key={l.id} className="border-t"><td className="p-3">{email(l.email)}</td><td className="p-3"><code>{l.licenseKey}</code></td><td className="p-3">{l.status}</td><td className="p-3">{l.notes?.includes('free trial') ? 'Teste 24h' : l.notes?.includes('source:courtesy') ? 'Cortesia' : 'Paga / administrativa'}</td><td className="whitespace-nowrap p-3">{date(l.expiresAt)}</td><td className="whitespace-nowrap p-3">{date(l.lastSeenAt)}</td><td className="p-3"><div className="flex gap-2"><button disabled={busy} onClick={() => action(l.id, l.status === 'blocked' ? 'unblock' : 'block')} className="rounded border px-2 py-1">{l.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}</button><button disabled={busy} onClick={() => action(l.id,'renew')} className="rounded border px-2 py-1">Renovar</button><button disabled={busy} onClick={() => action(l.id,'free-device')} className="whitespace-nowrap rounded border px-2 py-1">Liberar instalação</button></div></td></tr>)}{!licenses.length && <tr><td colSpan="7" className="p-6 text-center">{busy ? 'Carregando…' : 'Nenhuma licença encontrada.'}</td></tr>}</tbody></table></div>{pager(page,total,setPage)}</section>
    <section className="overflow-hidden rounded-xl border bg-white"><h2 className="p-4 text-lg font-bold">Uso e tentativas — e-mails identificados</h2><p className="px-4 pb-4 text-xs text-slate-500">São chamadas registradas de licença. Conta Chrome é informada pela extensão quando disponível; não é autenticação Google verificada. Dados anteriores sem e-mail não são identificados retroativamente.</p><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-100"><tr>{['Quando','Titular da licença','Conta Chrome','Resultado','Ação','Motivo','Versão','Vencimento','Dias','Chave'].map(h => <th key={h} className="whitespace-nowrap p-3">{h}</th>)}</tr></thead><tbody>{attempts.map(a => <tr key={a.id} className="border-t"><td className="whitespace-nowrap p-3">{date(a.createdAt)}</td><td className="p-3">{email(a.licenseEmail)}</td><td className="p-3">{email(a.chromeProfileEmail)}</td><td className="p-3">{a.valid ? 'Permitida' : 'Bloqueada'}</td><td className="p-3">{a.action}</td><td className="p-3">{a.reason || '—'}</td><td className="p-3">{a.extensionVersion || '—'}</td><td className="whitespace-nowrap p-3">{date(a.licenseExpiresAt)}</td><td className="p-3">{a.daysRemaining ?? '—'}</td><td className="p-3">{masked(a.licenseKey)}</td></tr>)}{!attempts.length && <tr><td colSpan="10" className="p-6 text-center">{busy ? 'Carregando…' : 'Nenhum uso registrado.'}</td></tr>}</tbody></table></div>{pager(attemptPage,attemptTotal,setAttemptPage)}</section>
  </div></main>;
}
