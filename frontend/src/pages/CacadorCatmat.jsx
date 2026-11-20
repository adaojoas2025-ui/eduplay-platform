import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_URL } from '../config/api.config';

export default function CacadorCatmat() {
  const [params] = useSearchParams();
  const [plans, setPlans] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    let alive = true;
    fetch(API_URL + '/cacador-catmat/plans').then(async response => {
      const data = await response.json();
      if (!response.ok || !data.success) throw Error('Não foi possível consultar os planos.');
      if (alive) setPlans(data.data);
    }).catch(error => { if (alive) setMessage(error.message); });
    return () => { alive = false; };
  }, []);
  async function checkout(plan) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setMessage('Informe um e-mail válido para receber sua chave.'); return; }
    setBusy(plan); setMessage('Preparando pagamento seguro…');
    try {
      const response = await fetch(API_URL + '/cacador-catmat/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email: email.trim(), name: name.trim(), deviceId: params.get('deviceId') || '' }) });
      const data = await response.json();
      if (!response.ok || !data.success || !data.data?.paymentUrl) throw Error(data.message || 'Não foi possível abrir o pagamento.');
      const url = new URL(data.data.paymentUrl);
      if (url.protocol !== 'https:' || !/(^|\.)mercadopago\.(com|com\.br)$/.test(url.hostname)) throw Error('Endereço de pagamento inválido.');
      window.location.assign(url.href);
    } catch (error) { setMessage(error.message); setBusy(''); }
  }
  return <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-800">
    <div className="mx-auto max-w-5xl">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-800 to-emerald-950 p-8 text-white shadow-xl sm:p-12">
        <div className="flex items-center gap-4"><img src="/cacador-catmat/logo.png" width="64" height="64" alt="" /><span className="rounded-full border border-emerald-400 px-3 py-1 text-xs">CATMAT · Compras públicas</span></div>
        <h1 className="mt-7 text-4xl font-bold">Encontre o material certo.<br />Prepare sua compra com mais clareza.</h1>
        <p className="mt-5 max-w-2xl text-lg text-emerald-100">Caçador de CATMAT: pesquisa por código ou palavra, unidades oficiais, consulta de preços e planilha de itens em uma extensão do Chrome.</p>
        <p className="mt-6 inline-block rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-900">Teste opcional de 24 horas, sem limite de itens</p>
      </div>
      <div className="my-8 grid gap-4 sm:grid-cols-3">{[
        ['Catálogo e unidades', 'Confira descrições, unidades de fornecimento e a situação do material no catálogo.'],
        ['Preços e PDF', 'Consulte preços praticados e organize a pesquisa por unidade.'],
        ['Sua lista pronta', 'Guarde favoritos, monte sua planilha e exporte os itens.']
      ].map(([title, text]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-bold text-emerald-800">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}</div>
      <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <h2 className="text-2xl font-bold">Escolha seu plano</h2>
        <p className="mt-2 text-sm text-slate-600">Já tem uma chave? Ative diretamente na extensão. Não é necessário iniciar o teste.</p>
        {params.get('status') && <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Voltou do pagamento? A aprovação é confirmada pelo Mercado Pago. Abra a extensão e clique em Verificar pagamento. Se necessário, use a chave enviada por e-mail.</p>}
        <div className="my-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Nome (opcional)<input className="mt-2 w-full rounded-xl border p-3 font-normal" maxLength="120" value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></label>
          <label className="text-sm font-semibold">E-mail para receber a licença<input className="mt-2 w-full rounded-xl border p-3 font-normal" type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">{plans ? ['monthly','annual'].map(id => {
          const plan = plans[id];
          return <article key={id} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"><h3 className="font-bold">{plan.label}</h3><p className="my-3 text-3xl font-bold text-emerald-900">{Number(plan.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p><p className="text-sm">{plan.days} dias de acesso · sem limite de itens</p><button disabled={Boolean(busy)} onClick={() => checkout(id)} className="mt-5 w-full rounded-xl bg-emerald-800 p-3 font-semibold text-white disabled:opacity-50">{busy === id ? 'Abrindo pagamento…' : 'Comprar ' + plan.label}</button></article>;
        }) : <p className="py-6 text-slate-600">Consultando planos…</p>}</div>
        <p role="status" aria-live="polite" className="mt-4 text-sm text-amber-800">{message}</p>
        <p className="mt-4 text-xs leading-5 text-slate-500">Pagamento pelo Mercado Pago, uma vez por período contratado. Renovação não automática. O prazo pago começa na aprovação, sem somar o tempo restante do teste. A licença do Caçador é separada de IRP Master e BaixaTudo.</p>
      </section>
      <section className="my-8 rounded-2xl bg-white p-7"><h2 className="text-xl font-bold">Como começar</h2><ol className="ml-5 mt-3 list-decimal space-y-2 text-sm leading-6"><li>Abra o Caçador de CATMAT no Chrome.</li><li>Ative uma chave CMT, compre um plano ou escolha o teste gratuito de 24 horas.</li><li>Após comprar, use Verificar pagamento ou cole a chave recebida por e-mail.</li><li>Em outro PC, use a mesma extensão da loja e o perfil do Chrome com sincronização concluída.</li></ol><p className="mt-4 text-sm">O teste tem prazo único. Ao terminar, as funções do Caçador exigem uma licença válida. Seus favoritos e sua planilha não são apagados.</p></section>
      <footer className="flex flex-wrap gap-5 text-sm text-slate-600"><Link to="/cacador-catmat/privacidade">Política de privacidade</Link><a href="mailto:ja.eduplay@gmail.com">Contato e suporte</a><Link to="/">EducaPlay</Link></footer>
    </div>
  </main>;
}
