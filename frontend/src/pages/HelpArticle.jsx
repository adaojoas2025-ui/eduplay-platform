import { useParams, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiShoppingCart,
  FiDollarSign,
  FiPackage,
  FiCreditCard,
  FiRefreshCw,
  FiHelpCircle,
  FiCheck,
  FiAlertCircle,
  FiMail,
} from 'react-icons/fi';

const articles = {
  'primeira-compra': {
    title: 'Como fazer minha primeira compra?',
    icon: <FiShoppingCart className="text-green-600" size={28} />,
    content: PrimeiraCompra,
  },
  'comecar-a-vender': {
    title: 'Como comecar a vender?',
    icon: <FiPackage className="text-purple-600" size={28} />,
    content: ComecarAVender,
  },
  'combos': {
    title: 'Como funcionam os combos?',
    icon: <FiPackage className="text-orange-600" size={28} />,
    content: Combos,
  },
  'reembolso': {
    title: 'Como solicitar reembolso?',
    icon: <FiRefreshCw className="text-red-600" size={28} />,
    content: Reembolso,
  },
  'formas-pagamento': {
    title: 'Quais formas de pagamento aceitas?',
    icon: <FiCreditCard className="text-blue-600" size={28} />,
    content: FormasPagamento,
  },
  'receber-vendas': {
    title: 'Como recebo o dinheiro das vendas?',
    icon: <FiDollarSign className="text-emerald-600" size={28} />,
    content: ReceberVendas,
  },
};

function InfoBox({ children, type = 'info' }) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    tip: 'bg-purple-50 border-purple-200 text-purple-800',
  };
  const icons = {
    info: <FiAlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />,
    warning: <FiAlertCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />,
    success: <FiCheck className="text-green-500 flex-shrink-0 mt-0.5" size={20} />,
    tip: <FiHelpCircle className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />,
  };
  return (
    <div className={`border rounded-lg p-4 my-4 flex gap-3 ${styles[type]}`}>
      {icons[type]}
      <div>{children}</div>
    </div>
  );
}

function Step({ number, title, children }) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <div className="text-gray-600">{children}</div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{title}</h3>
      {children}
    </div>
  );
}

// ==================== ARTICLE CONTENT ====================

function PrimeiraCompra() {
  return (
    <>
      <p className="text-gray-600 text-lg mb-6">
        Comprar na EducaplayJA e simples e seguro. Siga o passo a passo abaixo para fazer sua primeira compra e comecar a aprender!
      </p>

      <Section title="Passo a passo">
        <Step number={1} title="Crie sua conta">
          <p>Acesse a EducaplayJA e clique em <strong>"Criar Conta"</strong>. Voce pode se cadastrar com email e senha ou usando sua conta Google para maior praticidade.</p>
        </Step>

        <Step number={2} title="Explore o Marketplace">
          <p>Navegue pelo nosso marketplace para encontrar o produto ideal. Use os <strong>filtros por categoria</strong>, a <strong>barra de busca</strong> ou explore os produtos em destaque na pagina inicial.</p>
        </Step>

        <Step number={3} title="Veja os detalhes do produto">
          <p>Clique em qualquer produto para ver a descricao completa, preco, avaliacao de outros compradores e o conteudo incluido.</p>
        </Step>

        <Step number={4} title="Adicione ao carrinho">
          <p>Encontrou o que procurava? Clique no botao <strong>"Adicionar ao Carrinho"</strong>. Voce pode continuar explorando e adicionar mais produtos.</p>
        </Step>

        <Step number={5} title="Va para o Checkout">
          <p>Quando estiver pronto, clique no icone do carrinho e depois em <strong>"Finalizar Compra"</strong>.</p>
        </Step>

        <Step number={6} title="Escolha a forma de pagamento">
          <p>No checkout, voce tera duas opcoes:</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li><strong>PIX</strong> - Pagamento instantaneo, sem taxa extra. Melhor preco!</li>
            <li><strong>Cartao de Credito</strong> - Parcele em ate 12x. Inclui taxa de processamento (4,99%) + taxa de servico (R$ 1,00).</li>
          </ul>
        </Step>

        <Step number={7} title="Pague no Mercado Pago">
          <p>Voce sera redirecionado ao <strong>Mercado Pago</strong> para concluir o pagamento com total seguranca. Siga as instrucoes na tela.</p>
        </Step>

        <Step number={8} title="Receba o acesso por email">
          <p>Apos a confirmacao do pagamento, voce recebera um <strong>email com o link de acesso</strong> ao produto adquirido.</p>
        </Step>

        <Step number={9} title="Acesse em 'Meus Produtos'">
          <p>Todos os seus produtos adquiridos ficam disponiveis na secao <strong>"Meus Produtos"</strong> no menu do seu perfil. Acesse quando quiser!</p>
        </Step>
      </Section>

      <InfoBox type="tip">
        <strong>Dica:</strong> Pagando com PIX voce tem o melhor preco e o acesso e liberado quase instantaneamente!
      </InfoBox>

      <InfoBox type="info">
        <strong>Direito de arrependimento:</strong> Voce tem ate 7 dias apos a compra para solicitar reembolso, conforme o Codigo de Defesa do Consumidor (Art. 49).
      </InfoBox>
    </>
  );
}

