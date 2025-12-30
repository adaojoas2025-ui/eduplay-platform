import { Link } from 'react-router-dom';
import { FiFileText, FiShield, FiMail } from 'react-icons/fi';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiFileText className="text-3xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Termos de Uso</h1>
              <p className="text-gray-600">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <p className="text-gray-700">
            Ao utilizar a plataforma EDUPLAY, você concorda com os termos descritos abaixo. Leia atentamente.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8 prose prose-sm max-w-none">

          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
          <p className="text-gray-700 mb-4">
            Ao acessar e usar a EDUPLAY ("Plataforma"), você concorda em cumprir e estar vinculado a estes Termos de Uso.
            Se você não concorda com estes termos, não deve usar a Plataforma.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. Definições</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li><strong>Plataforma</strong>: Site e serviços oferecidos pela EDUPLAY</li>
            <li><strong>Usuário</strong>: Qualquer pessoa que acesse a Plataforma</li>
            <li><strong>Comprador</strong>: Usuário que adquire produtos digitais na Plataforma</li>
            <li><strong>Produtor/Vendedor</strong>: Usuário que comercializa produtos digitais na Plataforma</li>
            <li><strong>Produto</strong>: Conteúdo digital comercializado (cursos, ebooks, apps, etc.)</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Cadastro e Conta de Usuário</h2>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">3.1. Criação de Conta</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Você deve ter pelo menos 18 anos para criar uma conta</li>
            <li>Informações fornecidas devem ser verdadeiras, precisas e atualizadas</li>
            <li>Você é responsável por manter a confidencialidade de sua senha</li>
            <li>Não é permitido ter múltiplas contas</li>
            <li>Contas podem ser suspensas por violação dos termos</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">3.2. Responsabilidades do Usuário</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Manter suas credenciais de acesso seguras</li>
            <li>Notificar imediatamente sobre uso não autorizado</li>
            <li>Não compartilhar ou vender sua conta</li>
            <li>Usar a Plataforma apenas para fins legais</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. Compra de Produtos</h2>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">4.1. Processo de Compra</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Todas as compras são processadas via Mercado Pago</li>
            <li>Preços estão sujeitos a alteração sem aviso prévio</li>
            <li>A confirmação da compra será enviada por email</li>
            <li>Acesso ao produto é concedido após aprovação do pagamento</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">4.2. Formas de Pagamento</h3>
          <p className="text-gray-700 mb-4">
            Aceitamos: PIX, Cartão de Crédito e Boleto Bancário. Parcelamento disponível conforme condições do Mercado Pago.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">4.3. Garantia e Reembolso</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Garantia de 7 dias para todos os produtos digitais</li>
            <li>Reembolso de 100% do valor pago dentro do prazo</li>
            <li>Após 7 dias, não há direito a reembolso</li>
            <li>Produtos com uso excessivo podem ter reembolso negado</li>
            <li>Prazo de devolução: 5-10 dias úteis conforme método de pagamento</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Venda de Produtos</h2>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">5.1. Requisitos para Vendedores</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Cadastro completo com CPF ou CNPJ</li>
            <li>Dados bancários válidos para recebimento</li>
            <li>Responsabilidade sobre qualidade do produto</li>
            <li>Cumprir prazos de entrega e suporte</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">5.2. Conteúdo Permitido</h3>
          <p className="text-gray-700 mb-2"><strong>✅ Permitido:</strong></p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
            <li>Cursos online e materiais educacionais</li>
            <li>E-books e audiobooks originais</li>
            <li>Software e aplicativos</li>
            <li>Templates, designs e artes</li>
            <li>Mentorias e consultorias</li>
          </ul>

          <p className="text-gray-700 mb-2"><strong>❌ Proibido:</strong></p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
            <li>Conteúdo pirata ou com direitos autorais de terceiros</li>
            <li>Material adulto, ofensivo ou ilegal</li>
            <li>Produtos físicos</li>
            <li>Esquemas de pirâmide ou fraudes</li>
            <li>Conteúdo que viole direitos de terceiros</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">5.3. Taxas e Comissões</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Taxa da plataforma: 3% sobre cada venda</li>
            <li>Período de garantia: 7 dias antes da liberação</li>
            <li>Saque via PIX ou TED sem custos adicionais</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. Propriedade Intelectual</h2>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">6.1. Conteúdo da Plataforma</h3>
          <p className="text-gray-700 mb-4">
            Todo conteúdo da EDUPLAY (design, código, logos, marcas) é protegido por direitos autorais e
            propriedade intelectual. É proibida a reprodução sem autorização.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">6.2. Conteúdo do Usuário</h3>
          <p className="text-gray-700 mb-4">
            Vendedores garantem ser proprietários ou ter autorização para comercializar seus produtos.
            Ao fazer upload, você concede à EDUPLAY licença para hospedar, distribuir e promover seu conteúdo.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Privacidade e Proteção de Dados</h2>
          <p className="text-gray-700 mb-4">
            Respeitamos sua privacidade. Consulte nossa <Link to="/privacy" className="text-blue-600 hover:underline">Política de Privacidade</Link> para
            entender como coletamos, usamos e protegemos seus dados pessoais.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">8. Proibições e Conduta do Usuário</h2>
          <p className="text-gray-700 mb-2">É expressamente proibido:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Violar direitos de terceiros</li>
            <li>Publicar conteúdo falso, enganoso ou fraudulento</li>
            <li>Realizar ataques, hacking ou tentativas de invasão</li>
            <li>Usar bots, scripts ou automações não autorizadas</li>
            <li>Manipular avaliações ou classificações</li>
            <li>Assediar, ameaçar ou difamar outros usuários</li>
            <li>Revender produtos sem autorização</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">9. Suspensão e Encerramento de Conta</h2>
          <p className="text-gray-700 mb-4">
            A EDUPLAY se reserva o direito de suspender ou encerrar contas que violem estes termos,
            sem aviso prévio e sem reembolso de taxas pagas.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">Motivos para Suspensão:</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Violação dos Termos de Uso</li>
            <li>Atividades fraudulentas</li>
            <li>Múltiplas reclamações de clientes</li>
            <li>Venda de conteúdo ilegal ou pirateado</li>
            <li>Comportamento abusivo</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">10. Limitação de Responsabilidade</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>A EDUPLAY atua como intermediadora entre compradores e vendedores</li>
            <li>Não nos responsabilizamos pela qualidade do conteúdo vendido</li>
            <li>Não garantimos disponibilidade ininterrupta da Plataforma</li>
            <li>Não somos responsáveis por danos indiretos ou lucros cessantes</li>
            <li>Responsabilidade limitada ao valor da transação</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">11. Disputas e Mediação</h2>
          <p className="text-gray-700 mb-4">
            Em caso de disputas entre compradores e vendedores, a EDUPLAY pode mediar, mas a decisão final
            cabe às partes envolvidas. Recomendamos resolver conflitos diretamente sempre que possível.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">12. Modificações nos Termos</h2>
          <p className="text-gray-700 mb-4">
            Podemos modificar estes Termos a qualquer momento. Alterações significativas serão comunicadas
            por email. O uso continuado da Plataforma após as alterações constitui aceitação dos novos termos.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">13. Lei Aplicável e Jurisdição</h2>
          <p className="text-gray-700 mb-4">
            Estes Termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida no foro da
            comarca de Brasília/DF, com exclusão de qualquer outro, por mais privilegiado que seja.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">14. Contato</h2>
          <p className="text-gray-700 mb-4">
            Para dúvidas sobre estes Termos de Uso, entre em contato:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-800 mb-2"><strong>EDUPLAY - Plataforma de Produtos Digitais</strong></p>
            <p className="text-gray-700 mb-1">📧 Email: <a href="mailto:ja.eduplay@gmail.com" className="text-blue-600 hover:underline">ja.eduplay@gmail.com</a></p>
            <p className="text-gray-700 mb-1">📧 Email alternativo: <a href="mailto:daiannemfarias@gmail.com" className="text-blue-600 hover:underline">daiannemfarias@gmail.com</a></p>
            <p className="text-gray-700 mb-1">📱 WhatsApp: <a href="https://wa.me/5561996272214" className="text-blue-600 hover:underline">+55 (61) 99627-2214</a></p>
            <p className="text-gray-700">📱 WhatsApp alternativo: <a href="https://wa.me/5561998086631" className="text-blue-600 hover:underline">+55 (61) 99808-6631</a></p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Ao usar a EDUPLAY, você declara ter lido, compreendido e concordado com estes Termos de Uso.
            </p>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Link to="/privacy" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-2">
              <FiShield className="text-2xl text-purple-600" />
              <h3 className="font-bold text-lg">Política de Privacidade</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Saiba como protegemos seus dados pessoais
            </p>
          </Link>

          <Link to="/help" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-2">
              <FiMail className="text-2xl text-blue-600" />
              <h3 className="font-bold text-lg">Central de Ajuda</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Encontre respostas para suas dúvidas
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
