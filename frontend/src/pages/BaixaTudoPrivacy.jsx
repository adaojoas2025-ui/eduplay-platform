import { Link } from 'react-router-dom';
import { FiShield, FiLock, FiDownload, FiMail, FiFileText } from 'react-icons/fi';

export default function BaixaTudoPrivacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <FiShield className="text-3xl text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Politica de Privacidade do BaixaTudo
              </h1>
              <p className="text-gray-600">Ultima atualizacao: 26/05/2026</p>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Esta politica explica como a extensao BaixaTudo trata informacoes ao ser
            usada no navegador Chrome. A extensao faz parte do ecossistema EducaplayJA.
          </p>
        </div>

        <div className="bg-gradient-to-r from-red-600 to-gray-900 text-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <FiLock className="text-5xl flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Resumo de privacidade</h2>
              <p className="text-white/90">
                O BaixaTudo nao vende dados pessoais, nao coleta senhas, nao coleta
                dados de pagamento e nao envia o historico de navegacao para nossos servidores.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 prose prose-sm max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Dados tratados pela extensao</h2>
          <p className="text-gray-700 mb-4">
            Para funcionar, a extensao pode identificar informacoes tecnicas da aba ativa,
            como titulo da pagina, URLs de midia carregadas na pagina e status de downloads.
            Esses dados sao usados para exibir opcoes de download e organizar nomes de arquivos.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. Dados que nao coletamos</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Nao coletamos senhas.</li>
            <li>Nao coletamos dados de cartao, PIX ou pagamento.</li>
            <li>Nao coletamos documentos pessoais.</li>
            <li>Nao vendemos nem alugamos dados pessoais.</li>
            <li>Nao usamos os dados da extensao para publicidade comportamental.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Armazenamento local</h2>
          <p className="text-gray-700 mb-4">
            A extensao usa o armazenamento local do Chrome para salvar preferencias e progresso
            de filas, como aulas ja baixadas ou pendentes. Essas informacoes ficam no navegador
            do usuario e podem ser removidas ao limpar dados da extensao no Chrome.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. Permissoes usadas</h2>
          <div className="space-y-4 mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-mono text-sm text-red-700 mb-1">webRequest</p>
              <p className="text-gray-700">
                Permite detectar requisicoes de video e midia carregadas pela pagina.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-mono text-sm text-red-700 mb-1">downloads</p>
              <p className="text-gray-700">
                Permite iniciar e acompanhar downloads solicitados pelo usuario.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-mono text-sm text-red-700 mb-1">tabs, activeTab e scripting</p>
              <p className="text-gray-700">
                Permitem identificar a aba ativa e inserir o widget da extensao quando o usuario
                clica no icone.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-mono text-sm text-red-700 mb-1">storage</p>
              <p className="text-gray-700">
                Permite salvar configuracoes e progresso localmente no navegador.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-mono text-sm text-red-700 mb-1">&lt;all_urls&gt;</p>
              <p className="text-gray-700">
                Permite que a extensao funcione em diferentes sites onde o usuario decide usa-la.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Compartilhamento de dados</h2>
          <p className="text-gray-700 mb-4">
            A extensao nao envia URLs de video, titulos de paginas, historico de navegacao ou
            progresso de downloads para servidores do EducaplayJA por padrao. Caso uma versao
            futura inclua recursos de conta, sincronizacao ou licenca, esta politica sera atualizada
            antes da ativacao desses recursos.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. Uso responsavel e direitos autorais</h2>
          <p className="text-gray-700 mb-4">
            O BaixaTudo deve ser usado somente para baixar conteudos proprios, conteudos com
            autorizacao do titular ou conteudos cujo download seja permitido pela plataforma de origem.
            O usuario e responsavel por respeitar direitos autorais, contratos e termos de uso.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Seguranca</h2>
          <p className="text-gray-700 mb-4">
            A extensao foi projetada para abrir o widget apenas mediante acao do usuario e para
            manter dados operacionais no ambiente local do navegador. Recomendamos manter o Chrome
            atualizado e instalar a extensao somente pela Chrome Web Store oficial.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">8. Alteracoes nesta politica</h2>
          <p className="text-gray-700 mb-4">
            Podemos atualizar esta politica para refletir melhorias da extensao, exigencias da
            Chrome Web Store ou mudancas legais. A data de atualizacao sera alterada quando houver
            nova versao.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">9. Contato</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-5">
            <p className="text-gray-900 font-bold mb-3">EducaplayJA - BaixaTudo</p>
            <div className="space-y-2">
              <p className="text-gray-700 flex items-center gap-2">
                <FiMail className="text-red-600" />
                <a href="mailto:ja.eduplay@gmail.com" className="text-red-700 font-semibold hover:underline">
                  ja.eduplay@gmail.com
                </a>
              </p>
              <p className="text-gray-700 flex items-center gap-2">
                <FiMail className="text-red-600" />
                <a href="mailto:contato@educaplayja.com.br" className="text-red-700 font-semibold hover:underline">
                  contato@educaplayja.com.br
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Link to="/baixatudo" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-2">
              <FiDownload className="text-2xl text-red-600" />
              <h3 className="font-bold text-lg">Pagina do BaixaTudo</h3>
            </div>
            <p className="text-gray-600 text-sm">Conheca a extensao e suas permissoes.</p>
          </Link>

          <Link to="/privacy" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-2">
              <FiFileText className="text-2xl text-purple-600" />
              <h3 className="font-bold text-lg">Privacidade do EducaplayJA</h3>
            </div>
            <p className="text-gray-600 text-sm">Veja a politica geral da plataforma.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
