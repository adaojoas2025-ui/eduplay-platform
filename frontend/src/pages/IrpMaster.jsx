import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  FiCheckCircle,
  FiClipboard,
  FiCreditCard,
  FiFileText,
  FiLock,
  FiMail,
  FiShield,
  FiZap,
} from 'react-icons/fi';

const API_BASE = 'https://eduplay-backend-yw7z.onrender.com/api/v1';

const features = [
  {
    icon: FiClipboard,
    title: 'Preenchimento assistido',
    description: 'Ajuda a reduzir tarefas repetitivas nas rotinas de IRP do Comprasnet SIASG.',
  },
  {
    icon: FiFileText,
    title: 'Planilhas e lotes',
    description: 'Apoia a importacao, organizacao e conferencia dos dados antes da execucao.',
  },
  {
    icon: FiZap,
    title: 'Automacao acionada pelo usuario',
    description: 'O usuario inicia os comandos no painel e acompanha o progresso da operacao.',
  },
  {
    icon: FiShield,
    title: 'Licenca por dispositivo',
    description: 'A ativacao e validada pelo EducaplayJA sem coletar dados da tela do SIASG.',
  },
];

const permissions = [
  {
    name: 'sidePanel',
    reason: 'Exibe o painel lateral da extensao no Chrome.',
  },
  {
    name: 'storage e unlimitedStorage',
    reason: 'Salva configuracoes, plano de automacao e estado local no navegador.',
  },
  {
    name: 'scripting e tabs',
    reason: 'Permite executar comandos nas paginas autorizadas do Comprasnet quando o usuario solicita.',
  },
  {
    name: 'clipboardRead',
    reason: 'Apoia fluxos de copia/importacao usados pelo painel da extensao.',
  },
  {
    name: 'cookies',
    reason: 'Lê cookie de sessao do Comprasnet para chamadas autorizadas do proprio usuario.',
  },
  {
    name: 'alarms',
    reason: 'Mantem verificacoes periodicas de licenca ativa no navegador.',
  },
];

const plans = [
  { id: 'monthly', label: 'Mensal', price: 'R$ 50,00', detail: 'Validade de 30 dias.' },
  { id: 'annual', label: 'Anual', price: 'R$ 239,90', detail: 'Validade de 365 dias.' },
];

export default function IrpMaster() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const deviceId = params.get('deviceId') || '';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('neutral');
  const [loadingPlan, setLoadingPlan] = useState('');

  async function startCheckout(plan) {
    if (!email.trim()) {
      setStatus('Informe o email para receber a licenca.');
      setStatusType('error');
      return;
    }

    setLoadingPlan(plan);
    setStatus('Criando checkout seguro...');
    setStatusType('neutral');

    try {
      const response = await fetch(`${API_BASE}/irp-master/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          name: name.trim(),
          email: email.trim(),
          deviceId,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.data?.paymentUrl) {
        throw new Error(data.message || 'Nao foi possivel criar o checkout.');
      }
      window.location.href = data.data.paymentUrl;
    } catch (error) {
      setStatus(error.message || 'Erro ao criar checkout.');
      setStatusType('error');
      setLoadingPlan('');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-emerald-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-300/30 px-4 py-2 text-sm text-emerald-100 mb-6">
                <FiClipboard />
                Extensao Chrome para rotinas de IRP
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                IRP Master
              </h1>
              <p className="text-xl text-emerald-50/80 leading-relaxed max-w-2xl mb-8">
                Assistente de automacao para apoiar preenchimentos repetitivos no
                Comprasnet SIASG, com fluxo de licenca pelo EducaplayJA.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:ja.eduplay@gmail.com?subject=Suporte%20IRP%20Master"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition"
                >
                  <FiMail />
                  Falar com suporte
                </a>
                <Link
                  to="/irp-master/privacidade"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-lg font-bold hover:bg-white/15 transition"
                >
                  <FiLock />
                  Politica de privacidade
                </Link>
              </div>
            </div>

            <div className="bg-white text-gray-900 rounded-lg shadow-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <FiCheckCircle className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">IRP Master Pro</h2>
                  <p className="text-gray-600">Licenca mensal ou anual</p>
                </div>
              </div>

              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                placeholder="Seu nome"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email para receber a licenca</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="grid sm:grid-cols-2 gap-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                    <p className="text-lg font-bold text-gray-900">{plan.label}</p>
                    <p className="text-3xl font-extrabold text-emerald-700 my-2">{plan.price}</p>
                    <p className="text-sm text-gray-600 mb-4">{plan.detail}</p>
                    <button
                      type="button"
                      disabled={loadingPlan === plan.id}
                      onClick={() => startCheckout(plan.id)}
                      className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-lg px-4 py-2 font-bold hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <FiCreditCard />
                      {loadingPlan === plan.id ? 'Criando...' : 'Comprar'}
                    </button>
                  </div>
                ))}
              </div>

              {status && (
                <p className={`mt-4 text-sm font-semibold ${statusType === 'error' ? 'text-red-700' : 'text-gray-700'}`}>
                  {status}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                    <Icon className="text-xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Uso responsavel</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              A IRP Master e uma ferramenta tecnica de apoio. Ela nao substitui revisao
              humana, conferencia juridica, responsabilidade administrativa ou validacao
              dos dados antes de finalizar atos oficiais no SIASG.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
              <p className="text-amber-900 font-semibold mb-2">Antes de executar</p>
              <p className="text-amber-800 text-sm leading-relaxed">
                Revise planilhas, quantidades, valores, CATMAT/CATSER, unidades e demais
                informacoes oficiais. O usuario continua responsavel pelos dados incluidos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Permissoes da extensao</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {permissions.map((permission) => (
                <div key={permission.name} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-mono text-sm text-emerald-700 mb-2">{permission.name}</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{permission.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
