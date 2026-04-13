import { Plus, Minus, Smartphone } from 'lucide-react';
import { useState } from 'react';

type Product = {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  original_price: number | null;
  description: string;
  image_url: string;
  storage: string;
  color: string;
  in_stock: boolean;
  tipo?: string;
};

type ProductListProps = {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  loading?: boolean;
};

export default function ProductList({ products, onAddToCart, loading }: ProductListProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getQuantity = (productId: string) => quantities[productId] || 1;

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantities({ ...quantities, [productId]: newQuantity });
  };

  const handleAddToCart = (product: Product) => {
    const quantity = getQuantity(product.id);
    onAddToCart(product, quantity);
    setQuantities({ ...quantities, [product.id]: 1 });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum produto encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="bg-gray-900 text-white px-6 py-3 font-semibold hidden md:grid grid-cols-12 gap-4 items-center text-sm">
        <div className="col-span-7">PRODUTO</div>
        <div className="col-span-2 text-center">VALOR</div>
        <div className="col-span-3 text-center">AÇÃO</div>
      </div>

      <div className="divide-y divide-gray-200">
        {products.map((product) => (
          <div
            key={product.id}
            className="px-6 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="hidden md:grid grid-cols-12 gap-4 items-center">
              <div className="col-span-7 flex items-center gap-3">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
                  {product.tipo && (
                    <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-0.5">
                      {product.tipo}
                    </span>
                  )}
                  {product.description && (
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                      {product.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="col-span-2 text-center">
                <p className="text-lg font-bold text-black whitespace-nowrap">
                  R$ {product.price.toFixed(2)}
                </p>
              </div>

              <div className="col-span-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(product.id, getQuantity(product.id) - 1)}
                      className="px-2 py-1 hover:bg-gray-100 transition"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 py-1 min-w-[2.5rem] text-center font-medium border-x border-gray-300 text-sm">
                      {getQuantity(product.id)}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, getQuantity(product.id) + 1)}
                      className="px-2 py-1 hover:bg-gray-100 transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-[#00ff00] text-black px-4 py-1.5 rounded-lg font-semibold hover:bg-[#00dd00] transition text-sm w-full"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>
            </div>

            <div className="md:hidden flex items-start gap-3">
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                <Smartphone size={18} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">
                  {product.name}
                </h3>
                {product.tipo && (
                  <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mb-1">
                    {product.tipo}
                  </span>
                )}
                <p className="text-base font-bold text-black whitespace-nowrap">
                  R$ {product.price.toFixed(2)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => updateQuantity(product.id, getQuantity(product.id) - 1)}
                    className="px-2 py-1 hover:bg-gray-100 transition"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-2 py-1 min-w-[2rem] text-center font-medium border-x border-gray-300 text-sm">
                    {getQuantity(product.id)}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, getQuantity(product.id) + 1)}
                    className="px-2 py-1 hover:bg-gray-100 transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="bg-[#00ff00] text-black px-3 py-1.5 rounded-lg font-semibold hover:bg-[#00dd00] transition text-xs whitespace-nowrap"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
