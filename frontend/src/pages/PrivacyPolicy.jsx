import { Link } from 'react-router-dom';
import { FiShield, FiLock, FiEye, FiFileText, FiMail } from 'react-icons/fi';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FiShield className="text-3xl text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Política de Privacidade</h1>
              <p className="text-gray-600">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <p className="text-gray-700">
            A EDUPLAY respeita sua privacidade e está comprometida em proteger seus dados pessoais.
            Esta política explica como coletamos, usamos e protegemos suas informações.
          </p>
        </div>

        {/* LGPD Badge */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <FiLock className="text-5xl" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Conformidade com a LGPD</h2>
              <p className="text-white/90">
                Esta Política de Privacidade está em conformidade com a Lei Geral de Proteção de Dados
                (Lei nº 13.709/2018) e garante seus direitos sobre seus dados pessoais.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8 prose prose-sm max-w-none">

          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Informações que Coletamos</h2>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">1.1. Dados Fornecidos por Você</h3>
          <p className="text-gray-700 mb-2">Coletamos informações que você fornece diretamente:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li><strong>Dados de Cadastro</strong>: Nome, email, senha, telefone, CPF/CNPJ</li>
            <li><strong>Dados de Perfil</strong>: Foto, biografia, preferências</li>
            <li><strong>Dados de Pagamento</strong>: Processados pelo Mercado Pago (não armazenamos dados de cartão)</li>
            <li><strong>Dados Bancários</strong>: Para vendedores receberem pagamentos (conta bancária, PIX)</li>
            <li><strong>Conteúdo</strong>: Produtos publicados, avaliações, comentários, mensagens</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">1.2. Dados Coletados Automaticamente</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li><strong>Dados de Navegação</strong>: Endereço IP, tipo de navegador, páginas visitadas</li>
            <li><strong>Cookies</strong>: Usamos cookies para melhorar sua experiência</li>
            <li><strong>Dispositivo</strong>: Tipo de dispositivo, sistema operacional</li>
            <li><strong>Localização</strong>: Localização aproximada baseada em IP</li>
            <li><strong>Logs</strong>: Horários de acesso, ações realizadas na plataforma</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">1.3. Dados de Terceiros</h3>
          <p className="text-gray-700 mb-4">
            Recebemos informações de parceiros como Mercado Pago (dados de transações) e Google
            (quando você usa login social).
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. Como Usamos Seus Dados</h2>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">2.1. Finalidades do Processamento</h3>
          <p className="text-gray-700 mb-2">Utilizamos seus dados para:</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="font-semibold text-blue-900 mb-2">✅ Operação da Plataforma</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Criar e gerenciar sua conta</li>
              <li>Processar transações e pagamentos</li>
              <li>Entregar produtos digitais adquiridos</li>
              <li>Fornecer suporte ao cliente</li>
              <li>Prevenir fraudes e garantir segurança</li>
            </ul>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <p className="font-semibold text-green-900 mb-2">📊 Melhoria e Análise</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Analisar uso da plataforma</li>
              <li>Melhorar funcionalidades e experiência</li>
              <li>Desenvolver novos recursos</li>
              <li>Realizar pesquisas e estatísticas</li>
            </ul>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-4">
            <p className="font-semibold text-purple-900 mb-2">📧 Comunicação</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Enviar confirmações de pedidos</li>
              <li>Notificar sobre status de compras</li>
              <li>Informar alterações nos termos</li>
              <li>Enviar newsletters (com seu consentimento)</li>
              <li>Responder solicitações de suporte</li>
            </ul>
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4">
            <p className="font-semibold text-orange-900 mb-2">🎯 Marketing (Opcional)</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Recomendar produtos relevantes</li>
              <li>Enviar promoções e ofertas</li>
              <li>Personalizar anúncios</li>
              <li>Você pode cancelar a qualquer momento</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Base Legal para Processamento</h2>
          <p className="text-gray-700 mb-2">Processamos seus dados com base em:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li><strong>Execução de Contrato</strong>: Para fornecer os serviços da plataforma</li>
            <li><strong>Consentimento</strong>: Para marketing e cookies não essenciais</li>
            <li><strong>Obrigação Legal</strong>: Para cumprimento de leis (ex: retenção fiscal)</li>
            <li><strong>Legítimo Interesse</strong>: Para prevenir fraudes e melhorar serviços</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. Compartilhamento de Dados</h2>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">4.1. Quando Compartilhamos</h3>
          <p className="text-gray-700 mb-2">Podemos compartilhar seus dados com:</p>

          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Mercado Pago</strong>: Para processar pagamentos de forma segura
            </li>
            <li>
              <strong>Vendedores</strong>: Nome e email do comprador para entrega do produto
            </li>
            <li>
              <strong>Provedores de Serviços</strong>: Hospedagem, email, analytics (sob NDA)
            </li>
            <li>
              <strong>Autoridades</strong>: Quando exigido por lei ou ordem judicial
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">4.2. O que NÃO Fazemos</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <ul className="list-none text-gray-800 space-y-2">
              <li>❌ <strong>Nunca vendemos</strong> seus dados para terceiros</li>
              <li>❌ <strong>Não compartilhamos</strong> sem consentimento (exceto quando legalmente obrigados)</li>
              <li>❌ <strong>Não enviamos spam</strong> ou comunicações não solicitadas</li>
              <li>❌ <strong>Não usamos</strong> seus dados para fins não relacionados à plataforma</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Segurança dos Dados</h2>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">5.1. Medidas de Proteção</h3>
          <p className="text-gray-700 mb-2">Implementamos as seguintes medidas de segurança:</p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiLock className="text-blue-600" />
                <h4 className="font-semibold text-blue-900">Criptografia</h4>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• SSL/TLS em todo o site</li>
                <li>• Senhas com hash seguro</li>
                <li>• Dados em trânsito criptografados</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiShield className="text-green-600" />
                <h4 className="font-semibold text-green-900">Controles de Acesso</h4>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Autenticação obrigatória</li>
                <li>• Permissões por função</li>
                <li>• Logs de auditoria</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiEye className="text-purple-600" />
                <h4 className="font-semibold text-purple-900">Monitoramento</h4>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Detecção de atividades suspeitas</li>
                <li>• Sistema antifraude ativo</li>
                <li>• Backups regulares</li>
              </ul>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiFileText className="text-orange-600" />
                <h4 className="font-semibold text-orange-900">Conformidade</h4>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• LGPD compliant</li>
                <li>• PCI-DSS (via Mercado Pago)</li>
                <li>• Auditorias regulares</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">5.2. Suas Responsabilidades</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Mantenha sua senha segura e confidencial</li>
            <li>Não compartilhe credenciais de acesso</li>
            <li>Use senha forte (mínimo 8 caracteres)</li>
            <li>Notifique imediatamente sobre acessos não autorizados</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. Cookies e Tecnologias Similares</h2>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">6.1. O que são Cookies</h3>
          <p className="text-gray-700 mb-4">
            Cookies são pequenos arquivos de texto armazenados no seu dispositivo para melhorar sua
            experiência e fornecer funcionalidades essenciais.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">6.2. Tipos de Cookies Utilizados</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li><strong>Essenciais</strong>: Necessários para o funcionamento da plataforma (login, carrinho)</li>
            <li><strong>Desempenho</strong>: Coletam dados sobre como você usa o site</li>
            <li><strong>Funcionalidade</strong>: Lembram suas preferências</li>
            <li><strong>Marketing</strong>: Usados para publicidade direcionada (com consentimento)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">6.3. Gerenciar Cookies</h3>
          <p className="text-gray-700 mb-4">
            Você pode gerenciar cookies nas configurações do seu navegador. Note que desabilitar
            cookies essenciais pode afetar o funcionamento da plataforma.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Retenção de Dados</h2>
          <p className="text-gray-700 mb-2">Mantemos seus dados pelo tempo necessário para:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Fornecer nossos serviços</li>
            <li>Cumprir obrigações legais e fiscais (até 5 anos)</li>
            <li>Resolver disputas e fazer cumprir acordos</li>
            <li>Prevenir fraudes e abusos</li>
          </ul>

          <p className="text-gray-700 mb-4">
            Após esse período, seus dados são excluídos ou anonimizados de forma segura.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">8. Seus Direitos (LGPD)</h2>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 mb-4">
            <h3 className="text-xl font-semibold text-purple-900 mb-3">Você tem direito a:</h3>
            <ul className="space-y-3 text-gray-800">
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600">📋</span>
                <div>
                  <strong>Confirmação e Acesso</strong>: Saber se processamos seus dados e acessá-los
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600">✏️</span>
                <div>
                  <strong>Correção</strong>: Atualizar dados incompletos, inexatos ou desatualizados
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600">🗑️</span>
                <div>
                  <strong>Exclusão</strong>: Solicitar a eliminação de dados desnecessários ou tratados com base em consentimento
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600">📤</span>
                <div>
                  <strong>Portabilidade</strong>: Receber seus dados em formato estruturado
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600">🚫</span>
                <div>
                  <strong>Oposição</strong>: Opor-se ao tratamento realizado com base em legítimo interesse
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600">⛔</span>
                <div>
                  <strong>Revogação de Consentimento</strong>: Retirar consentimento para marketing e cookies
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600">ℹ️</span>
                <div>
                  <strong>Informação</strong>: Conhecer as entidades com as quais compartilhamos dados
                </div>
              </li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">Como Exercer Seus Direitos</h3>
          <p className="text-gray-700 mb-4">
            Para exercer qualquer desses direitos, entre em contato através dos canais abaixo.
            Responderemos em até 15 dias conforme determina a LGPD.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">9. Transferência Internacional de Dados</h2>
          <p className="text-gray-700 mb-4">
            Seus dados são armazenados em servidores localizados no Brasil. Caso seja necessário
            transferir dados para outros países (ex: serviços de nuvem), garantimos proteção adequada
            conforme LGPD.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">10. Privacidade de Menores</h2>
          <p className="text-gray-700 mb-4">
            Nossa plataforma não é destinada a menores de 18 anos. Não coletamos intencionalmente
            dados de menores. Se identificarmos, excluiremos imediatamente.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">11. Alterações nesta Política</h2>
          <p className="text-gray-700 mb-4">
            Podemos atualizar esta Política periodicamente. Alterações significativas serão comunicadas
            por email ou aviso na plataforma. A versão atualizada entrará em vigor imediatamente após publicação.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">12. Encarregado de Dados (DPO)</h2>
          <p className="text-gray-700 mb-4">
            Nosso Encarregado de Proteção de Dados está disponível para esclarecer dúvidas sobre
            o tratamento de dados pessoais.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">13. Contato</h2>
          <p className="text-gray-700 mb-4">
            Para exercer seus direitos, tirar dúvidas ou fazer reclamações sobre privacidade:
          </p>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
            <p className="text-gray-900 font-bold mb-4">EDUPLAY - Plataforma de Produtos Digitais</p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FiMail className="text-purple-600 text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Email Principal</p>
                  <a href="mailto:ja.eduplay@gmail.com" className="text-purple-600 font-semibold hover:underline">
                    ja.eduplay@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FiMail className="text-purple-600 text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Email Alternativo</p>
                  <a href="mailto:daiannemfarias@gmail.com" className="text-purple-600 font-semibold hover:underline">
                    daiannemfarias@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FiShield className="text-purple-600 text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Privacidade e LGPD</p>
                  <a href="mailto:ja.eduplay@gmail.com" className="text-purple-600 font-semibold hover:underline">
                    ja.eduplay@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <svg className="text-purple-600 w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div>
                  <p className="text-sm text-gray-600">WhatsApp Principal</p>
                  <a href="https://wa.me/5561996272214" className="text-purple-600 font-semibold hover:underline">
                    +55 (61) 99627-2214
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <svg className="text-purple-600 w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div>
                  <p className="text-sm text-gray-600">WhatsApp Alternativo</p>
                  <a href="https://wa.me/5561998086631" className="text-purple-600 font-semibold hover:underline">
                    +55 (61) 99808-6631
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-purple-200">
              <p className="text-sm text-gray-600">
                <strong>Prazo de resposta:</strong> Até 15 dias úteis conforme LGPD
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Ao usar a EDUPLAY, você declara ter lido e compreendido esta Política de Privacidade.
            </p>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Link to="/terms" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-2">
              <FiFileText className="text-2xl text-blue-600" />
              <h3 className="font-bold text-lg">Termos de Uso</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Conheça as regras de uso da plataforma
            </p>
          </Link>

          <Link to="/help" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-2">
              <FiMail className="text-2xl text-green-600" />
              <h3 className="font-bold text-lg">Central de Ajuda</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Tire suas dúvidas sobre a plataforma
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
