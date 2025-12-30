import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiBook,
  FiShoppingBag,
  FiDollarSign,
  FiShield,
  FiHelpCircle,
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiMessageCircle,
  FiPhone,
  FiCreditCard,
  FiPackage,
  FiTruck,
  FiRefreshCw,
  FiUsers,
  FiSettings,
  FiVideo,
  FiFileText
} from 'react-icons/fi';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaqId, setOpenFaqId] = useState(null);

  // Categorias principais
  const categories = [
    { id: 'all', name: 'Todos', icon: FiBook, color: 'blue' },
    { id: 'buying', name: 'Comprando', icon: FiShoppingBag, color: 'green' },
    { id: 'selling', name: 'Vendendo', icon: FiDollarSign, color: 'purple' },
    { id: 'payment', name: 'Pagamentos', icon: FiCreditCard, color: 'orange' },
    { id: 'account', name: 'Conta', icon: FiUsers, color: 'pink' },
    { id: 'policies', name: 'Políticas', icon: FiShield, color: 'red' },
  ];

  // FAQ completo organizado por categorias
  const faqs = [
    // COMPRANDO
    {
      id: 1,
      category: 'buying',
      question: 'Como faço para comprar um produto?',
      answer: `Para comprar um produto na EDUPLAY:

1. **Navegue pelo Marketplace**: Acesse a seção Marketplace e explore os produtos disponíveis
2. **Escolha o produto**: Clique no produto desejado para ver detalhes completos
3. **Adicione ao carrinho**: Clique em "Adicionar ao Carrinho" ou "Comprar Agora"
4. **Finalize a compra**: No carrinho, revise seus itens e clique em "Finalizar Compra"
5. **Escolha o pagamento**: Selecione PIX, Cartão de Crédito ou Boleto
6. **Receba o produto**: Após aprovação do pagamento, você receberá acesso imediato ao produto por email

💡 **Dica**: Produtos digitais são entregues instantaneamente após confirmação do pagamento!`
    },
    {
      id: 2,
      category: 'buying',
      question: 'Posso comprar mais de um produto de uma vez?',
      answer: `Sim! Você pode adicionar quantos produtos quiser ao carrinho antes de finalizar a compra.

**Vantagens de comprar múltiplos produtos:**
- Fique atento aos **combos promocionais** que oferecem descontos ao comprar produtos juntos
- Economize tempo finalizando tudo em uma única compra
- Aproveite os descontos especiais em pacotes

🔥 **Combos**: Na página inicial e marketplace, você encontra combos com até 30% de desconto!`
    },
    {
      id: 3,
      category: 'buying',
      question: 'Quanto tempo leva para receber o produto?',
      answer: `**Produtos Digitais**: Acesso IMEDIATO após aprovação do pagamento

**Tempo de aprovação por método:**
- ⚡ **PIX**: Instantâneo (segundos)
- 💳 **Cartão de Crédito**: 1-2 minutos
- 🏦 **Boleto Bancário**: 1-3 dias úteis

Você receberá o link de acesso por email e poderá baixar na área "Minhas Compras".`
    },
    {
      id: 4,
      category: 'buying',
      question: 'Posso acessar os produtos em qualquer dispositivo?',
      answer: `Sim! Todos os produtos digitais podem ser acessados de qualquer dispositivo:

📱 **Smartphone** (Android/iOS)
💻 **Computador** (Windows/Mac/Linux)
📲 **Tablet** (iPad/Android)

Basta fazer login na sua conta em qualquer dispositivo e acessar "Minhas Compras" para ver todos os seus produtos.

⚠️ **Importante**: Alguns produtos podem ter restrições de downloads simultâneos por questões de licença.`
    },
    {
      id: 5,
      category: 'buying',
      question: 'O que são combos e como funcionam?',
      answer: `**Combos** são pacotes de produtos vendidos juntos com desconto especial!

**Vantagens dos Combos:**
- 💰 Descontos de até 30% comparado à compra individual
- 📦 Produtos complementares selecionados
- 🎯 Economia garantida
- ⚡ Todos entregues juntos

**Como comprar um combo:**
1. Veja os combos destacados na página inicial
2. Clique no combo desejado
3. Revise os produtos inclusos
4. Adicione ao carrinho
5. Finalize a compra normalmente

Os produtos do combo serão todos adicionados à sua conta após o pagamento.`
    },

    // VENDENDO
    {
      id: 6,
      category: 'selling',
      question: 'Como começo a vender na EDUPLAY?',
      answer: `Para começar a vender na EDUPLAY:

**1. Crie sua conta de Produtor**
   - Faça login na plataforma
   - Vá em "Configurações" > "Tornar-se Produtor"
   - Preencha seus dados fiscais e bancários

**2. Cadastre seu primeiro produto**
   - Acesse "Meus Produtos" > "Novo Produto"
   - Adicione título, descrição detalhada e preço
   - Faça upload da thumbnail (imagem de capa)
   - Faça upload do arquivo do produto

**3. Publique**
   - Revise todas as informações
   - Clique em "Publicar"
   - Seu produto estará disponível no marketplace!

**4. Divulgue**
   - Compartilhe o link do seu produto
   - Use as redes sociais
   - Acompanhe suas vendas no painel

💡 **Taxa da plataforma**: 3% sobre cada venda`
    },
    {
      id: 7,
      category: 'selling',
      question: 'Quais tipos de produtos posso vender?',
      answer: `Você pode vender diversos tipos de produtos digitais:

**Permitidos:**
✅ Cursos online (vídeos, PDFs, materiais complementares)
✅ E-books e audiobooks
✅ Mentorias e consultorias
✅ Templates e designs
✅ Software e aplicativos
✅ Música e áudio
✅ Fotos e vídeos
✅ Planilhas e ferramentas
✅ Artes e ilustrações

**NÃO permitidos:**
❌ Conteúdo pirata ou com direitos autorais de terceiros
❌ Material adulto ou ofensivo
❌ Esquemas de pirâmide ou fraudes
❌ Produtos físicos
❌ Serviços presenciais

⚠️ **Importante**: Todo produto é revisado antes da publicação para garantir qualidade.`
    },
    {
      id: 8,
      category: 'selling',
      question: 'Como recebo meu dinheiro das vendas?',
      answer: `**Processo de Recebimento:**

1. **Venda Aprovada**: Cliente finaliza a compra e pagamento é aprovado
2. **Período de Garantia**: 7 dias para o cliente solicitar reembolso
3. **Liberação**: Após 7 dias, o valor é liberado para saque
4. **Transferência**: Solicite o saque para sua conta bancária

**Taxas:**
- Taxa da plataforma: 3% por venda
- Taxa de processamento: incluída (Mercado Pago)
- Transferência bancária: GRÁTIS

**Prazo de transferência:**
- PIX: 1 dia útil
- TED: 1-2 dias úteis

💰 Você pode acompanhar todos os seus ganhos em "Vendas" > "Minhas Comissões"`
    },
    {
      id: 9,
      category: 'selling',
      question: 'Como criar combos dos meus produtos?',
      answer: `**Criar Combos aumenta suas vendas oferecendo pacotes com desconto!**

**Como criar:**
1. Vá em "Meus Produtos" > "Criar Combo"
2. Selecione 2 ou mais produtos seus
3. Defina o percentual de desconto (ex: 20%)
4. Adicione título e descrição atraente
5. Publique o combo

**Dicas para combos de sucesso:**
- 🎯 Agrupe produtos complementares
- 💰 Ofereça pelo menos 15% de desconto
- 📝 Destaque a economia na descrição
- 🎨 Use título chamativo

**Exemplo:**
- Produto A: R$ 100
- Produto B: R$ 50
- Produto C: R$ 30
- **Total individual**: R$ 180
- **Combo (20% off)**: R$ 144
- **Economia**: R$ 36!`
    },

    // PAGAMENTOS
    {
      id: 10,
      category: 'payment',
      question: 'Quais formas de pagamento são aceitas?',
      answer: `Aceitamos os principais métodos de pagamento via **Mercado Pago**:

**💳 Cartão de Crédito**
- Visa, Mastercard, Elo, American Express
- Aprovação em minutos
- Parcelamento disponível (conforme produto)

**⚡ PIX**
- Aprovação INSTANTÂNEA
- Disponível 24/7
- Sem taxas extras
- ⭐ **Recomendado para compras rápidas!**

**🏦 Boleto Bancário**
- Disponível para todos os bancos
- Aprovação em 1-3 dias úteis
- Válido por 3 dias

Todas as transações são processadas com segurança máxima pelo Mercado Pago.`
    },
    {
      id: 11,
      category: 'payment',
      question: 'É seguro comprar na EDUPLAY?',
      answer: `**SIM!** A segurança é nossa prioridade máxima.

**Proteções implementadas:**

🔒 **Criptografia SSL**: Todos os dados são criptografados
💳 **Mercado Pago**: Gateway de pagamento certificado PCI-DSS
🛡️ **Garantia de 7 dias**: Reembolso total se não ficar satisfeito
🔐 **Proteção de dados**: Conformidade com LGPD
✅ **Vendedores verificados**: Todos os produtores são validados
📧 **Confirmação por email**: Você recebe comprovante de todas as transações

**Certificações:**
- SSL/TLS Certificate
- PCI-DSS Compliance (via Mercado Pago)
- LGPD Compliant

Nunca armazenamos dados do seu cartão de crédito. Tudo é processado diretamente pelo Mercado Pago.`
    },
    {
      id: 12,
      category: 'payment',
      question: 'Posso parcelar minhas compras?',
      answer: `Sim! O parcelamento está disponível para compras no **Cartão de Crédito**.

**Condições de parcelamento:**
- Compras acima de R$ 30: até 2x sem juros
- Compras acima de R$ 60: até 3x sem juros
- Compras acima de R$ 100: até 6x sem juros
- Acima de 6x: com juros (conforme operadora)

**Exemplo:**
Produto de R$ 120
- 1x de R$ 120 (sem juros)
- 2x de R$ 60 (sem juros)
- 3x de R$ 40 (sem juros)
- 6x de R$ 20 (sem juros)

⚠️ **Importante**:
- PIX e Boleto não podem ser parcelados
- Parcelamento depende da aprovação do cartão
- Consulte as condições no momento do pagamento`
    },

    // CONTA
    {
      id: 13,
      category: 'account',
      question: 'Como redefinir minha senha?',
      answer: `**Esqueceu sua senha? É fácil recuperar!**

**Passo a passo:**
1. Vá para a página de Login
2. Clique em "Esqueci minha senha"
3. Digite seu email cadastrado
4. Verifique sua caixa de entrada
5. Clique no link recebido
6. Crie uma nova senha
7. Faça login com a nova senha

**Dicas de segurança:**
🔒 Use uma senha forte (mínimo 8 caracteres)
🔤 Combine letras maiúsculas, minúsculas e números
🔐 Não use senhas óbvias (data de nascimento, 123456, etc)
📧 Nunca compartilhe sua senha

⚠️ **Não recebeu o email?**
- Verifique a pasta de SPAM
- Aguarde até 10 minutos
- Tente novamente com outro email
- Entre em contato com o suporte`
    },
    {
      id: 14,
      category: 'account',
      question: 'Como atualizar meus dados cadastrais?',
      answer: `**Mantenha seus dados sempre atualizados:**

**Para atualizar:**
1. Faça login na sua conta
2. Clique no seu nome (canto superior direito)
3. Vá em "Configurações" ou "Meu Perfil"
4. Edite as informações desejadas:
   - Nome completo
   - Email
   - Telefone
   - Foto de perfil
   - Senha
5. Clique em "Salvar Alterações"

**Dados para vendedores:**
Se você é produtor, também pode atualizar:
- Dados bancários
- CPF/CNPJ
- Endereço fiscal
- Informações de pagamento

⚠️ **Importante**:
- Email e CPF/CNPJ podem precisar de verificação
- Dados bancários afetam o recebimento das vendas
- Mantenha tudo atualizado para não perder pagamentos`
    },
    {
      id: 15,
      category: 'account',
      question: 'Posso ter mais de uma conta?',
      answer: `**Não é permitido ter múltiplas contas.**

**Regras da plataforma:**
- ❌ Apenas 1 conta por CPF/CNPJ
- ❌ Não é permitido criar contas duplicadas
- ✅ Você pode ser COMPRADOR e VENDEDOR na mesma conta

**Uma conta, múltiplos perfis:**
Sua conta na EDUPLAY permite:
- 🛍️ Comprar produtos ilimitados
- 💰 Vender seus próprios produtos
- 📊 Acessar relatórios e dashboards
- 🎯 Participar de programas de afiliados

**Se precisar de conta empresarial:**
- Use sua conta com CNPJ
- Configure dados da empresa
- Emita notas fiscais (em breve)

⚠️ **Violação**: Contas duplicadas podem ser suspensas permanentemente.`
    },

    // POLÍTICAS
    {
      id: 16,
      category: 'policies',
      question: 'Qual é a política de reembolso?',
      answer: `**Garantia de 7 dias** - Estamos confiantes na qualidade dos produtos!

**Como funciona:**
✅ 7 dias para solicitar reembolso
✅ Sem necessidade de justificativa
✅ Devolução de 100% do valor pago
✅ Processo simples e rápido

**Como solicitar reembolso:**
1. Acesse "Minhas Compras"
2. Encontre o produto
3. Clique em "Solicitar Reembolso"
4. Aguarde análise (até 2 dias úteis)
5. Receba o dinheiro de volta

**Prazo de devolução:**
- PIX: 1-2 dias úteis
- Cartão: 5-10 dias úteis (depende do banco)
- Boleto: 5-7 dias úteis

⚠️ **Importante:**
- Após 7 dias, não aceitamos reembolsos
- Produtos muito consumidos podem ter reembolso negado
- Em caso de fraude, conta pode ser suspensa

**Problemas com o produto?**
Antes de pedir reembolso, tente contatar o produtor! Muitos problemas podem ser resolvidos rapidamente.`
    },
    {
      id: 17,
      category: 'policies',
      question: 'Como funciona a proteção ao comprador?',
      answer: `**Você está 100% protegido ao comprar na EDUPLAY!**

**Proteções ativas:**

🛡️ **Garantia de 7 dias**
- Devolução sem burocracia
- 100% do dinheiro de volta

🔒 **Pagamento seguro**
- Processado via Mercado Pago
- Dados criptografados
- Certificação PCI-DSS

✅ **Produtos verificados**
- Todos os produtos são revisados
- Vendedores são validados
- Conteúdo de qualidade garantida

📧 **Suporte dedicado**
- Equipe disponível para ajudar
- Mediação de conflitos
- Resolução rápida de problemas

💳 **Compra garantida**
- Se não receber o produto, devolução total
- Link de download sempre disponível
- Backups seguros

🚫 **Contra fraudes**
- Sistema antifraude ativo
- Monitoramento 24/7
- Ação rápida em casos suspeitos`
    },
    {
      id: 18,
      category: 'policies',
      question: 'Meus dados estão seguros?',
      answer: `**SIM! Sua privacidade é fundamental para nós.**

**Como protegemos seus dados:**

🔐 **Criptografia**
- SSL/TLS em todas as páginas
- Dados bancários NUNCA armazenados
- Senhas com hash seguro

📋 **Conformidade LGPD**
- Seguimos todas as leis brasileiras
- Transparência total no uso de dados
- Você tem controle sobre suas informações

🎯 **Uso dos dados**
Usamos seus dados apenas para:
- Processar suas compras
- Enviar produtos adquiridos
- Comunicações sobre pedidos
- Melhorar a plataforma

❌ **NUNCA fazemos:**
- Venda de dados para terceiros
- Spam ou comunicação excessiva
- Compartilhamento sem consentimento

**Seus direitos:**
✅ Acessar seus dados
✅ Corrigir informações
✅ Solicitar exclusão
✅ Revogar consentimento
✅ Portabilidade de dados

📧 Para exercer seus direitos: privacidade@eduplay.com.br`
    },
  ];

  // Guias completos
  const guides = [
    {
      id: 1,
      title: 'Guia Completo do Comprador',
      description: 'Aprenda tudo sobre como comprar produtos na EDUPLAY',
      icon: FiShoppingBag,
      color: 'green',
      steps: [
        'Navegue pelos produtos no Marketplace',
        'Escolha seu produto e veja os detalhes',
        'Adicione ao carrinho ou compre direto',
        'Escolha a forma de pagamento',
        'Aguarde a confirmação por email',
        'Acesse seus produtos em "Minhas Compras"'
      ]
    },
    {
      id: 2,
      title: 'Guia Completo do Vendedor',
      description: 'Comece a vender seus produtos digitais hoje',
      icon: FiDollarSign,
      color: 'purple',
      steps: [
        'Crie sua conta de Produtor',
        'Prepare seus arquivos digitais',
        'Cadastre seu primeiro produto',
        'Defina preço e descrição atraente',
        'Publique no marketplace',
        'Acompanhe vendas e comissões'
      ]
    },
    {
      id: 3,
      title: 'Como Criar Combos de Sucesso',
      description: 'Maximize suas vendas criando pacotes promocionais',
      icon: FiPackage,
      color: 'orange',
      steps: [
        'Selecione produtos complementares',
        'Defina desconto atrativo (15-30%)',
        'Crie título e descrição convincente',
        'Destaque a economia do combo',
        'Publique e divulgue',
        'Monitore resultados e ajuste'
      ]
    },
    {
      id: 4,
      title: 'Maximizando suas Vendas',
      description: 'Estratégias para vender mais na plataforma',
      icon: FiTruck,
      color: 'blue',
      steps: [
        'Use imagens de alta qualidade',
        'Escreva descrições detalhadas',
        'Defina preços competitivos',
        'Crie combos e promoções',
        'Responda dúvidas rapidamente',
        'Peça avaliações aos clientes'
      ]
    },
  ];

  // Canais de suporte
  const supportChannels = [
    {
      icon: FiMail,
      title: 'Email',
      description: 'Envie sua dúvida por email',
      contact: 'ja.eduplay@gmail.com',
      link: 'mailto:ja.eduplay@gmail.com',
      responseTime: 'Resposta em até 24h',
      color: 'blue'
    },
    {
      icon: FiMessageCircle,
      title: 'WhatsApp',
      description: 'Fale conosco pelo WhatsApp',
      contact: '+55 (61) 99627-2214',
      link: 'https://wa.me/5561996272214',
      responseTime: 'Segunda a Sexta: 9h às 18h',
      color: 'green'
    },
  ];

  // Filtrar FAQs baseado na categoria selecionada e busca
  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FiHelpCircle className="text-6xl mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Central de Ajuda EDUPLAY
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Como podemos ajudar você hoje?
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar ajuda... (ex: como comprar, reembolso, pagamento)"
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Escolha uma categoria</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? `border-${category.color}-500 bg-${category.color}-50`
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <Icon className={`text-3xl mx-auto mb-2 ${
                    isSelected ? `text-${category.color}-600` : 'text-gray-600'
                  }`} />
                  <p className={`font-semibold text-sm ${
                    isSelected ? `text-${category.color}-900` : 'text-gray-900'
                  }`}>
                    {category.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Links / Guides */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Guias Rápidos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.map((guide) => {
              const Icon = guide.icon;
              return (
                <div key={guide.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                  <div className={`bg-${guide.color}-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`text-2xl text-${guide.color}-600`} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{guide.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{guide.description}</p>
                  <ol className="space-y-2">
                    {guide.steps.slice(0, 3).map((step, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className={`bg-${guide.color}-100 text-${guide.color}-700 font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5`}>
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  {guide.steps.length > 3 && (
                    <p className="text-sm text-gray-500 mt-2">
                      +{guide.steps.length - 3} passos
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Perguntas Frequentes
              {searchQuery && ` - ${filteredFaqs.length} resultado(s)`}
            </h2>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-blue-600 hover:underline text-sm"
              >
                Ver todas as categorias
              </button>
            )}
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FiSearch className="text-5xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Tente buscar com outras palavras ou navegue pelas categorias
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="btn-primary"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition"
                  >
                    <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                    {openFaqId === faq.id ? (
                      <FiChevronUp className="text-xl text-gray-600 flex-shrink-0" />
                    ) : (
                      <FiChevronDown className="text-xl text-gray-600 flex-shrink-0" />
                    )}
                  </button>
                  {openFaqId === faq.id && (
                    <div className="px-6 pb-6">
                      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-xl p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Ainda precisa de ajuda?</h2>
            <p className="text-lg text-white/90">
              Nossa equipe está pronta para ajudar você!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {supportChannels.map((channel, index) => {
              const Icon = channel.icon;
              return (
                <a
                  key={index}
                  href={channel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition transform hover:scale-105"
                >
                  <Icon className="text-4xl mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">{channel.title}</h3>
                  <p className="text-sm text-white/80 mb-3">{channel.description}</p>
                  <p className="font-semibold mb-1">{channel.contact}</p>
                  <p className="text-xs text-white/70">{channel.responseTime}</p>
                </a>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/contact"
              className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:shadow-xl transition"
            >
              Abrir Ticket de Suporte
            </Link>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-4">
              <FiVideo className="text-3xl text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-2">Tutoriais em Vídeo</h3>
                <p className="text-gray-600 mb-4">
                  Assista nossos tutoriais em vídeo para aprender visualmente
                </p>
                <Link to="/tutorials" className="text-blue-600 hover:underline font-semibold">
                  Ver tutoriais →
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-4">
              <FiFileText className="text-3xl text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-2">Documentação Completa</h3>
                <p className="text-gray-600 mb-4">
                  Acesse nossa documentação técnica detalhada
                </p>
                <Link to="/docs" className="text-purple-600 hover:underline font-semibold">
                  Ler documentação →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Topics */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4 text-blue-900">🔥 Tópicos Populares</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <button onClick={() => { setSearchQuery('como comprar'); setSelectedCategory('buying'); }} className="text-left text-blue-700 hover:text-blue-900 hover:underline">
              → Como fazer minha primeira compra?
            </button>
            <button onClick={() => { setSearchQuery('reembolso'); setSelectedCategory('policies'); }} className="text-left text-blue-700 hover:text-blue-900 hover:underline">
              → Como solicitar reembolso?
            </button>
            <button onClick={() => { setSearchQuery('começar a vender'); setSelectedCategory('selling'); }} className="text-left text-blue-700 hover:text-blue-900 hover:underline">
              → Como começar a vender?
            </button>
            <button onClick={() => { setSearchQuery('formas de pagamento'); setSelectedCategory('payment'); }} className="text-left text-blue-700 hover:text-blue-900 hover:underline">
              → Quais formas de pagamento aceitas?
            </button>
            <button onClick={() => { setSearchQuery('combos'); setSelectedCategory('buying'); }} className="text-left text-blue-700 hover:text-blue-900 hover:underline">
              → Como funcionam os combos?
            </button>
            <button onClick={() => { setSearchQuery('receber pagamento'); setSelectedCategory('selling'); }} className="text-left text-blue-700 hover:text-blue-900 hover:underline">
              → Como recebo o dinheiro das vendas?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