function ComecarAVender() {
  return (
    <>
      <p className="text-gray-600 text-lg mb-6">
        Transforme seu conhecimento em renda! Veja como comecar a vender seus produtos digitais na EducaplayJA.
      </p>

      <Section title="Passo a passo para comecar">
        <Step number={1} title="Faca upgrade para Produtor">
          <p>No menu do seu perfil, clique em <strong>"Quero Vender"</strong> ou acesse a pagina de upgrade. Preencha as informacoes solicitadas para ativar sua conta de produtor.</p>
        </Step>

        <Step number={2} title="Complete seu perfil de vendedor">
          <p>Adicione uma <strong>foto profissional</strong>, <strong>descricao sobre voce</strong> e suas areas de especialidade. Um perfil completo transmite confianca aos compradores.</p>
        </Step>

        <Step number={3} title="Cadastre seu primeiro produto">
          <p>No painel do vendedor, clique em <strong>"Novo Produto"</strong>. Preencha:</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li><strong>Titulo</strong> - Nome claro e atrativo</li>
            <li><strong>Descricao</strong> - Explique o que o comprador vai receber</li>
            <li><strong>Preco</strong> - Defina o valor do seu produto</li>
            <li><strong>Thumbnail</strong> - Imagem de capa atrativa</li>
            <li><strong>Arquivos</strong> - Faca upload dos arquivos do produto (PDF, video, etc.)</li>
          </ul>
        </Step>

        <Step number={4} title="Aguarde a aprovacao">
          <p>Apos o envio, nosso time de administracao revisara seu produto. Voce recebera uma notificacao quando for <strong>aprovado e publicado</strong> no marketplace.</p>
        </Step>

        <Step number={5} title="Produto publicado!">
          <p>Com o produto aprovado, ele aparecera no marketplace e estara disponivel para compra por todos os usuarios da plataforma.</p>
        </Step>

        <Step number={6} title="Acompanhe suas vendas">
          <p>No <strong>Painel do Vendedor</strong>, acompanhe em tempo real suas vendas, receita, numero de clientes e outras metricas importantes.</p>
        </Step>

        <Step number={7} title="Configure sua chave PIX">
          <p>Para receber seus pagamentos, acesse <strong>Financeiro</strong> no painel do vendedor e cadastre sua chave PIX (CPF, CNPJ, email, telefone ou chave aleatoria).</p>
        </Step>

        <Step number={8} title="Solicite seu saque">
          <p>Quando quiser receber, acesse a area <strong>Financeiro</strong> e clique em <strong>"Solicitar Saque"</strong>. O dinheiro sera enviado via PIX para sua conta!</p>
        </Step>
      </Section>

      <Section title="Comissoes">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-3xl font-bold text-green-600">90%</div>
              <div className="text-gray-600 mt-1">Para o produtor</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-3xl font-bold text-blue-600">10%</div>
              <div className="text-gray-600 mt-1">Taxa da plataforma</div>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-4 text-center">
            A comissao do produtor e sempre calculada sobre o preco base do produto, independente da forma de pagamento do comprador.
          </p>
        </div>
      </Section>

      <InfoBox type="success">
        <strong>Sem mensalidade!</strong> Voce so paga a taxa da plataforma quando realiza uma venda. Sem custos fixos.
      </InfoBox>
    </>
  );
}

