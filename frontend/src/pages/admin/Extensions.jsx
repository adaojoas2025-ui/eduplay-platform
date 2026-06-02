import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const UNIT_OPTIONS = [
  { value: 'hours', label: 'Horas' },
  { value: 'days', label: 'Dias' },
  { value: 'months', label: 'Meses' },
  { value: 'years', label: 'Anos' },
];

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

export default function AdminExtensions() {
  const [extensions, setExtensions] = useState([]);
  const [selectedId, setSelectedId] = useState('baixatudo');
  const [form, setForm] = useState({
    email: '',
    durationValue: 30,
    durationUnit: 'days',
    reason: '',
    sendEmail: true,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadExtensions();
  }, []);

  const selectedExtension = useMemo(
    () => extensions.find((item) => item.id === selectedId),
    [extensions, selectedId]
  );

  async function loadExtensions() {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/extensions');
      const items = response.data?.data || [];
      setExtensions(items);
      if (items.length > 0 && !items.some((item) => item.id === selectedId)) {
        setSelectedId(items[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erro ao carregar extensoes.');
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post(`/admin/extensions/${selectedId}/courtesy-licenses`, {
        email: form.email,
        durationValue: Number(form.durationValue),
        durationUnit: form.durationUnit,
        reason: form.reason,
        sendEmail: form.sendEmail,
      });
      setResult(response.data?.data);
      setForm((current) => ({
        ...current,
        email: '',
        reason: '',
      }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erro ao gerar cortesia.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin - Extensoes</h1>
          <p className="text-gray-600 mt-1">
            Gestao administrativa de extensoes. Este painel nao pertence ao financeiro do vendedor.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-600">
            Carregando extensoes...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <aside className="bg-white rounded-lg shadow-sm border p-4 h-fit">
              <h2 className="font-semibold text-gray-900 mb-3">Extensoes</h2>
              <div className="space-y-2">
                {extensions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full text-left rounded-md border px-4 py-3 transition ${
                      selectedId === item.id
                        ? 'border-purple-500 bg-purple-50 text-purple-800'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-xs mt-1">Prefixo {item.licensePrefix}</div>
                  </button>
                ))}
              </div>
            </aside>

            <main className="lg:col-span-2 space-y-6">
              <section className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedExtension?.name || 'Extensao'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Cortesia gera ou renova uma licenca com prefixo {selectedExtension?.licensePrefix}.
                    </p>
                  </div>
                  {selectedExtension?.publicPage && (
                    <a
                      href={selectedExtension.publicPage}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                    >
                      Pagina publica
                    </a>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Email do usuario
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(event) => updateField('email', event.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none"
                      placeholder="usuario@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Prazo
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={form.durationValue}
                        onChange={(event) => updateField('durationValue', event.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Unidade
                      </label>
                      <select
                        value={form.durationUnit}
                        onChange={(event) => updateField('durationUnit', event.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none"
                      >
                        {UNIT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Motivo da cortesia
                    </label>
                    <textarea
                      required
                      minLength={5}
                      value={form.reason}
                      onChange={(event) => updateField('reason', event.target.value)}
                      className="min-h-[96px] w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none"
                      placeholder="Exemplo: presente, suporte, teste interno, parceria ou avaliador."
                    />
                  </div>

                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.sendEmail}
                      onChange={(event) => updateField('sendEmail', event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Enviar email automatico com a chave e validade
                  </label>

                  <button
                    type="submit"
                    disabled={submitting || !selectedExtension}
                    className="rounded-md bg-purple-600 px-5 py-2.5 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                  >
                    {submitting ? 'Gerando...' : 'Gerar cortesia'}
                  </button>
                </form>
              </section>

              {result && (
                <section className="bg-green-50 rounded-lg border border-green-200 p-6">
                  <h2 className="text-lg font-bold text-green-900 mb-3">
                    Licenca cortesia pronta
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="block text-green-700 font-semibold">Email</span>
                      <span className="text-green-950">{result.email}</span>
                    </div>
                    <div>
                      <span className="block text-green-700 font-semibold">Validade</span>
                      <span className="text-green-950">{formatDate(result.expiresAt)}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="block text-green-700 font-semibold">Chave</span>
                      <code className="mt-1 block rounded bg-white px-3 py-2 text-green-950 border border-green-200">
                        {result.licenseKey}
                      </code>
                    </div>
                    <div>
                      <span className="block text-green-700 font-semibold">Status</span>
                      <span className="text-green-950">
                        {result.renewed ? 'Renovada' : 'Criada'} - {result.emailSent ? 'email enviado' : 'email nao enviado'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-green-700 font-semibold">Prazo</span>
                      <span className="text-green-950">{result.duration?.label}</span>
                    </div>
                  </div>
                </section>
              )}

              <section className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Regras de seguranca</h2>
                <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                  <li>Cortesia nao substitui venda pelo Mercado Pago.</li>
                  <li>O motivo e registrado nas notas da licenca.</li>
                  <li>Se o email ja tiver uma licenca BT, ela e renovada.</li>
                  <li>A extensao nao gera cortesia e nao recebe senha administrativa.</li>
                </ul>
              </section>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
