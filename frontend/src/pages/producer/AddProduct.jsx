import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../../services/api';
import { FiUpload, FiImage } from 'react-icons/fi';

export default function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Create product
      const productRes = await productAPI.create(formData);
      const productId = productRes.data.product.id;

      // Upload thumbnail if provided
      if (thumbnail) {
        await productAPI.uploadThumbnail(productId, thumbnail);
      }

      // Upload files if provided
      if (files.length > 0) {
        await productAPI.uploadFiles(productId, Array.from(files));
      }

      // Submit for approval
      await productAPI.update(productId, { status: 'PENDING' });

      alert('Produto criado e enviado para aprovação!');
      navigate('/producer/products');
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao criar produto');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Criar Novo Produto</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="space-y-6">
            <div>
              <label className="label">Título do Produto</label>
              <input
                type="text"
                required
                className="input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Curso Completo de React"
              />
            </div>

            <div>
              <label className="label">Descrição</label>
              <textarea
                required
                rows={6}
                className="input"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o que está incluído no produto..."
              />
            </div>

            <div>
              <label className="label">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className="input"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="99.90"
              />
            </div>

            <div>
              <label className="label flex items-center">
                <FiImage className="h-5 w-5 mr-2" />
                Imagem de Capa (Thumbnail)
              </label>
              <input
                type="file"
                accept="image/*"
                className="input"
                onChange={(e) => setThumbnail(e.target.files[0])}
              />
            </div>

            <div>
              <label className="label flex items-center">
                <FiUpload className="h-5 w-5 mr-2" />
                Arquivos do Produto (PDFs, vídeos, etc.)
              </label>
              <input
                type="file"
                multiple
                className="input"
                onChange={(e) => setFiles(e.target.files)}
              />
              {files.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {files.length} arquivo(s) selecionado(s)
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex-1 disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Criar Produto'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/producer/products')}
            className="btn btn-outline"
          >
            Cancelar
          </button>
        </div>

        <p className="text-sm text-gray-600">
          Após criar o produto, ele será enviado para aprovação. Você poderá editá-lo
          enquanto estiver pendente.
        </p>
      </form>
    </div>
  );
}