function Combos() {
  return (
    <>
      <p className="text-gray-600 text-lg mb-6">
        Combos sao pacotes de produtos vendidos juntos com um preco especial. Saiba como aproveitar essa funcionalidade!
      </p>

      <Section title="O que e um combo?">
        <p className="text-gray-600 mb-4">
          Um combo e um <strong>pacote de produtos digitais</strong> agrupados e vendidos por um preco unico, geralmente com <strong>desconto</strong> em relacao a compra individual de cada item.
        </p>
        <p className="text-gray-600">
          Por exemplo, um produtor pode agrupar 3 cursos complementares em um combo com 30% de desconto no preco total.
        </p>
      </Section>

      <Section title="Vantagens dos combos">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Para compradores</h4>
            <ul className="text-green-700 space-y-1 text-sm">
              <li>- Economia com preco especial</li>
              <li>- Produtos complementares juntos</li>
              <li>- Compra unica e pratica</li>
            </ul>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-2">Para produtores</h4>
            <ul className="text-purple-700 space-y-1 text-sm">
              <li>- Aumento do ticket medio</li>
              <li>- Venda cruzada de produtos</li>
              <li>- Maior valor percebido</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Como encontrar combos">
        <Step number={1} title="No Marketplace">
          <p>Navegue pelo marketplace e procure produtos marcados como <strong>"Combo"</strong>. Eles geralmente aparecem com um selo especial.</p>
        </Step>
        <Step number={2} title="Na pagina do produtor">
          <p>Ao visitar o perfil de um produtor, verifique se ele oferece combos com seus produtos.</p>
        </Step>
        <Step number={3} title="Na busca">
          <p>Use a busca e digite <strong>"combo"</strong> para encontrar todos os combos disponiveis na plataforma.</p>
        </Step>
      </Section>

      <Section title="Como comprar um combo">
        <p className="text-gray-600 mb-4">
          Comprar um combo funciona da mesma forma que comprar um produto individual: adicione ao carrinho, va para o checkout, escolha a forma de pagamento e finalize a compra.
        </p>
        <p className="text-gray-600">
          Apos a compra, voce recebera acesso a <strong>todos os produtos</strong> inclusos no combo.
        </p>
      </Section>

      <Section title="Para produtores: como criar um combo">
        <Step number={1} title="Acesse o Painel do Vendedor">
          <p>No menu lateral, clique em <strong>"Combos"</strong>.</p>
        </Step>
        <Step number={2} title="Crie um novo combo">
          <p>Clique em <strong>"Criar Combo"</strong> e selecione os produtos que deseja agrupar.</p>
        </Step>
        <Step number={3} title="Defina o preco e desconto">
          <p>Escolha o preco do combo. Recomendamos oferecer pelo menos <strong>10-20% de desconto</strong> sobre o preco individual somado para tornar o combo atrativo.</p>
        </Step>
      </Section>

      <InfoBox type="tip">
        <strong>Dica para produtores:</strong> Crie combos com produtos que se complementam. Por exemplo, um curso basico + intermediario + avancado sobre o mesmo tema.
      </InfoBox>
    </>
  );
}

