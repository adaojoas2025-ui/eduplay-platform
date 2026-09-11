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
              <p className="text-gray-600">Ultima atualizacao: 11/09/2026</p>
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

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Como processamos os dados (finalidade)</h2>
          <p className="text-gray-700 mb-4">
            Os dados descritos na secao 1 sao processados exclusivamente no navegador do proprio
            usuario (client-side), para: (a) localizar campos e tabelas nas paginas do Comprasnet/SIASG
            e do Novo Portal de Compras; (b) montar o plano de preenchimento a partir da planilha
            carregada pelo usuario; (c) executar, passo a passo, os comandos de preenchimento
            solicitados pelo usuario; e (d) gerar o relatorio de conferencia exibido no proprio
            painel. A extensao nao processa esses dados em nenhum servidor externo — o conteudo de
            licitacoes, itens, planilhas e valores nunca sai do navegador do usuario.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. Dados enviados ao servidor de licencas (ativacao e teste gratis)</h2>
          <p className="text-gray-700 mb-4">
            Separado do processamento local da secao 3, a extensao se comunica com o servidor de
            licencas do EducaplayJA (<code>eduplay-backend-yw7z.onrender.com</code>) apenas para
            ativar/validar a licenca e controlar o uso do teste gratis. Os campos enviados nessas
            chamadas sao:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li><code>deviceId</code>: identificador tecnico gerado localmente no navegador na primeira vez que a extensao roda. Fica salvo tanto no armazenamento local do Chrome quanto no armazenamento sincronizado (<code>chrome.storage.sync</code>), entao reinstalar a extensao na mesma conta Google/Chrome recupera o mesmo id. Nao contem CPF, nome ou senha.</li>
            <li><code>fingerprint tecnico do navegador</code> (campo <code>clientFingerprint</code>): enviado uma unica vez, apenas ao solicitar o teste gratis, para dificultar a criacao de multiplas contas de teste no mesmo computador. E um hash (SHA-256) calculado a partir de caracteristicas do navegador — fuso horario, resolucao e profundidade de cor da tela, user agent, idioma(s), numero de nucleos de CPU e memoria aproximados informados pelo navegador. Nao identifica a pessoa por nome/CPF, nao e usado para rastreamento em outros sites e nao e compartilhado com terceiros de publicidade.</li>
            <li><code>chave de licenca</code> e <code>email do comprador</code>: apenas quando o usuario ativa uma licenca paga ou informa email ao pedir o teste gratis (o email e opcional no teste gratis).</li>
            <li><code>versao da extensao</code>: usada para checar compatibilidade e suporte.</li>
            <li><code>runId</code>: um identificador aleatorio gerado a cada execucao de uma automacao, usado so para evitar contar o mesmo processamento duas vezes.</li>
            <li><code>flow</code>: qual das automacoes foi executada (UASG Local/Quantidade, Detalhes do Item ou Beneficios ME/EPP) — nao contem dados da licitacao.</li>
            <li><code>contractId</code>: o numero identificador da licitacao/contratacao, extraido do parametro <code>id</code> da propria URL do Novo Portal de Compras. E usado somente para aplicar o limite de itens do teste gratis por licitacao, e nao inclui descricao, valores, itens ou qualquer outro conteudo da licitacao.</li>
            <li><code>quantidade de itens processados</code>: um numero (contador), usado so para controlar quantos itens do limite gratuito ja foram usados.</li>
          </ul>
          <p className="text-gray-700 mb-4">
            Nenhuma dessas chamadas envia planilhas, descricoes de itens, valores, dados de
            fornecedores ou qualquer outro conteudo visivel na tela do SIASG/Novo Portal — ver
            tambem a secao 2 ("Dados que nao coletamos").
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Armazenamento e retencao de dados</h2>
          <p className="text-gray-700 mb-4">
            <strong>No navegador do usuario:</strong> a extensao usa o armazenamento local do Chrome
            (<code>chrome.storage</code>) para guardar configuracoes, estado da licenca, plano de
            automacao, progresso e preferencias do painel. Esses dados ficam apenas no computador do
            usuario e sao removidos ao desinstalar a extensao ou limpar os dados dela pelo
            <code>chrome://extensions</code>.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>No servidor do EducaplayJA:</strong> os campos listados na secao 4 (deviceId,
            chave de licenca, email quando informado, contadores de uso do teste gratis por
            automacao/licitacao) ficam armazenados em banco de dados enquanto a licenca ou o periodo
            de teste gratuito estiverem vigentes, e por um periodo adicional de ate 12 meses apos o
            ultimo uso, para fins de suporte, auditoria e prevencao de fraude no teste gratuito. Apos
            esse periodo, ou a pedido do usuario (secao 8), os dados sao apagados ou anonimizados.
            Dados de pagamento nao ficam armazenados pelo EducaplayJA — sao processados diretamente
            pelo Mercado Pago (secao 7).
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. Permissoes usadas</h2>
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
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-mono text-sm text-emerald-700 mb-1">debugger</p>
              <p className="text-gray-700">
                Usado apenas em campos especificos do proprio Comprasnet/Novo Portal que nao aceitam
                digitacao simulada comum, para simular digitacao real dentro da aba do usuario. Nao e
                usado para capturar dados de outras abas ou sites.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Compartilhamento de dados com terceiros</h2>
          <p className="text-gray-700 mb-4">
            O EducaplayJA nao vende nem aluga dados a terceiros. Os unicos compartilhamentos que
            existem sao operacionais, necessarios para o funcionamento do produto:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li><strong>Mercado Pago:</strong> processa o pagamento da licenca. Dados de cartao/PIX sao inseridos diretamente na plataforma do Mercado Pago — o EducaplayJA nao tem acesso a eles.</li>
            <li><strong>Render (hospedagem):</strong> o servidor de licencas do EducaplayJA e hospedado na Render, que armazena os dados do banco descritos na secao 5 em nome do EducaplayJA, sob as politicas de seguranca da propria Render.</li>
          </ul>
          <p className="text-gray-700 mb-4">
            Nao usamos os dados da extensao para publicidade, nao os compartilhamos com corretores de
            dados (data brokers) e nao existe nenhuma ferramenta de analytics ou rastreamento de
            terceiros embutida na extensao.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">8. Seus direitos sobre os dados (LGPD)</h2>
          <p className="text-gray-700 mb-4">
            Como usuario no Brasil, voce tem direito, nos termos da Lei Geral de Protecao de Dados
            (Lei 13.709/2018), a solicitar a qualquer momento: confirmacao de quais dados seus
            tratamos, acesso a esses dados, correcao de dados incompletos ou desatualizados,
            anonimizacao ou exclusao dos dados armazenados no servidor do EducaplayJA, e a
            portabilidade dos dados a outro fornecedor, quando aplicavel. Para exercer qualquer um
            desses direitos, entre em contato pelos emails da secao 12 — respondemos em ate 15 dias
            uteis. A base legal para o tratamento descrito na secao 4 e a execucao do contrato de
            licenca (quando ha compra) e o legitimo interesse do EducaplayJA em controlar o uso do
            periodo de teste gratuito e prevenir fraude.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">9. Responsabilidade de uso</h2>
          <p className="text-gray-700 mb-4">
            A IRP Master e uma ferramenta de apoio operacional. O usuario e responsavel por
            revisar todos os dados antes de finalizar atos oficiais, respeitar normas internas,
            legislaçao aplicavel e regras do Comprasnet/SIASG.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">10. Seguranca</h2>
          <p className="text-gray-700 mb-4">
            Recomendamos manter o Chrome atualizado, carregar a extensao apenas de fonte oficial
            e revisar as informacoes antes de executar qualquer automacao em ambiente oficial. As
            chamadas ao servidor de licencas usam conexao HTTPS.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">11. Alteracoes nesta politica</h2>
          <p className="text-gray-700 mb-4">
            Podemos atualizar esta politica para refletir melhorias da extensao, exigencias da
            Chrome Web Store ou mudancas legais. A data de atualizacao sera alterada quando houver
            nova versao.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">12. Contato</h2>
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
