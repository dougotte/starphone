import { useState, useEffect } from 'react';
import { ShoppingCart as CartIcon, Menu, X, Instagram, MessageCircle, Search, User, LogOut, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import BrandFilter from '../components/BrandFilter';
import ProductList from '../components/ProductList';
import ShoppingCart from '../components/ShoppingCart';
import WhatsAppButton from '../components/WhatsAppButton';

type PageType = 'home' | 'login' | 'register' | 'account' | 'admin-login' | 'admin-dashboard' | 'checkout';

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

type Brand = {
  name: string;
  icon: string;
  color?: string;
};

export default function HomePage({
  onNavigate,
  cart,
  setCart
}: {
  onNavigate: (page: PageType) => void;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
}) {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [bannerSettings, setBannerSettings] = useState({
    title: 'PEÇAS & ACESSÓRIOS',
    subtitle: 'Hardware de qualidade para o seu celular',
    location_info: 'Conchal - SP • (19) 99992-1698',
    background_image_url: ''
  });

  useEffect(() => {
    loadBrands();
    loadAllProducts();
    loadBannerSettings();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedBrand, selectedTipo, searchQuery, products]);

  const loadBrands = async () => {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('order_position', { ascending: true });

    if (!error && data) {
      setBrands(data.map(cat => ({
        name: cat.name,
        icon: cat.icon,
        color: cat.color
      })));
    }
  };

  const loadAllProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('order_position', { ascending: true });

    if (error) {
      console.error('Error loading products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const loadBannerSettings = async () => {
    const { data, error } = await supabase
      .from('banner_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setBannerSettings({
        title: data.title,
        subtitle: data.subtitle,
        location_info: data.location_info,
        background_image_url: data.background_image_url || ''
      });
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (selectedBrand) {
      filtered = filtered.filter(p => p.brand === selectedBrand);
    }

    if (selectedTipo) {
      filtered = filtered.filter(p => p.tipo === selectedTipo);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        (p.model && p.model.toLowerCase().includes(query))
      );
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (product: Product, quantity: number) => {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-gray-800 sticky top-0 z-40 shadow-lg">
        <div className="bg-gray-800 text-white text-xs py-2">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#00ff00]" />
              <span>Conchal - SP</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ff00] transition">
                <Instagram size={14} />
              </a>
              <span>(19) 99992-1698</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/starphone.png" alt="StarPhone" className="h-10" />
              <div>
                <h1 className="text-2xl font-bold text-[#00ff00]">STARPHONE</h1>
                <p className="text-xs text-gray-400">Reparos Avançados iOS e Android</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <>
                  <button
                    onClick={() => onNavigate('account')}
                    className="text-white hover:text-[#00ff00] transition flex items-center gap-2"
                  >
                    <User size={20} />
                    <span>{user.email?.split('@')[0]}</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-400 hover:text-red-500 transition text-sm"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('login')}
                    className="text-white hover:text-[#00ff00] transition"
                  >
                    Entrar/Cadastrar
                  </button>
                </>
              )}
              <button
                onClick={() => onNavigate('admin-login')}
                className="text-gray-400 hover:text-[#00ff00] transition text-sm"
              >
                Admin
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 space-y-4 pb-4">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      onNavigate('account');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-white hover:text-[#00ff00] py-2"
                  >
                    Minha Conta
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left text-white hover:text-red-500 py-2"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onNavigate('login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-white hover:text-[#00ff00] py-2"
                  >
                    Entrar/Cadastrar
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  onNavigate('admin-login');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left text-white hover:text-[#00ff00] py-2"
              >
                Admin
              </button>
            </div>
          )}
        </div>
      </header>

      <div
        className="relative text-white py-16 mb-8 overflow-hidden"
        style={{
          backgroundImage: bannerSettings.background_image_url
            ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${bannerSettings.background_image_url})`
            : 'linear-gradient(to right, rgb(31, 41, 55), rgb(0, 0, 0), rgb(31, 41, 55))',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">{bannerSettings.title}</h2>
          <p className="text-xl text-[#00ff00] mb-2 drop-shadow-lg">{bannerSettings.subtitle}</p>
          <p className="text-gray-200 drop-shadow-lg">{bannerSettings.location_info}</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 hidden lg:block">
            <BrandFilter
              brands={brands}
              selectedBrand={selectedBrand}
              onSelectBrand={setSelectedBrand}
              selectedTipo={selectedTipo}
              onSelectTipo={setSelectedTipo}
            />
          </aside>

          <section className="lg:col-span-6">
            <div className="mb-6 lg:hidden space-y-3">
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <button
                    key={brand.name}
                    onClick={() => {
                      setSelectedBrand(brand.name);
                      setSelectedTipo(null);
                    }}
                    className={`flex-1 min-w-[30%] px-3 py-2 rounded-lg font-semibold transition text-sm ${
                      selectedBrand === brand.name
                        ? 'ring-2 ring-[#00ff00]'
                        : ''
                    }`}
                    style={{
                      backgroundColor: brand.color || '#f3f4f6',
                      color: brand.color ? '#fff' : '#374151'
                    }}
                  >
                    <span className="text-base mr-1">{brand.icon}</span>
                    {brand.name}
                  </button>
                ))}
              </div>

              {selectedBrand && (
                <div className="bg-white rounded-lg p-3 shadow-md">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Filtrar por tipo:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedTipo(null)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition text-xs ${
                        selectedTipo === null
                          ? 'ring-2 ring-[#00ff00] text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      style={{
                        backgroundColor: selectedTipo === null
                          ? brands.find(b => b.name === selectedBrand)?.color || '#000'
                          : undefined
                      }}
                    >
                      Todos
                    </button>
                    {['TELA', 'BATERIA', 'DOCK DE CARGA', 'TAMPA TRASEIRA', 'PERIFÉRICOS'].map((tipo) => (
                      <button
                        key={tipo}
                        onClick={() => setSelectedTipo(tipo)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition text-xs ${
                          selectedTipo === tipo
                            ? 'ring-2 ring-[#00ff00] text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                        style={{
                          backgroundColor: selectedTipo === tipo
                            ? brands.find(b => b.name === selectedBrand)?.color || '#000'
                            : undefined
                        }}
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-gray-900 px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:border-[#00ff00] focus:outline-none"
                />
                <Search className="absolute left-3 top-3.5 text-gray-500" size={20} />
              </div>
            </div>

            <ProductList
              products={filteredProducts}
              onAddToCart={addToCart}
              loading={loading}
            />
          </section>

          <aside className="lg:col-span-3 hidden lg:block">
            <ShoppingCart
              cart={cart}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={() => onNavigate('checkout')}
            />
          </aside>
        </div>
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-4 z-30">
        <button
          onClick={() => setMobileCartOpen(true)}
          className="w-full bg-[#00ff00] text-black py-4 rounded-lg font-bold flex items-center justify-center gap-2 relative"
        >
          {totalItems > 0 && (
            <span className="absolute -top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {totalItems}
            </span>
          )}
          <CartIcon size={24} />
          <span>Ver Carrinho</span>
        </button>
      </div>

      {mobileCartOpen && (
        <ShoppingCart
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={() => {
            setMobileCartOpen(false);
            onNavigate('checkout');
          }}
          isMobile
          onClose={() => setMobileCartOpen(false)}
        />
      )}

      <WhatsAppButton />

      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/starphone.png" alt="StarPhone" className="h-12" />
                <div>
                  <h3 className="text-xl font-bold text-[#00ff00]">STARPHONE</h3>
                  <p className="text-xs text-gray-400">Reparos Avançados iOS e Android</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Especialistas em peças e reparos de smartphones. Qualidade garantida!
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-[#00ff00]">LOCALIZAÇÃO</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="mt-1 flex-shrink-0 text-[#00ff00]" />
                  <p>R. Mogi Mirim, 152 - Centro, Conchal - SP, 13835-025</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-[#00ff00]">CONTATO</h4>
              <div className="space-y-3">
                <div className="text-gray-400 text-sm">
                  <p className="text-white font-medium">(19) 99992-1698</p>
                </div>
                <a
                  href="https://instagram.com/starphonecelulares"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-[#00ff00] transition text-sm"
                >
                  <Instagram size={18} />
                  <span>@starphonecelulares</span>
                </a>
              </div>
              <div className="mt-6">
                <h5 className="font-semibold mb-2 text-sm">ATENDIMENTO</h5>
                <p className="text-xs text-gray-400">Seg – Sex: 08:30 às 18:00</p>
                <p className="text-xs text-gray-400">Sábado: 08:30 às 13:00</p>
                <p className="text-xs text-gray-400">Domingo: Fechado</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 StarPhone — Todos os direitos reservados.
            </p>
            <a
              href="https://instagram.com/starphonecelulares"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2 relative z-10"
            >
              <Instagram size={18} />
              Siga no Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
