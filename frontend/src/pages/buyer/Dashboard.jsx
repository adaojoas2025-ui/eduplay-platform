import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function BuyerDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Meu Painel</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/buyer/purchases" className="card hover:shadow-xl transition group">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-100 p-4 rounded-lg group-hover:bg-primary group-hover:text-white transition">
              <ShoppingBag className="h-8 w-8 text-primary group-hover:text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Minhas Compras</h2>
              <p className="text-gray-600">Ver produtos comprados e downloads</p>
            </div>
          </div>
        </Link>

        <Link to="/products" className="card hover:shadow-xl transition group">
          <div className="flex items-center space-x-4">
            <div className="bg-secondary-100 p-4 rounded-lg group-hover:bg-secondary group-hover:text-white transition">
              <ShoppingBag className="h-8 w-8 text-secondary group-hover:text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Explorar Produtos</h2>
              <p className="text-gray-600">Descobrir novos cursos e produtos</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