function Reembolso() {
  return (
    <>
      <p className="text-gray-600 text-lg mb-6">
        Na EducaplayJA, voce tem o direito de solicitar reembolso dentro do prazo legal. Veja como funciona.
      </p>

      <Section title="Prazo para reembolso">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-red-600">7</span>
            </div>
            <div>
              <h4 className="font-bold text-red-800 text-lg">7 dias para solicitar reembolso</h4>
              <p className="text-red-600 text-sm">A partir da data da compra</p>
            </div>
          </div>
          <p className="text-red-700 text-sm">
            Conforme o <strong>Artigo 49 do Codigo de Defesa do Consumidor (CDC)</strong>, o consumidor pode desistir de compras realizadas pela internet no prazo de 7 dias corridos, contados a partir da data da compra, sem necessidade de justificativa.
          </p>
        </div>
      </Section>

      <Section title="Como solicitar reembolso">
        <Step number={1} title="Verifique o prazo">
          <p>Confirme que sua compra foi realizada <strong>ha menos de 7 dias</strong>. Apos esse prazo, o reembolso nao podera ser solicitado.</p>
        </Step>

        <Step number={2} title="Entre em contato com o suporte">
          <p>Envie uma solicitacao de reembolso pelo nosso formulario de contato ou por email informando:</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Seu nome completo</li>
            <li>Email da conta</li>
            <li>Nome do produto adquirido</li>
            <li>Data da compra</li>
            <li>Motivo do reembolso (opcional)</li>
          </ul>
        </Step>

        <Step number={3} title="Aguarde a analise">
          <p>Nossa equipe analisara sua solicitacao em ate <strong>2 dias uteis</strong> e enviara uma confirmacao por email.</p>
        </Step>

        <Step number={4} title="Receba o reembolso">
          <p>Apos aprovado, o valor sera devolvido pela mesma forma de pagamento utilizada na compra.</p>
        </Step>
      </Section>

      <Section title="Prazos de devolucao por metodo">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Metodo de Pagamento</th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Prazo de Devolucao</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-4 py-3">PIX</td>
                <td className="border border-gray-200 px-4 py-3 text-green-600 font-medium">1 a 2 dias uteis</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3">Cartao de Credito</td>
                <td className="border border-gray-200 px-4 py-3 text-blue-600 font-medium">5 a 10 dias uteis</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-3">Cartao de Debito</td>
                <td className="border border-gray-200 px-4 py-3 text-blue-600 font-medium">5 a 10 dias uteis</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-gray-500 text-sm mt-2">
          * Os prazos podem variar conforme a instituicao financeira do comprador.
        </p>
      </Section>

      <Section title="Situacoes em que o reembolso pode ser negado">
        <ul className="space-y-2 text-gray-600">
          <li className="flex gap-2">
            <span className="text-red-500 mt-1"><FiAlertCircle size={16} /></span>
            <span>Solicitacao feita <strong>apos os 7 dias</strong> da compra</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500 mt-1"><FiAlertCircle size={16} /></span>
            <span>Indicio de <strong>fraude</strong> ou uso indevido</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500 mt-1"><FiAlertCircle size={16} /></span>
            <span>Solicitacoes <strong>repetidas e abusivas</strong> pelo mesmo usuario</span>
          </li>
        </ul>
      </Section>

      <InfoBox type="info">
        <strong>Importante:</strong> O reembolso e de 100% do valor pago, incluindo eventuais taxas de processamento. Voce recebe de volta exatamente o que pagou.
      </InfoBox>
    </>
  );
}

