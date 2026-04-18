import { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, Plus, Trash2, Users, Image, Tag, Package, ShoppingBag, Check, X, Printer, MapPin, Upload, GripVertical, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type PageType = 'home' | 'login' | 'register' | 'account' | 'admin-login' | 'admin-dashboard';

type Product = {
  id?: string;
  name: string;
  description: string;
  brand: string;
  price: number;
  stock: number;
  image_url: string;
  tipo?: string;
  valor_compra?: number;
  lucro?: number;
  estoque?: number;
  descricao?: string;
  segunda_opcao?: string;
  order_position?: number;
};

type Banner = {
  id?: string;
  title: string;
  subtitle: string;
  location_info: string;
  background_image_url?: string;
  disable_out_of_stock?: boolean;
  disable_zero_price?: boolean;
};

type Order = {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
  admin_notes?: string;
  items: any[];
  shipping_address?: any;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
};

type Category = {
  id?: string;
  name: string;
  icon: string;
  color: string;
  order_position: number;
  is_active: boolean;
};

type AdminUser = {
  id?: string;
  username: string;
  email: string;
  password: string;
  name: string;
};

const emptyProduct: Product = {
  name: '',
  description: '',
  brand: '',
  price: 0,
  stock: 0,
  image_url: '',
  tipo: '',
  valor_compra: 0,
  lucro: 0,
  estoque: 0,
  descricao: '',
  segunda_opcao: '',
  order_position: 0,
};

export default function AdminDashboard({ onNavigate }: { onNavigate: (page: PageType) => void }) {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'banners' | 'categories' | 'admins'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [productForm, setProductForm] = useState<Product>({ ...emptyProduct });
  const [bannerForm, setBannerForm] = useState<Banner>({
    title: 'PEÇAS & ACESSÓRIOS',
    subtitle: 'Hardware de qualidade para o seu celular',
    location_info: 'Conchal - SP • (19) 99562-7428',
    background_image_url: '',
  });

  const [categoryForm, setCategoryForm] = useState<Category>({
    name: '',
    icon: '📱',
    color: '#000000',
    order_position: 0,
    is_active: true,
  });

  const [adminForm, setAdminForm] = useState<AdminUser>({
    username: '',
    email: '',
    password: '',
    name: '',
  });

  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const [productBrandFilter, setProductBrandFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [disableOutOfStock, setDisableOutOfStock] = useState(false);
  const [disableZeroPrice, setDisableZeroPrice] = useState(false);

  const valorFinal = (productForm.valor_compra || 0) + (productForm.lucro || 0);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    setProductForm(prev => ({ ...prev, price: valorFinal }));
  }, [productForm.valor_compra, productForm.lucro]);

  const loadAllData = async () => {
    await Promise.all([
      loadProducts(),
      loadOrders(),
      loadBanners(),
      loadCategories(),
      loadAdmins(),
    ]);
    setLoading(false);
  };

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('order_position', { ascending: true });
    if (!error) setProducts(data || []);
  };

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setOrders(data || []);
  };

  const loadBanners = async () => {
    const { data, error } = await supabase
      .from('banner_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    if (!error && data) {
      setBanners([data]);
      setBannerForm({
        title: data.title,
        subtitle: data.subtitle,
        location_info: data.location_info,
        background_image_url: data.background_image_url || ''
      });
      setDisableOutOfStock(data.disable_out_of_stock ?? false);
      setDisableZeroPrice(data.disable_zero_price ?? false);
    }
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('order_position', { ascending: true });
    if (!error) setCategories(data || []);
  };

  const loadAdmins = async () => {
    const { data, error } = await supabase
      .from('admin_credentials')
      .select('id, username, name');
    if (!error) setAdmins(data || []);
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const finalPrice = (productForm.valor_compra || 0) + (productForm.lucro || 0);
    const submitData = {
      ...productForm,
      price: finalPrice,
      stock: productForm.estoque ?? productForm.stock,
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(submitData)
          .eq('id', editingProduct);
        if (error) throw error;
        setMessage('Produto atualizado!');
      } else {
        const maxPos = products.length > 0
          ? Math.max(...products.map(p => p.order_position || 0)) + 1
          : 1;
        const { error } = await supabase.from('products').insert([{ ...submitData, order_position: maxPos }]);
        if (error) throw error;
        setMessage('Produto cadastrado!');
      }

      setProductForm({ ...emptyProduct });
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      setMessage('Erro ao salvar produto: ' + (error as any).message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setMessage('Produto excluído!');
      loadProducts();
    }
  };

  const handleToggleSelectProduct = (id: string) => {
    setSelectedProducts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllProducts = () => {
    const filtered = getFilteredProducts();
    if (selectedProducts.size === filtered.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filtered.map(p => p.id!)));
    }
  };

  const handleDeleteSelectedProducts = async () => {
    if (selectedProducts.size === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${selectedProducts.size} produto(s)?`)) return;

    const ids = Array.from(selectedProducts);
    const { error } = await supabase.from('products').delete().in('id', ids);
    if (!error) {
      setMessage(`${ids.length} produto(s) excluído(s)!`);
      setSelectedProducts(new Set());
      loadProducts();
    } else {
      setMessage('Erro ao excluir produtos: ' + error.message);
    }
  };

  const handleEditProduct = (product: Product) => {
    setProductForm({ ...product });
    setEditingProduct(product.id!);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getFilteredProducts = () => {
    let filtered = productBrandFilter === 'all' ? products : products.filter(p => p.brand === productBrandFilter);
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.tipo || '').toLowerCase().includes(q) ||
        (p.segunda_opcao || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  const handleDragStart = (id: string) => {
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDrop = async (targetId: string) => {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }

    const filtered = getFilteredProducts();
    const allProducts = [...products];

    const draggingIndex = filtered.findIndex(p => p.id === draggingId);
    const targetIndex = filtered.findIndex(p => p.id === targetId);

    if (draggingIndex === -1 || targetIndex === -1) return;

    const reorderedFiltered = [...filtered];
    const [removed] = reorderedFiltered.splice(draggingIndex, 1);
    reorderedFiltered.splice(targetIndex, 0, removed);

    const filteredPositions = filtered
      .map(p => p.order_position ?? 0)
      .sort((a, b) => a - b);

    const updates: { id: string; order_position: number }[] = reorderedFiltered.map((p, idx) => ({
      id: p.id!,
      order_position: filteredPositions[idx],
    }));

    const updatedProducts = allProducts.map(p => {
      const update = updates.find(u => u.id === p.id);
      return update ? { ...p, order_position: update.order_position } : p;
    });

    setProducts(updatedProducts.sort((a, b) => (a.order_position ?? 0) - (b.order_position ?? 0)));

    for (const update of updates) {
      await supabase
        .from('products')
        .update({ order_position: update.order_position })
        .eq('id', update.id);
    }

    setDraggingId(null);
    setDragOverId(null);
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    setMessage('');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('Sessão não encontrada. Faça login novamente.');

      const fileExt = file.name.split('.').pop();
      const fileName = `banner-bg-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(fileName);
      setBannerForm({ ...bannerForm, background_image_url: publicUrl });
      setMessage('Imagem enviada com sucesso!');
    } catch (error) {
      setMessage('Erro ao enviar imagem: ' + (error as any).message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleShopSettingToggle = async (field: 'disable_out_of_stock' | 'disable_zero_price', value: boolean) => {
    const bannerId = banners[0]?.id;
    if (!bannerId) {
      await loadBanners();
      return;
    }
    if (field === 'disable_out_of_stock') setDisableOutOfStock(value);
    else setDisableZeroPrice(value);

    const { error } = await supabase
      .from('banner_settings')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', bannerId);
    if (error) {
      if (field === 'disable_out_of_stock') setDisableOutOfStock(!value);
      else setDisableZeroPrice(!value);
      setMessage('Erro ao salvar configuração: ' + error.message);
    }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const bannerId = banners[0]?.id;
      if (bannerId) {
        const { error } = await supabase
          .from('banner_settings')
          .update({
            title: bannerForm.title,
            subtitle: bannerForm.subtitle,
            location_info: bannerForm.location_info,
            background_image_url: bannerForm.background_image_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', bannerId);
        if (error) throw error;
        setMessage('Configurações atualizadas!');
      }
      await loadBanners();
    } catch (error) {
      setMessage('Erro ao salvar configurações');
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === 'cancelled') updates.payment_status = 'refused';

      const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
      if (error) throw error;
      setMessage('Pedido recusado!');
      await loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      setMessage('Erro ao atualizar status');
    }
  };

  const handleOrderPaymentUpdate = async (orderId: string, paymentStatus: string) => {
    try {
      const updates: any = { payment_status: paymentStatus };
      if (paymentStatus === 'paid') updates.paid_at = new Date().toISOString();

      const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
      if (error) throw error;
      setMessage('Pagamento atualizado!');
      await loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      setMessage('Erro ao atualizar pagamento');
    }
  };

  const handlePrintLabel = (order: Order) => {
    const items = order.items || [];
    const itemsHTML = items.map((item: any) =>
      `<div class="row">- ${item.name || 'Produto'} (Qtd: ${item.quantity || 0})</div>`
    ).join('');

    const street = order.street || order.shipping_address?.street || 'N/A';
    const number = order.number || order.shipping_address?.number || 'S/N';
    const complement = order.complement || order.shipping_address?.complement || '';
    const neighborhood = order.neighborhood || order.shipping_address?.neighborhood || 'N/A';
    const city = order.city || order.shipping_address?.city || 'N/A';
    const state = order.state || order.shipping_address?.state || 'N/A';
    const cep = order.cep || order.shipping_address?.cep || 'N/A';

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir a etiqueta');
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Etiqueta de Envio - Pedido #${order.id.substring(0, 8)}</title>
  <style>
    * { box-sizing: border-box; }
    @media print {
      @page { size: 10cm 15cm; margin: 0; }
      html, body { width: 10cm; height: 15cm; margin: 0; padding: 0; }
      .no-print { display: none !important; }
      .label-wrap { width: 10cm; height: 15cm; padding: 0.4cm; overflow: hidden; }
    }
    body { font-family: Arial, sans-serif; font-size: 14px; margin: 0; padding: 0; background: #fff; color: #000; }
    .label-wrap { width: 10cm; padding: 0.4cm; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 6px; }
    .header h2 { margin: 0; font-size: 14px; letter-spacing: 1px; }
    .header p { margin: 2px 0 0; font-size: 14px; }
    .section { margin-bottom: 6px; }
    .section-label { font-weight: bold; font-size: 14px; text-transform: uppercase; color: #444; border-bottom: 1px solid #ccc; margin-bottom: 3px; padding-bottom: 1px; }
    .row { font-size: 14px; margin-bottom: 2px; line-height: 1.3; }
    .address-box { border: 1.5px solid #000; padding: 5px 7px; margin-bottom: 6px; border-radius: 2px; }
    .totals { border-top: 2px solid #000; padding-top: 5px; margin-top: 4px; }
    .no-print { text-align: center; margin: 16px 0; }
    .no-print button { background: #2563eb; color: white; padding: 8px 18px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
  </style>
</head>
<body>
  <div class="no-print"><button onclick="window.print()">Imprimir Etiqueta</button></div>
  <div class="label-wrap">
    <div class="header">
      <h2>ETIQUETA DE ENVIO</h2>
      <p><strong>Pedido #${order.id.substring(0, 8)}</strong> &nbsp;|&nbsp; ${new Date(order.created_at).toLocaleString('pt-BR')}</p>
    </div>
    <div class="section">
      <div class="section-label">Destinatario</div>
      <div class="row"><strong>${order.customer_name || 'N/A'}</strong></div>
      <div class="row">Tel: ${order.customer_phone || 'N/A'}</div>
      <div class="row">Email: ${order.customer_email || 'N/A'}</div>
    </div>
    <div class="address-box">
      <div class="section-label">Endereco de Entrega</div>
      <div class="row"><strong>${street}, ${number}</strong></div>
      ${complement ? `<div class="row">Compl: ${complement}</div>` : ''}
      <div class="row">Bairro: ${neighborhood}</div>
      <div class="row">Cidade: ${city} - ${state}</div>
      <div class="row">CEP: <strong>${cep}</strong></div>
    </div>
    <div class="section">
      <div class="section-label">Produtos</div>
      ${itemsHTML || '<div class="row">Nenhum produto</div>'}
    </div>
    <div class="totals">
      <div class="row"><strong>Total: R$ ${order.total_amount.toFixed(2)}</strong></div>
      <div class="row">Pagamento: ${order.payment_method === 'pix' ? 'PIX' : 'Dinheiro'}</div>
      <div class="row">Status: ${order.payment_status === 'paid' ? 'Pago' : 'Pendente'}</div>
    </div>
  </div>
  <div class="no-print"><button onclick="window.print()">Imprimir Etiqueta</button></div>
</body>
</html>`);
    printWindow.document.close();
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;

    try {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;
      setMessage('Pedido excluído com sucesso!');
      await loadOrders();
    } catch (error) {
      setMessage('Erro ao excluir pedido');
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      if (editingCategory) {
        const { error } = await supabase.from('product_categories').update(categoryForm).eq('id', editingCategory);
        if (error) throw error;
        setMessage('Marca atualizada!');
      } else {
        const { error } = await supabase.from('product_categories').insert([categoryForm]);
        if (error) throw error;
        setMessage('Marca cadastrada!');
      }

      setCategoryForm({ name: '', icon: '📱', color: '#000000', order_position: 0, is_active: true });
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      setMessage('Erro ao salvar marca: ' + (error as any).message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta marca?')) return;
    const { error } = await supabase.from('product_categories').delete().eq('id', id);
    if (!error) {
      setMessage('Marca excluída!');
      loadCategories();
    }
  };

  const handleEditCategory = (category: Category) => {
    setCategoryForm(category);
    setEditingCategory(category.id!);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!adminForm.username || !adminForm.password || !adminForm.name) {
      setMessage('Preencha todos os campos');
      return;
    }

    try {
      const { error } = await supabase.rpc('create_admin_user', {
        p_username: adminForm.username,
        p_password: adminForm.password,
        p_name: adminForm.name,
      });

      if (error) throw error;
      setMessage('Administrador cadastrado!');
      setAdminForm({ username: '', email: '', password: '', name: '' });
      loadAdmins();
    } catch (error) {
      setMessage('Erro ao cadastrar administrador: ' + (error as any).message);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este administrador?')) return;
    const { error } = await supabase.from('admin_credentials').delete().eq('id', id);
    if (!error) {
      setMessage('Administrador excluído!');
      loadAdmins();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  const filteredProducts = getFilteredProducts();
  const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2 text-white hover:text-[#00ff00] transition"
            >
              <ArrowLeft size={20} />
              <span>Voltar</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-white hover:text-red-500 transition"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h1 className="text-3xl font-bold text-black mb-8">Painel Administrativo</h1>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes('Erro') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
              }`}>
                {message}
              </div>
            )}

            <div className="flex space-x-2 mb-8 border-b border-gray-200 overflow-x-auto">
              {[
                { key: 'products', icon: <Package size={20} />, label: 'Produtos' },
                { key: 'orders', icon: <ShoppingBag size={20} />, label: 'Pedidos' },
                { key: 'banners', icon: <Image size={20} />, label: 'Banner Home' },
                { key: 'categories', icon: <Tag size={20} />, label: 'Marcas' },
                { key: 'admins', icon: <Users size={20} />, label: 'Administradores' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`pb-3 px-4 font-semibold flex items-center space-x-2 whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'text-[#00ff00] border-b-2 border-[#00ff00]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {activeTab === 'products' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  {editingProduct ? 'Editar Produto' : 'Cadastrar Produto'}
                </h2>
                <form onSubmit={handleProductSubmit} className="space-y-4 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                      <input
                        type="text"
                        placeholder="Ex: iPhone 15 Pro Max"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                      <select
                        value={productForm.brand}
                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none"
                        required
                      >
                        <option value="">Selecione uma marca</option>
                        {categories.filter(c => c.is_active).map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.icon} {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                      <select
                        value={productForm.tipo || ''}
                        onChange={(e) => setProductForm({ ...productForm, tipo: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none"
                      >
                        <option value="">Selecione um tipo</option>
                        <option value="TELA">TELA</option>
                        <option value="BATERIA">BATERIA</option>
                        <option value="DOCK DE CARGA">DOCK DE CARGA</option>
                        <option value="TAMPA TRASEIRA">TAMPA TRASEIRA</option>
                        <option value="PERIFÉRICOS">PERIFÉRICOS</option>
                        <option value="CÂMERA">CÂMERA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço de Custo (R$)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={productForm.valor_compra || ''}
                        onChange={(e) => setProductForm({ ...productForm, valor_compra: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Margem de Lucro (R$)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={productForm.lucro || ''}
                        onChange={(e) => setProductForm({ ...productForm, lucro: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor Final (R$)</label>
                      <input
                        type="number"
                        value={valorFinal.toFixed(2)}
                        readOnly
                        className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-700 font-semibold cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Calculado automaticamente: Preço de Custo + Margem de Lucro</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Segunda Opção</label>
                      <input
                        type="text"
                        placeholder="Ex: A1234"
                        value={productForm.segunda_opcao || ''}
                        onChange={(e) => setProductForm({ ...productForm, segunda_opcao: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estoque (unidades)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={productForm.estoque ?? productForm.stock ?? ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setProductForm({ ...productForm, estoque: val, stock: val });
                        }}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none"
                        required
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      placeholder="Descreva as características do produto..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                    <input
                      type="url"
                      placeholder="https://images.pexels.com/..."
                      value={productForm.image_url}
                      onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="bg-[#00ff00] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#00dd00] transition"
                    >
                      {editingProduct ? 'Atualizar Produto' : 'Cadastrar Produto'}
                    </button>
                    {editingProduct && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(null);
                          setProductForm({ ...emptyProduct });
                        }}
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>

                <div className="mb-4 space-y-3">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                      <span className="text-sm font-medium text-gray-700 flex-1 pr-4">
                        Você deseja desabilitar a compra dos produtos sem estoque?
                      </span>
                      <button
                        type="button"
                        onClick={() => handleShopSettingToggle('disable_out_of_stock', !disableOutOfStock)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                          disableOutOfStock ? 'bg-[#00ff00]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200 ${
                            disableOutOfStock ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                      <span className="text-sm font-medium text-gray-700 flex-1 pr-4">
                        Você deseja desabilitar a compra dos produtos com o preço zerado?
                      </span>
                      <button
                        type="button"
                        onClick={() => handleShopSettingToggle('disable_zero_price', !disableZeroPrice)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                          disableZeroPrice ? 'bg-[#00ff00]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200 ${
                            disableZeroPrice ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar produto por nome, marca ou tipo..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none bg-white"
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-bold">Produtos Cadastrados ({filteredProducts.length}/{products.length})</h3>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setProductBrandFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          productBrandFilter === 'all'
                            ? 'bg-[#00ff00] text-black'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Todos
                      </button>
                      {uniqueBrands.map(brand => (
                        <button
                          key={brand}
                          onClick={() => setProductBrandFilter(brand)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            productBrandFilter === brand
                              ? 'bg-[#00ff00] text-black'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={filteredProducts.length > 0 && filteredProducts.every(p => selectedProducts.has(p.id!))}
                        onChange={handleSelectAllProducts}
                        className="w-4 h-4 accent-[#00ff00]"
                      />
                      Marcar todos
                    </label>
                    {selectedProducts.size > 0 && (
                      <button
                        onClick={handleDeleteSelectedProducts}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                      >
                        <Trash2 size={16} />
                        Excluir ({selectedProducts.size})
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                  <GripVertical size={14} />
                  Arraste os produtos para reordenar. A ordem aqui é a mesma exibida na home.
                </p>

                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      draggable
                      onDragStart={() => handleDragStart(product.id!)}
                      onDragOver={(e) => handleDragOver(e, product.id!)}
                      onDrop={() => handleDrop(product.id!)}
                      onDragEnd={() => { setDraggingId(null); setDragOverId(null); }}
                      className={`flex items-center gap-3 border p-4 rounded-lg transition cursor-grab active:cursor-grabbing select-none ${
                        draggingId === product.id ? 'opacity-50 border-[#00ff00]' :
                        dragOverId === product.id ? 'border-[#00ff00] bg-green-50' :
                        selectedProducts.has(product.id!) ? 'border-red-400 bg-red-50' :
                        'hover:bg-gray-50'
                      }`}
                    >
                      <GripVertical size={18} className="text-gray-400 shrink-0" />
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id!)}
                        onChange={() => handleToggleSelectProduct(product.id!)}
                        className="w-4 h-4 shrink-0 accent-[#00ff00]"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold truncate">{product.name}</h4>
                        <p className="text-sm text-gray-600">
                          {product.brand}
                          {product.tipo ? ` • ${product.tipo}` : ''}
                          {' • '}
                          <span className={product.price === 0 ? 'text-red-600 font-semibold' : ''}>
                            R$ {product.price.toFixed(2)}
                          </span>
                          {` • Estoque: ${product.estoque ?? product.stock}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id!)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Gerenciar Pedidos</h2>
                <div className="mb-4 relative">
                  <input
                    type="text"
                    placeholder="Buscar por nome, e-mail ou telefone do cliente..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none bg-white"
                  />
                  <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                </div>
                <div className="space-y-4">
                  {orders.filter(o => {
                    if (!orderSearch) return true;
                    const q = orderSearch.toLowerCase();
                    return (
                      o.customer_name?.toLowerCase().includes(q) ||
                      o.customer_email?.toLowerCase().includes(q) ||
                      o.customer_phone?.toLowerCase().includes(q)
                    );
                  }).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhum pedido encontrado</p>
                  ) : (
                    orders.filter(o => {
                      if (!orderSearch) return true;
                      const q = orderSearch.toLowerCase();
                      return (
                        o.customer_name?.toLowerCase().includes(q) ||
                        o.customer_email?.toLowerCase().includes(q) ||
                        o.customer_phone?.toLowerCase().includes(q)
                      );
                    }).map((order) => (
                      <div key={order.id} className="border rounded-lg p-6 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg">Pedido #{order.id.substring(0, 8)}</h3>
                            <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">R$ {order.total_amount.toFixed(2)}</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                              order.payment_status === 'refused' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.payment_status === 'paid' ? 'Pago' : order.payment_status === 'refused' ? 'Recusado' : 'Pendente'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Cliente</p>
                            <p className="text-sm">{order.customer_name}</p>
                            <p className="text-sm text-gray-600">{order.customer_email}</p>
                            <p className="text-sm text-gray-600">{order.customer_phone}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Forma de Pagamento</p>
                            <p className="text-sm capitalize">{order.payment_method}</p>
                          </div>
                        </div>

                        {(order.street || order.shipping_address) && (
                          <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <MapPin size={16} className="mr-2" />
                              Endereço de Entrega
                            </p>
                            <p className="text-sm font-medium">
                              {order.street || order.shipping_address?.street || 'N/A'}, {order.number || order.shipping_address?.number || 'S/N'}
                              {(order.complement || order.shipping_address?.complement) && `, ${order.complement || order.shipping_address?.complement}`}
                            </p>
                            <p className="text-sm">Bairro: {order.neighborhood || order.shipping_address?.neighborhood || 'N/A'}</p>
                            <p className="text-sm">{order.city || order.shipping_address?.city || 'N/A'} - {order.state || order.shipping_address?.state || 'N/A'}</p>
                            <p className="text-sm font-medium">CEP: {order.cep || order.shipping_address?.cep || 'N/A'}</p>
                          </div>
                        )}

                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Produtos</p>
                          <div className="space-y-1">
                            {order.items && order.items.map((item: any, idx: number) => (
                              <p key={idx} className="text-sm">
                                • {item.name} - Qtd: {item.quantity} - R$ {(item.price * item.quantity).toFixed(2)}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4 border-t">
                          {order.payment_status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleOrderPaymentUpdate(order.id, 'paid')}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                              >
                                <Check size={16} />
                                Confirmar Pagamento
                              </button>
                              <button
                                onClick={() => handleOrderStatusUpdate(order.id, 'cancelled')}
                                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                              >
                                <X size={16} />
                                Recusar Pedido
                              </button>
                            </>
                          )}
                          {order.payment_status === 'paid' && (
                            <div className="flex items-center gap-2 text-green-600 font-semibold">
                              <Check size={20} />
                              <span>Pagamento Confirmado</span>
                            </div>
                          )}
                          {order.payment_status === 'refused' && (
                            <div className="flex items-center gap-2 text-red-600 font-semibold">
                              <X size={20} />
                              <span>Pedido Recusado</span>
                            </div>
                          )}
                          <div className="ml-auto flex gap-2">
                            <button
                              onClick={() => handlePrintLabel(order)}
                              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                            >
                              <Printer size={16} />
                              Imprimir Etiqueta
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
                            >
                              <Trash2 size={16} />
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'banners' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Editar Banner da Home</h2>
                <p className="text-gray-600 mb-6">Edite os textos e imagem de fundo do banner principal</p>
                <form onSubmit={handleBannerSubmit} className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Image size={20} className="text-blue-600" />
                      Imagem de Fundo do Banner
                    </label>
                    <p className="text-xs text-gray-600 mb-4">Recomendamos imagens em alta resolução (mínimo 1920x400px)</p>

                    {bannerForm.background_image_url && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-2">Imagem atual:</p>
                        <div className="relative rounded-lg overflow-hidden border-2 border-gray-300">
                          <img src={bannerForm.background_image_url} alt="Banner background" className="w-full h-32 object-cover" />
                        </div>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none bg-white"
                      disabled={uploadingImage}
                    />
                    {uploadingImage && <p className="text-sm text-blue-600 mt-2">Enviando imagem...</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Título Principal</label>
                    <input
                      type="text"
                      placeholder="Ex: PEÇAS & ACESSÓRIOS"
                      value={bannerForm.title}
                      onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none text-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtítulo</label>
                    <input
                      type="text"
                      placeholder="Ex: Hardware de qualidade para o seu celular"
                      value={bannerForm.subtitle}
                      onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Informações de Localização</label>
                    <input
                      type="text"
                      placeholder="Ex: Conchal - SP • (19) 99562-7428"
                      value={bannerForm.location_info}
                      onChange={(e) => setBannerForm({ ...bannerForm, location_info: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#00ff00] text-black px-6 py-4 rounded-lg font-bold hover:bg-[#00dd00] transition text-lg"
                  >
                    Salvar Alterações
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'categories' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  {editingCategory ? 'Editar Marca' : 'Cadastrar Marca'}
                </h2>
                <form onSubmit={handleCategorySubmit} className="space-y-4 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Marca</label>
                      <input
                        type="text"
                        placeholder="Ex: Apple, Samsung, Xiaomi"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
                      <select
                        value={categoryForm.icon}
                        onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none text-xl"
                        required
                      >
                        <option value="📱">📱 Smartphone</option>
                        <option value="🔲">🔲 Apple</option>
                        <option value="⬛">⬛ Samsung</option>
                        <option value="🟥">🔴 Xiaomi</option>
                        <option value="🟦">🟦 Motorola</option>
                        <option value="🟧">🟧 Realme</option>
                        <option value="🟨">🟨 LG</option>
                        <option value="⚫">⚫ Outros</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cor de Fundo</label>
                      <input
                        type="color"
                        value={categoryForm.color}
                        onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                        className="w-full h-12 px-2 py-1 border rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Posição (ordem)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={categoryForm.order_position}
                        onChange={(e) => setCategoryForm({ ...categoryForm, order_position: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none"
                        min="0"
                      />
                    </div>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={categoryForm.is_active}
                      onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                      className="w-5 h-5 text-[#00ff00] rounded focus:ring-[#00ff00]"
                    />
                    <span className="text-sm font-medium text-gray-700">Marca Ativa</span>
                  </label>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="bg-[#00ff00] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#00dd00] transition"
                    >
                      {editingCategory ? 'Atualizar Marca' : 'Cadastrar Marca'}
                    </button>
                    {editingCategory && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null);
                          setCategoryForm({ name: '', icon: '📱', color: '#000000', order_position: 0, is_active: true });
                        }}
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>

                <h3 className="text-xl font-bold mb-4">Marcas Cadastradas</h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex justify-between items-center border p-4 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 rounded flex items-center justify-center text-2xl" style={{ backgroundColor: category.color }}>
                          {category.icon}
                        </div>
                        <div>
                          <h4 className="font-bold">{category.name}</h4>
                          <p className="text-sm text-gray-600">Posição: {category.order_position} - {category.is_active ? 'Ativa' : 'Inativa'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id!)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'admins' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Cadastrar Novo Administrador</h2>
                <form onSubmit={handleAdminSubmit} className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      placeholder="Ex: João da Silva"
                      value={adminForm.name}
                      onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                    <input
                      type="text"
                      placeholder="Ex: joaosilva"
                      value={adminForm.username}
                      onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:outline-none"
                      required
                      minLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#00ff00] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#00dd00] transition"
                  >
                    Cadastrar Administrador
                  </button>
                </form>

                <h3 className="text-xl font-bold mb-4">Administradores</h3>
                <div className="space-y-3">
                  {admins.map((admin) => (
                    <div key={admin.id} className="flex justify-between items-center border p-4 rounded-lg hover:bg-gray-50">
                      <div>
                        <h4 className="font-bold">{admin.name}</h4>
                        <p className="text-sm text-gray-600">@{admin.username}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAdmin(admin.id!)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
