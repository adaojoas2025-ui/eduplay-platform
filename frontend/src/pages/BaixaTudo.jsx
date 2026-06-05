import { Link } from 'react-router-dom';
import {
  FiDownload,
  FiShield,
  FiFolder,
  FiRefreshCw,
  FiMousePointer,
  FiMail,
} from 'react-icons/fi';

const features = [
  {
    icon: FiMousePointer,
    title: 'Acionamento manual',
    description: 'O widget abre somente quando o usuario clica no icone da extensao.',
  },
  {
    icon: FiDownload,
    title: 'Downloads organizados',
    description: 'Detecta videos carregados na pagina e envia o download para o Chrome.',
  },
  {
    icon: FiRefreshCw,
    title: 'Fila com retomada',
    description: 'Mantem o progresso de filas por curso, disciplina ou conteudo quando aplicavel.',
  },
  {
    icon: FiFolder,
    title: 'Pastas por aula',
    description: 'Ajuda a salvar arquivos com nomes numerados e pastas mais faceis de localizar.',
  },
];

const permissions = [
  {
    name: 'downloads',
    reason: 'Necessaria para iniciar downloads pelo navegador Chrome.',
  },
  {
    name: 'webRequest',
    reason: 'Usada para identificar requisicoes de midia carregadas na aba ativa.',
  },
  {
    name: 'tabs e activeTab',
    reason: 'Usadas para reconhecer a aba atual e obter informacoes basicas da pagina aberta.',
  },
  {
    name: 'scripting',
    reason: 'Usada para exibir o widget da extensao quando o usuario solicita.',
  },
  {
    name: 'storage',
    reason: 'Usada para salvar preferencia local e progresso de filas no proprio navegador.',
  },
  {
    name: '<all_urls>',
    reason: 'Necessaria para detectar midias em diferentes sites acessados pelo usuario.',
  },
];

export default function BaixaTudo() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-400/30 px-4 py-2 text-sm text-red-100 mb-6">
                <FiDownload />
                Extensao Chrome para download de videos
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                BaixaTudo
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mb-8">
                Uma extensao para detectar videos carregados em paginas web e ajudar o
                usuario a baixar aulas e conteudos autorizados de forma organizada.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:ja.eduplay@gmail.com?subject=Suporte%20BaixaTudo"
                  className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition"
                >
                  <FiMail />
                  Falar com suporte
                </a>
                <Link
                  to="/baixatudo/privacidade"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-lg font-bold hover:bg-white/15 transition"
                >
                  <FiShield />
                  Politica de privacidade
                </Link>
              </div>
            </div>

            <div className="bg-white text-gray-900 rounded-lg shadow-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-red-600 text-white flex items-center justify-center">
                  <FiDownload className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Versao gratuita</h2>
                  <p className="text-gray-600">Preparada para publicacao inicial</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className="font-semibold text-gray-900">Pagina oficial publicada no EducaplayJA</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Uso recomendado</p>
                  <p className="font-semibold text-gray-900">
                    Baixar apenas conteudos proprios ou com permissao de uso.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Privacidade</p>
                  <p className="font-semibold text-gray-900">
                    Sem venda de dados pessoais e sem coleta de senhas ou dados de pagamento.
                  </p>
                </div>
              </div>
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
                  <div className="w-11 h-11 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-4">
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
              O BaixaTudo e uma ferramenta tecnica de apoio ao usuario. A extensao nao
              concede direito sobre conteudos de terceiros, nao remove protecoes de acesso
              e nao deve ser usada para violar direitos autorais, contratos, termos de uso
              de plataformas ou leis aplicaveis.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
              <p className="text-yellow-900 font-semibold mb-2">Antes de baixar</p>
              <p className="text-yellow-800 text-sm leading-relaxed">
                Verifique se voce e dono do conteudo, possui autorizacao do titular ou se
                o download e permitido pela plataforma onde o conteudo esta hospedado.
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
                  <p className="font-mono text-sm text-red-700 mb-2">{permission.name}</p>
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