function FormasPagamento() {
  return (
    <>
      <p className="text-gray-600 text-lg mb-6">
        Oferecemos opcoes de pagamento seguras e praticas. Todos os pagamentos sao processados pelo Mercado Pago.
      </p>

      <Section title="PIX - Pagamento Instantaneo">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
          <h4 className="font-bold text-green-800 text-lg mb-3">Melhor opcao!</h4>
          <ul className="space-y-2 text-green-700">
            <li className="flex gap-2 items-start">
              <FiCheck className="text-green-600 mt-1 flex-shrink-0" />
              <span><strong>Sem taxa extra</strong> - voce paga o preco do produto, sem acrescimos</span>
            </li>
            <li className="flex gap-2 items-start">
              <FiCheck className="text-green-600 mt-1 flex-shrink-0" />
              <span><strong>Pagamento instantaneo</strong> - confirmacao em segundos</span>
            </li>
            <li className="flex gap-2 items-start">
              <FiCheck className="text-green-600 mt-1 flex-shrink-0" />
              <span><strong>Acesso imediato</strong> - apos confirmacao, o produto e liberado automaticamente</span>
            </li>
            <li className="flex gap-2 items-start">
              <FiCheck className="text-green-600 mt-1 flex-shrink-0" />
              <span><strong>Disponivel 24h</strong> - pague a qualquer hora, todos os dias</span>
            </li>
          </ul>
        </div>
      </Section>

      <Section title="Cartao de Credito/Debito">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
          <h4 className="font-bold text-blue-800 text-lg mb-3">Parcele em ate 12x</h4>
          <ul className="space-y-2 text-blue-700">
            <li className="flex gap-2 items-start">
              <FiCreditCard className="text-blue-600 mt-1 flex-shrink-0" />
              <span><strong>Parcelas de 1x a 12x</strong> no cartao de credito</span>
            </li>
            <li className="flex gap-2 items-start">
              <FiCreditCard className="text-blue-600 mt-1 flex-shrink-0" />
              <span><strong>Debito</strong> - pagamento a vista no cartao de debito</span>
            </li>
          </ul>
        </div>

        <h4 className="font-semibold text-gray-900 mb-3">Taxas do cartao (transparentes para o comprador)</h4>
        <p className="text-gray-600 mb-4">
          Pagamentos com cartao incluem taxas de processamento que sao mostradas <strong>antes</strong> de voce confirmar a compra:
        </p>
        <ul className="list-disc ml-5 space-y-1 text-gray-600 mb-4">
          <li><strong>Taxa de processamento:</strong> 4,99% sobre o valor do produto</li>
          <li><strong>Taxa de servico:</strong> R$ 1,00 (valor fixo)</li>
          <li><strong>Taxa de parcelamento:</strong> varia conforme o numero de parcelas (apenas para parcelas acima de 1x)</li>
        </ul>

        <h4 className="font-semibold text-gray-900 mb-3">Exemplo de parcelas (produto de R$ 50,00)</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-3 py-2 text-left">Parcelas</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Valor/Parcela</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-3 py-2">1x (a vista)</td>
                <td className="border border-gray-200 px-3 py-2">R$ 53,50</td>
                <td className="border border-gray-200 px-3 py-2 font-medium">R$ 53,50</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-3 py-2">2x</td>
                <td className="border border-gray-200 px-3 py-2">R$ 27,97</td>
                <td className="border border-gray-200 px-3 py-2">R$ 55,95</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2">3x</td>
                <td className="border border-gray-200 px-3 py-2">R$ 18,88</td>
                <td className="border border-gray-200 px-3 py-2">R$ 56,64</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-3 py-2">6x</td>
                <td className="border border-gray-200 px-3 py-2">R$ 9,81</td>
                <td className="border border-gray-200 px-3 py-2">R$ 58,84</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2">12x</td>
                <td className="border border-gray-200 px-3 py-2">R$ 5,23</td>
                <td className="border border-gray-200 px-3 py-2">R$ 62,78</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-gray-500 text-sm mt-2">
          * Valores aproximados. O valor exato e calculado automaticamente no checkout.
        </p>
      </Section>

      <Section title="Seguranca">
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-600 mb-3">
            Todos os pagamentos sao processados pelo <strong>Mercado Pago</strong>, uma das maiores plataformas de pagamento da America Latina.
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex gap-2 items-start">
              <FiCheck className="text-green-600 mt-1 flex-shrink-0" />
              <span>Certificacao PCI-DSS (padrao de seguranca de dados de cartao)</span>
            </li>
            <li className="flex gap-2 items-start">
              <FiCheck className="text-green-600 mt-1 flex-shrink-0" />
              <span>Criptografia SSL em todas as transacoes</span>
            </li>
            <li className="flex gap-2 items-start">
              <FiCheck className="text-green-600 mt-1 flex-shrink-0" />
              <span>Seus dados de pagamento nunca sao armazenados em nossos servidores</span>
            </li>
          </ul>
        </div>
      </Section>

      <InfoBox type="tip">
        <strong>Dica:</strong> Sempre que possivel, prefira pagar com PIX. Alem de nao ter taxas extras, a confirmacao e instantanea!
      </InfoBox>
    </>
  );
}

