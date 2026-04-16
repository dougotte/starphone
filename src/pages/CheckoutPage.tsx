import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, Copy, Check, X, Smartphone, DollarSign, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { generateOrderImage } from '../utils/orderImageGenerator';

type Page = 'home' | 'login' | 'register' | 'account' | 'admin-login' | 'admin-dashboard' | 'checkout';

type CartItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
};

type FormData = {
  name: string;
  email: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
  phone: string;
  cpf: string;
};

export default function CheckoutPage({
  onNavigate,
  cart,
  onCheckoutComplete,
}: {
  onNavigate: (page: Page) => void;
  cart: CartItem[];
  onCheckoutComplete: () => void;
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'dinheiro'>('pix');
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixKey, setPixKey] = useState('19997133652');
  const [copied, setCopied] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [completedOrderData, setCompletedOrderData] = useState<any>(null);
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    complement: '',
    phone: '',
    cpf: '',
  });

  const [loadingCep, setLoadingCep] = useState(false);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profile) {
      setForm(prev => ({
        ...prev,
        name: profile.name || '',
        phone: profile.phone || '',
        cep: profile.cep || '',
        street: profile.street || '',
        number: profile.number || '',
        complement: profile.complement || '',
        neighborhood: profile.neighborhood || '',
        city: profile.city || '',
        state: profile.state || '',
      }));
    }

    setForm(prev => ({
      ...prev,
      email: user.email || '',
    }));
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    const formattedCep = formatCEP(cep);
    setForm({ ...form, cep: formattedCep });

    if (cep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
          setMessage('CEP não encontrado');
        } else {
          setForm(prev => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
          }));
        }
      } catch (error) {
        setMessage('Erro ao buscar CEP');
        console.error(error);
      }
      setLoadingCep(false);
    }
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePixPaymentConfirmation = async () => {
    if (!currentOrderId) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', currentOrderId);

      if (error) throw error;

      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const whatsappMessage = encodeURIComponent(
        `✅ *PAGAMENTO CONFIRMADO - PIX*\n\n` +
        `*Pedido #${currentOrderId.substring(0, 8)}*\n\n` +
        `*📋 Dados do Cliente:*\n` +
        `Nome: ${form.name}\n` +
        `CPF: ${form.cpf}\n` +
        `Telefone: ${form.phone}\n` +
        `Email: ${form.email}\n\n` +
        `*📍 Endereço de Entrega:*\n` +
        `${form.street}, ${form.number}${form.complement ? `, ${form.complement}` : ''}\n` +
        `Bairro: ${form.neighborhood}\n` +
        `${form.city} - ${form.state}\n` +
        `CEP: ${form.cep}\n\n` +
        `*🛒 Produtos:*\n` +
        `${cart.map(item => `• ${item.name} (${item.brand})\n  Qtd: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}`).join('\n')}\n\n` +
        `*💰 Total: R$ ${total.toFixed(2)}*\n\n` +
        `Forma de Pagamento: PIX\n` +
        `Status: Pagamento Confirmado ✅`
      );

      const orderImageData = {
        orderId: currentOrderId,
        customerName: form.name,
        customerCpf: form.cpf,
        customerPhone: form.phone,
        customerEmail: form.email,
        address: {
          street: form.street,
          number: form.number,
          complement: form.complement,
          neighborhood: form.neighborhood,
          city: form.city,
          state: form.state,
          cep: form.cep,
        },
        items: cart,
        total,
        paymentMethod: 'pix' as const,
        paymentStatus: 'Pagamento Confirmado',
      };

      setCompletedOrderData({
        ...orderImageData,
        cartItems: cart,
      });
      setShowPixModal(false);
      setShowSuccessScreen(true);

      setTimeout(() => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = `https://api.whatsapp.com/send?phone=5519999921698&text=${whatsappMessage}`;
        } else {
          window.open(`https://wa.me/5519999921698?text=${whatsappMessage}`, '_blank');
        }
      }, 500);
    } catch (error) {
      setMessage('Erro ao confirmar pagamento');
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!user) {
      setMessage('Você precisa estar logado');
      setLoading(false);
      return;
    }

    if (!form.name || !form.email || !form.cpf || !form.phone) {
      setMessage('Preencha todos os campos obrigatórios');
      setLoading(false);
      return;
    }

    try {
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const { data: orderData, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          items: cart,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          customer_cpf: form.cpf,
          cep: form.cep,
          street: form.street,
          number: form.number,
          complement: form.complement,
          neighborhood: form.neighborhood,
          city: form.city,
          state: form.state,
          total_amount: total,
          payment_method: paymentMethod,
          payment_status: 'pending',
          status: 'pending',
          pix_key: pixKey,
          customer_data: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            cpf: form.cpf,
          },
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentOrderId(orderData.id);

      await supabase
        .from('user_profiles')
        .update({
          name: form.name,
          phone: form.phone,
          cep: form.cep,
          street: form.street,
          number: form.number,
          complement: form.complement,
          neighborhood: form.neighborhood,
          city: form.city,
          state: form.state,
        })
        .eq('user_id', user.id);

      if (paymentMethod === 'pix') {
        setShowPixModal(true);
      } else {
        const orderImageData = {
          orderId: orderData.id,
          customerName: form.name,
          customerCpf: form.cpf,
          customerPhone: form.phone,
          customerEmail: form.email,
          address: {
            street: form.street,
            number: form.number,
            complement: form.complement,
            neighborhood: form.neighborhood,
            city: form.city,
            state: form.state,
            cep: form.cep,
          },
          items: cart,
          total,
          paymentMethod: 'dinheiro' as const,
          paymentStatus: 'Pendente',
        };

        const whatsappMessage = encodeURIComponent(
          `🆕 *NOVO PEDIDO - PAGAMENTO EM DINHEIRO*\n\n` +
          `*Pedido #${orderData.id.substring(0, 8)}*\n\n` +
          `*📋 Dados do Cliente:*\n` +
          `Nome: ${form.name}\n` +
          `CPF: ${form.cpf}\n` +
          `Telefone: ${form.phone}\n` +
          `Email: ${form.email}\n\n` +
          `*📍 Endereço de Entrega:*\n` +
          `${form.street}, ${form.number}${form.complement ? `, ${form.complement}` : ''}\n` +
          `Bairro: ${form.neighborhood}\n` +
          `${form.city} - ${form.state}\n` +
          `CEP: ${form.cep}\n\n` +
          `*🛒 Produtos:*\n` +
          `${cart.map(item => `• ${item.name} (${item.brand})\n  Qtd: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}`).join('\n')}\n\n` +
          `*💰 Total: R$ ${total.toFixed(2)}*\n\n` +
          `Forma de Pagamento: Dinheiro 💵\n` +
          `Status: Aguardando Pagamento`
        );

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = `https://api.whatsapp.com/send?phone=5519999921698&text=${whatsappMessage}`;
        } else {
          window.open(`https://wa.me/5519999921698?text=${whatsappMessage}`, '_blank');
        }

        setCompletedOrderData({
          ...orderImageData,
          cartItems: cart,
        });
        setShowSuccessScreen(true);
      }
    } catch (error) {
      setMessage('Erro ao processar pedido');
      console.error(error);
    }

    setLoading(false);
  };

  if (showSuccessScreen && completedOrderData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="bg-[#00ff00] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={48} className="text-black" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Pedido Realizado!</h2>
              <p className="text-gray-600">Seu pedido foi enviado com sucesso</p>
            </div>

            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="font-bold text-xl mb-4 flex items-center">
                <Package className="mr-2" size={24} />
                Resumo do Pedido
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Número do Pedido:</span>
                  <span className="font-semibold">#{completedOrderData.orderId.substring(0, 8)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-semibold">{completedOrderData.customerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Telefone:</span>
                  <span className="font-semibold">{completedOrderData.customerPhone}</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-3">Produtos:</h4>
                <div className="space-y-2">
                  {completedOrderData.cartItems.map((item: CartItem) => (
                    <div key={item.id} className="flex justify-between text-sm border-b pb-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-gray-500">Qtd: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-[#00ff00]">R$ {completedOrderData.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Forma de Pagamento:</span>
                  <span className="font-semibold">{completedOrderData.paymentMethod === 'pix' ? 'PIX' : 'Dinheiro'}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Atenção:</strong> Seu pedido foi enviado para nosso WhatsApp.
                  Aguarde a confirmação da equipe.
                </p>
                <p className="text-sm text-blue-800 mt-2">
                  <strong>Não esqueça de enviar seu comprovante de pagamento junto ao pedido em nosso WhatsApp!</strong>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => onNavigate('account')}
                className="w-full bg-[#00ff00] text-black py-4 rounded-lg font-semibold hover:bg-[#00dd00] transition flex items-center justify-center space-x-2"
              >
                <Package size={20} />
                <span>Ver Meus Pedidos</span>
              </button>
              <button
                onClick={() => {
                  onCheckoutComplete();
                  setShowSuccessScreen(false);
                  onNavigate('home');
                }}
                className="w-full bg-gray-100 text-gray-900 py-4 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Continuar Comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 text-gray-900 hover:text-[#00ff00] mb-8"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg">Seu carrinho está vazio</p>
          </div>
        </div>
      </div>
    );
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2 text-gray-900 hover:text-[#00ff00] mb-8 transition"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Finalizar Compra</h1>

              {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
                  message.includes('sucesso') || message.includes('confirmado')
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                }`}>
                  <AlertCircle size={20} />
                  <span>{message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Dados Pessoais</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo *
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Digite seu nome completo"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                        autoComplete="off"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        required
                        maxLength={15}
                        value={form.phone}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value);
                          setForm({ ...form, phone: formatted });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                        CPF *
                      </label>
                      <input
                        id="cpf"
                        type="text"
                        placeholder="000.000.000-00"
                        required
                        maxLength={14}
                        value={form.cpf}
                        onChange={(e) => {
                          const cpf = e.target.value.replace(/\D/g, '');
                          const formatted = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                          setForm({ ...form, cpf: formatted });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Endereço de Entrega</h2>
                  <div className="mb-4">
                    <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                      CEP *
                    </label>
                    <input
                      id="cep"
                      type="text"
                      placeholder="00000-000"
                      required
                      maxLength={9}
                      value={form.cep}
                      onChange={handleCepChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent"
                    />
                    {loadingCep && <span className="text-sm text-gray-500 mt-1">Buscando CEP...</span>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                        Rua *
                      </label>
                      <input
                        id="street"
                        type="text"
                        placeholder="Nome da rua"
                        required
                        value={form.street}
                        onChange={(e) => setForm({ ...form, street: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                        Número *
                      </label>
                      <input
                        id="number"
                        type="text"
                        placeholder="123"
                        required
                        value={form.number}
                        onChange={(e) => setForm({ ...form, number: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="complement" className="block text-sm font-medium text-gray-700 mb-1">
                      Complemento (opcional)
                    </label>
                    <input
                      id="complement"
                      type="text"
                      placeholder="Apto, Bloco, etc"
                      value={form.complement}
                      onChange={(e) => setForm({ ...form, complement: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                        Bairro *
                      </label>
                      <input
                        id="neighborhood"
                        type="text"
                        placeholder="Nome do bairro"
                        required
                        value={form.neighborhood}
                        onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade *
                      </label>
                      <input
                        id="city"
                        type="text"
                        placeholder="Nome da cidade"
                        required
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        Estado *
                      </label>
                      <input
                        id="state"
                        type="text"
                        placeholder="UF"
                        required
                        maxLength={2}
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Forma de Pagamento</h2>
                  <div className="space-y-3">
                    <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'pix' ? 'border-[#00ff00] bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="pix"
                        checked={paymentMethod === 'pix'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'pix' | 'dinheiro')}
                        className="w-5 h-5"
                      />
                      <Smartphone className="text-[#00ff00]" size={24} />
                      <span className="text-gray-900 font-semibold">PIX</span>
                    </label>

                    <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'dinheiro' ? 'border-[#00ff00] bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="dinheiro"
                        checked={paymentMethod === 'dinheiro'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'pix' | 'dinheiro')}
                        className="w-5 h-5"
                      />
                      <DollarSign className="text-green-600" size={24} />
                      <span className="text-gray-900 font-semibold">Dinheiro (WhatsApp)</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00ff00] text-black py-4 rounded-lg font-bold hover:bg-[#00dd00] transition disabled:opacity-50 text-lg"
                >
                  {loading ? 'Processando...' : `Confirmar Pedido - R$ ${total.toFixed(2)}`}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Resumo do Pedido</h2>
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm border-b border-gray-200 pb-3">
                    <span className="text-gray-600">{item.name} x{item.quantity}</span>
                    <span className="font-semibold text-gray-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
                <span className="font-bold text-gray-900 text-lg">Total:</span>
                <span className="text-2xl font-bold text-[#00ff00]">R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPixModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowPixModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Pagamento via PIX</h2>

            <div className="bg-gray-100 rounded-xl p-6 mb-6">
              <p className="text-center text-gray-600 mb-4">Escaneie o QR Code ou copie a chave PIX:</p>

              <div className="bg-white p-4 rounded-lg mb-4 flex justify-center">
                <img
                  src="/qrcode-pix.jpeg"
                  alt="QR Code PIX"
                  className="w-48 h-48 object-contain rounded-lg"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-4 rounded-lg">
                <input
                  type="text"
                  value={pixKey}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 rounded border border-gray-300 text-sm min-w-0"
                />
                <button
                  onClick={copyPixKey}
                  className="bg-[#00ff00] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#00dd00] transition flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Valor: <span className="font-bold">R$ {total.toFixed(2)}</span>
              </p>
            </div>

            <button
              onClick={handlePixPaymentConfirmation}
              className="w-full bg-[#00ff00] text-black py-4 rounded-lg font-bold hover:bg-[#00dd00] transition"
            >
              Confirmar Pagamento
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Clique em "Confirmar Pagamento" após realizar a transferência
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
