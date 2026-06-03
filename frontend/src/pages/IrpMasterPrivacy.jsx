import { Link } from 'react-router-dom';
import { FiFileText, FiLock, FiMail, FiShield, FiTool } from 'react-icons/fi';

export default function IrpMasterPrivacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <FiShield className="text-3xl text-emerald-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Politica de Privacidade da IRP Master
              </h1>
              <p className="text-gray-600">Ultima atualizacao: 03/06/2026</p>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Esta politica explica como a extensao IRP Master trata informacoes ao ser
            usada no navegador Chrome. A extensao faz parte do ecossistema EducaplayJA.
          </p>
        </div>

        <div className="bg-gradient-to-r from-emerald-700 to-gray-950 text-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <FiLock className="text-5xl flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Resumo de privacidade</h2>
              <p className="text-white/90">
                A IRP Master nao vende dados pessoais, nao coleta senhas do Comprasnet,
                nao coleta dados de pagamento e nao envia dados da tela do SIASG para o
                servidor de licencas.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 prose prose-sm max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Dados tratados pela extensao</h2>
          <p className="text-gray-700 mb-4">
            Para funcionar, a extensao pode ler informacoes visiveis nas paginas autorizadas
            do Comprasnet/SIASG e do catalogo oficial, como campos de formulario, tabelas,
            codigos de itens, descricoes, quantidades, unidades e valores informados pelo
            proprio usuario ou carregados por planilha.
          </p>
          <p className="text-gray-700 mb-4">
            Esses dados sao usados localmente para montar planos de preenchimento, apoiar a
            conferencia e executar comandos solicitados pelo usuario.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. Dados que nao coletamos</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Nao coletamos senhas do Comprasnet, SIASG ou EducaplayJA.</li>
            <li>Nao coletamos dados de cartao, PIX ou pagamento.</li>
            <li>Nao vendemos nem alugamos dados pessoais.</li>
            <li>Nao usamos dados da extensao para publicidade comportamental.</li>
            <li>Nao enviamos planilhas, itens ou dados oficiais da tela do SIASG ao servidor de licencas.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Licenca e identificador local</h2>
          <p className="text-gray-700 mb-4">
            Para validar a licenca, a extensao gera um identificador tecnico local do navegador
            chamado <code>deviceId</code>. Esse identificador e enviado ao EducaplayJA junto com
            a chave de licenca e a versao da extensao. Ele nao contem senha, CPF, dados da tela
            do SIASG ou conteudo de planilhas.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. Armazenamento local</h2>
          <p className="text-gray-700 mb-4">
            A extensao usa o armazenamento local do Chrome para salvar configuracoes, estado
            da licenca, plano de automacao, progresso e preferencias do painel. Essas informacoes
            ficam no navegador do usuario e podem ser removidas ao limpar dados da extensao.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Permissoes usadas</h2>
          <div className="space-y-4 mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-mono text-sm text-emerald-700 mb-1">sidePanel</p>
              <p className="text-gray-700">Exibe o painel lateral da extensao no Chrome.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-mono text-sm text-emerald-700 mb-1">storage e unlimitedStorage</p>
              <p className="text-gray-700">Salva configuracoes, plano e estado local da automacao.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-mono text-sm text-emerald-700 mb-1">scripting e tabs</p>
              <p className="text-gray-700">
                Permitem executar comandos nas paginas autorizadas quando o usuario inicia a rotina.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-mono text-sm text-emerald-700 mb-1">clipboardRead</p>
              <p className="text-gray-700">Apoia fluxos de copia/importacao usados pelo painel.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-mono text-sm text-emerald-700 mb-1">cookies</p>
              <p className="text-gray-700">
                Permite identificar cookie de sessao do Comprasnet para chamadas autorizadas
                do proprio usuario. A extensao nao coleta senha.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-mono text-sm text-emerald-700 mb-1">alarms</p>
              <p className="text-gray-700">Mantem verificacoes periodicas de licenca ativa.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. Compartilhamento de dados</h2>
          <p className="text-gray-700 mb-4">
            O servidor de licencas do EducaplayJA recebe somente dados necessarios para ativar
            e validar a licenca, como email do comprador, chave, validade, deviceId e versao
            da extensao. Dados de pagamento sao processados pelo Mercado Pago.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Responsabilidade de uso</h2>
          <p className="text-gray-700 mb-4">
            A IRP Master e uma ferramenta de apoio operacional. O usuario e responsavel por
            revisar todos os dados antes de finalizar atos oficiais, respeitar normas internas,
            legislaçao aplicavel e regras do Comprasnet/SIASG.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">8. Seguranca</h2>
          <p className="text-gray-700 mb-4">
            Recomendamos manter o Chrome atualizado, carregar a extensao apenas de fonte oficial
            e revisar as informacoes antes de executar qualquer automacao em ambiente oficial.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">9. Alteracoes nesta politica</h2>
          <p className="text-gray-700 mb-4">
            Podemos atualizar esta politica para refletir melhorias da extensao, exigencias da
            Chrome Web Store ou mudancas legais. A data de atualizacao sera alterada quando houver
            nova versao.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">10. Contato</h2>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
            <p className="text-gray-900 font-bold mb-3">EducaplayJA - IRP Master</p>
            <div className="space-y-2">
              <p className="text-gray-700 flex items-center gap-2">
                <FiMail className="text-emerald-700" />
                <a href="mailto:ja.eduplay@gmail.com" className="text-emerald-700 font-semibold hover:underline">
                  ja.eduplay@gmail.com
                </a>
              </p>
              <p className="text-gray-700 flex items-center gap-2">
                <FiMail className="text-emerald-700" />
                <a href="mailto:contato@educaplayja.com.br" className="text-emerald-700 font-semibold hover:underline">
                  contato@educaplayja.com.br
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Link to="/irp-master" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-2">
              <FiTool className="text-2xl text-emerald-700" />
              <h3 className="font-bold text-lg">Pagina da IRP Master</h3>
            </div>
            <p className="text-gray-600 text-sm">Conheca a extensao, planos e permissoes.</p>
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