function ReceberVendas() {
  return (
    <>
      <p className="text-gray-600 text-lg mb-6">
        Como produtor na EducaplayJA, voce recebe suas vendas diretamente via PIX. Veja como funciona o processo completo.
      </p>

      <Section title="Como funciona a comissao">
        <div className="bg-gray-50 rounded-lg p-6 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-white rounded-lg border-2 border-green-200">
              <div className="text-3xl font-bold text-green-600">90%</div>
              <div className="text-gray-600 mt-1 font-medium">Voce recebe</div>
              <div className="text-gray-400 text-sm">(produtor)</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-200">
              <div className="text-3xl font-bold text-blue-600">10%</div>
              <div className="text-gray-600 mt-1 font-medium">Taxa plataforma</div>
              <div className="text-gray-400 text-sm">(EducaplayJA)</div>
            </div>
          </div>
          <p className="text-gray-500 text-sm text-center">
            A comissao e sempre calculada sobre o <strong>preco base do produto</strong>, independente se o comprador pagou com PIX ou cartao.
          </p>
        </div>

        <h4 className="font-semibold text-gray-900 mb-2">Exemplo pratico</h4>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-gray-600 mb-2">Produto com preco de <strong>R$ 100,00</strong>:</p>
          <ul className="space-y-1 text-gray-600">
            <li>- Comissao do produtor: R$ 100,00 x 90% = <strong className="text-green-600">R$ 90,00</strong></li>
            <li>- Taxa da plataforma: R$ 100,00 x 10% = <strong className="text-blue-600">R$ 10,00</strong></li>
          </ul>
          <p className="text-gray-500 text-sm mt-2">
            * Se o comprador pagou com cartao (R$ 105,99 total), sua comissao continua sendo R$ 90,00 (baseada no preco base).
          </p>
        </div>
      </Section>

      <Section title="Saldo disponivel">
        <p className="text-gray-600 mb-4">
          Seu saldo disponivel para saque e calculado automaticamente a partir das vendas com <strong>pagamento aprovado</strong>. Voce pode acompanhar em tempo real no painel <strong>Financeiro</strong>.
        </p>
        <InfoBox type="info">
          O saldo e atualizado assim que o Mercado Pago confirma o pagamento do comprador. Para pagamentos via PIX, isso acontece quase instantaneamente.
        </InfoBox>
      </Section>

      <Section title="Configurar chave PIX">
        <p className="text-gray-600 mb-4">
          Para receber seus saques, voce precisa cadastrar uma chave PIX no seu perfil de vendedor.
        </p>

        <Step number={1} title="Acesse o painel Financeiro">
          <p>No menu do vendedor, clique em <strong>"Financeiro"</strong> ou <strong>"Configuracoes"</strong>.</p>
        </Step>

        <Step number={2} title="Cadastre sua chave PIX">
          <p>Informe sua chave PIX. Tipos aceitos:</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li><strong>CPF</strong> - Seu numero de CPF</li>
            <li><strong>CNPJ</strong> - Numero do CNPJ (para empresas)</li>
            <li><strong>Email</strong> - Seu email cadastrado no banco</li>
            <li><strong>Telefone</strong> - Numero com DDD (ex: +5561999999999)</li>
            <li><strong>Chave aleatoria</strong> - Chave gerada pelo seu banco</li>
          </ul>
        </Step>

        <Step number={3} title="Informe o nome do titular">
          <p>Digite o <strong>nome completo</strong> do titular da conta bancaria associada a chave PIX.</p>
        </Step>

        <InfoBox type="warning">
          <strong>Atencao:</strong> A chave PIX deve estar vinculada a uma conta bancaria no seu nome. Chaves de terceiros nao sao aceitas por seguranca.
        </InfoBox>
      </Section>

      <Section title="Solicitar saque">
        <Step number={1} title="Acesse a area Financeiro">
          <p>No painel do vendedor, va em <strong>"Financeiro"</strong>. Voce vera seu saldo disponivel.</p>
        </Step>

        <Step number={2} title="Escolha o valor">
          <p>Voce pode sacar <strong>todo o saldo</strong> disponivel ou escolher um <strong>valor personalizado</strong> (minimo R$ 1,00).</p>
        </Step>

        <Step number={3} title="Confirme o saque">
          <p>Clique em <strong>"Solicitar Saque"</strong>. O sistema processara sua solicitacao automaticamente.</p>
        </Step>

        <Step number={4} title="Receba via PIX">
          <p>O valor e enviado automaticamente para a chave PIX cadastrada. A transferencia e feita via <strong>Asaas</strong> e normalmente chega em <strong>poucos minutos</strong>.</p>
        </Step>
      </Section>

      <Section title="Saques parciais">
        <p className="text-gray-600 mb-4">
          Voce pode sacar <strong>qualquer valor</strong> dentro do saldo disponivel. O sistema consome automaticamente os pedidos necessarios (incluindo parcialmente) para atingir o valor solicitado.
        </p>
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Exemplo</h4>
          <p className="text-gray-600 text-sm mb-2">Saldo: R$ 15,50 (de 3 vendas: R$ 5,00 + R$ 4,50 + R$ 6,00)</p>
          <p className="text-gray-600 text-sm mb-1">Voce solicita saque de <strong>R$ 7,00</strong>:</p>
          <ul className="text-gray-600 text-sm space-y-1 ml-4">
            <li>- Consome venda 1 inteira (R$ 5,00)</li>
            <li>- Consome R$ 2,00 da venda 2</li>
            <li>- Recebe exatamente R$ 7,00 via PIX</li>
            <li>- Saldo restante: R$ 8,50</li>
          </ul>
        </div>
      </Section>

      <InfoBox type="success">
        <strong>Sem taxa de saque!</strong> A EducaplayJA nao cobra taxa adicional para saques. A unica taxa e a comissao de 10% sobre a venda, que ja e descontada automaticamente.
      </InfoBox>
    </>
  );
}

