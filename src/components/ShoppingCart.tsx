import { ShoppingCart as CartIcon, X, Trash2, Plus, Minus } from 'lucide-react';

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
};

type CartItem = Product & { quantity: number };

type ShoppingCartProps = {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  isMobile?: boolean;
  onClose?: () => void;
};

export default function ShoppingCart({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isMobile = false,
  onClose,
}: ShoppingCartProps) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
        <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Carrinho</h2>
            <button onClick={onClose} className="p-2">
              <X size={24} />
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-12">
              <CartIcon size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Seu carrinho está vazio</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b pb-4">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-black">{item.name}</h3>
                      <p className="text-xs text-gray-600">{item.brand}</p>
                      <p className="text-black font-bold mt-1">
                        R$ {item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="p-1 bg-gray-100 rounded"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 bg-gray-100 rounded"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="ml-auto text-red-500 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-black">Total</span>
                  <span className="text-black">R$ {total.toFixed(2)}</span>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full bg-[#00ff00] text-black py-4 rounded-lg font-bold hover:bg-[#00dd00] transition"
                >
                  Finalizar Pedido
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg h-fit sticky top-24">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CartIcon size={24} />
        Carrinho
        {totalItems > 0 && (
          <span className="bg-[#00ff00] text-black text-sm font-bold px-2 py-1 rounded-full">
            {totalItems}
          </span>
        )}
      </h2>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <CartIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Seu carrinho está vazio</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-3 border-b pb-4">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-black">{item.name}</h3>
                  <p className="text-xs text-gray-600">{item.brand}</p>
                  <p className="text-black font-bold mt-1 text-sm">
                    R$ {item.price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="ml-auto text-red-500 p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-black">Total</span>
              <span className="text-black">R$ {total.toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-[#00ff00] text-black py-3 rounded-lg font-bold hover:bg-[#00dd00] transition"
            >
              Finalizar Pedido
            </button>
          </div>
        </>
      )}
    </div>
  );
}
