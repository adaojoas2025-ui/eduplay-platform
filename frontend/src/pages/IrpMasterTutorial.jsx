import { Link } from 'react-router-dom';
import { FiPlayCircle, FiArrowLeft, FiUpload, FiKey, FiGift, FiCheckCircle } from 'react-icons/fi';

// Para publicar o vídeo de tutorial, troque a linha abaixo pelo link de incorporação
// (embed) do YouTube, ex: 'https://www.youtube.com/embed/SEU_ID_DO_VIDEO'
const VIDEO_EMBED_URL = '';

export default function IrpMasterTutorial() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/irp-master" className="inline-flex items-center gap-2 text-emerald-700 font-semibold mb-6 hover:underline">
          <FiArrowLeft /> Voltar para a página da IRP Master
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <FiPlayCircle className="text-3xl text-emerald-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tutorial — IRP Master Automação</h1>
              <p className="text-gray-600">Passo a passo para instalar, ativar e usar a extensão</p>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Assista ao vídeo abaixo ou siga o passo a passo para começar a usar a IRP Master
            no Comprasnet SIASG.
          </p>
        </div>

        {/* Vídeo */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          {VIDEO_EMBED_URL ? (
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <iframe
                className="w-full h-full"
                src={VIDEO_EMBED_URL}
                title="Tutorial IRP Master Automação"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video w-full rounded-lg bg-gray-100 flex flex-col items-center justify-center text-center p-6">
              <FiPlayCircle className="text-5xl text-gray-400 mb-3" />
              <p className="text-gray-600 font-semibold">Vídeo de tutorial em breve</p>
              <p className="text-gray-500 text-sm mt-1">Enquanto isso, siga o passo a passo abaixo.</p>
            </div>
          )}
        </div>

        {/* Passo a passo */}
        <div className="bg-white rounded-lg shadow-md p-8 prose prose-sm max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiGift className="text-emerald-700" /> 1. Teste grátis por 1 dia
          </h2>
          <ol className="list-decimal pl-6 text-gray-700 space-y-2 mb-6">
            <li>Instale a extensão IRP Master Automação no Chrome e clique no ícone para abrir o painel lateral.</li>
            <li>Na tela inicial, clique em <strong>"🎁 Testar grátis por 1 dia"</strong>.</li>
            <li>Informe seu e-mail e clique em <strong>"Enviar chave de teste"</strong>.</li>
            <li>Sua chave de licença é gerada e ativada automaticamente, e também enviada para o seu e-mail.</li>
            <li>O teste grátis é único por e-mail e por computador — após 1 dia, será necessário adquirir uma licença para continuar usando.</li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiKey className="text-emerald-700" /> 2. Ativando uma licença paga
          </h2>
          <ol className="list-decimal pl-6 text-gray-700 space-y-2 mb-6">
            <li>Clique em <strong>"Não tem chave? Comprar licença"</strong> para abrir a página de planos.</li>
            <li>Escolha o plano (mensal ou anual) e finalize o pagamento pelo Mercado Pago.</li>
            <li>Volte à extensão e clique em <strong>"✓ Verificar pagamento"</strong> — a licença é ativada automaticamente.</li>
            <li>Ou, se preferir, cole a chave recebida por e-mail no campo "Chave de licença" e clique em <strong>"Ativar licença"</strong>.</li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiUpload className="text-emerald-700" /> 3. Carregando a planilha de itens
          </h2>
          <ol className="list-decimal pl-6 text-gray-700 space-y-2 mb-6">
            <li>Abra a aba <strong>"Incluir Item"</strong> ou <strong>"Manter Item"</strong> no painel da extensão.</li>
            <li>Clique na área de upload e selecione a planilha Excel (.xlsx) com os itens.</li>
            <li>Confira os dados carregados na tabela.</li>
            <li>Acesse a página do IRP no Comprasnet SIASG e clique em iniciar — a extensão preenche os campos automaticamente.</li>
            <li>Acompanhe o progresso de cada item em tempo real e revise antes de finalizar.</li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiCheckCircle className="text-emerald-700" /> Dicas importantes
          </h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-2">
            <li>Sempre revise os dados preenchidos antes de finalizar atos oficiais no SIASG.</li>
            <li>Mantenha-se logado no Comprasnet em outra aba enquanto usa a extensão.</li>
            <li>Em caso de dúvidas, use o e-mail de suporte informado na página da IRP Master.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