// ==================== MAIN COMPONENT ====================

export default function HelpArticle() {
  const { slug } = useParams();
  const article = articles[slug];

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Artigo nao encontrado</h1>
          <p className="text-gray-600 mb-6">O artigo que voce procura nao existe ou foi removido.</p>
          <Link to="/help" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
            <FiArrowLeft /> Voltar para Central de Ajuda
          </Link>
        </div>
      </div>
    );
  }

  const ContentComponent = article.content;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/help" className="hover:text-indigo-600 transition-colors">Central de Ajuda</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{article.title}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border flex items-center justify-center">
            {article.icon}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{article.title}</h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 mb-8">
          <ContentComponent />
        </div>

        {/* Still have questions? */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-indigo-900 text-lg mb-2">Ainda tem duvidas?</h3>
          <p className="text-indigo-700 mb-4">
            Nossa equipe de suporte esta pronta para ajudar voce. Entre em contato!
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
              <FiMail size={16} /> Falar com o Suporte
            </Link>
            <a
              href="https://mail.google.com/mail/?view=cm&to=adao.joas2025@gmail.com&su=Dúvida - EducaplayJA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 border border-indigo-300 px-5 py-2.5 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
            >
              <FiMail size={16} /> Enviar Email
            </a>
          </div>
        </div>

        {/* Back button */}
        <Link to="/help" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
          <FiArrowLeft /> Voltar para Central de Ajuda
        </Link>
      </div>
    </div>
  );
}
