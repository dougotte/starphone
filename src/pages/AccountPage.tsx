import { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type PageType = 'home' | 'login' | 'register' | 'account' | 'admin-login' | 'admin-dashboard';

type UserProfile = {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

type Order = {
  id: string;
  items: any[];
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
  paid_at: string | null;
  customer_name: string;
  customer_phone: string;
};

export default function AccountPage({ onNavigate }: { onNavigate: (page: PageType) => void }) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

  useEffect(() => {
    loadProfile();
    loadOrders();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error);
    } else if (data) {
      setProfile({
        name: data.name || '',
        email: data.email || user?.email || '',
        cpf: data.cpf || '',
        phone: data.phone || '',
        cep: data.cep || '',
        street: data.street || '',
        number: data.number || '',
        complement: data.complement || '',
        neighborhood: data.neighborhood || '',
        city: data.city || '',
        state: data.state || '',
      });
    } else {
      setProfile(prev => ({ ...prev, email: user?.email || '' }));
    }

    setLoading(false);
  };

  const loadOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading orders:', error);
    } else {
      setOrders(data || []);
    }
  };

  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    setProfile({ ...profile, cep: cleanCep });

    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setProfile({
            ...profile,
            cep: cleanCep,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
          });
        } else {
          setMessage('CEP não encontrado');
        }
      } catch (error) {
        console.error('Error fetching CEP:', error);
        setMessage('Erro ao buscar CEP');
      }
      setLoadingCep(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user!.id)
      .maybeSingle();

    let error;
    if (existingProfile) {
      const result = await supabase
        .from('user_profiles')
        .update(profile)
        .eq('user_id', user!.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('user_profiles')
        .insert({ ...profile, user_id: user!.id });
      error = result.error;
    }

    if (error) {
      setMessage('Erro ao salvar perfil');
      console.error('Error saving profile:', error);
    } else {
      setMessage('Perfil atualizado com sucesso!');
      setIsEditing(false);
    }

    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
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
            <div className="flex items-center space-x-4 mb-8">
              <div className="bg-[#00ff00] p-4 rounded-full">
                <UserIcon className="h-8 w-8 text-black" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-black">Minha Conta</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="flex space-x-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-2 px-4 font-semibold transition ${
                  activeTab === 'profile'
                    ? 'text-[#00ff00] border-b-2 border-[#00ff00]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Perfil
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-2 px-4 font-semibold transition ${
                  activeTab === 'orders'
                    ? 'text-[#00ff00] border-b-2 border-[#00ff00]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Meus Pedidos
              </button>
            </div>

            {activeTab === 'profile' ? (
              <form onSubmit={handleSave} className="space-y-6">
              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.includes('sucesso')
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                }`}>
                  {message}
                </div>
              )}

              {!isEditing && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="bg-[#00ff00] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#00dd00] transition"
                  >
                    Editar Dados
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Seu nome"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="seu@email.com"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
                    CPF
                  </label>
                  <input
                    id="cpf"
                    type="text"
                    value={profile.cpf}
                    onChange={(e) => setProfile({ ...profile, cpf: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="000.000.000-00"
                    maxLength={11}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="(00) 00000-0000"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-black mb-4">Endereço</h3>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-2">
                      CEP
                    </label>
                    <input
                      id="cep"
                      type="text"
                      value={profile.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="00000-000"
                      maxLength={8}
                      disabled={!isEditing}
                    />
                    {loadingCep && (
                      <p className="text-sm text-gray-500 mt-1">Buscando endereço...</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                      Rua
                    </label>
                    <input
                      id="street"
                      type="text"
                      value={profile.street}
                      onChange={(e) => setProfile({ ...profile, street: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent bg-gray-100"
                      placeholder="Nome da rua"
                      readOnly
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
                        Número
                      </label>
                      <input
                        id="number"
                        type="text"
                        value={profile.number}
                        onChange={(e) => setProfile({ ...profile, number: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="123"
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <label htmlFor="complement" className="block text-sm font-medium text-gray-700 mb-2">
                        Complemento
                      </label>
                      <input
                        id="complement"
                        type="text"
                        value={profile.complement}
                        onChange={(e) => setProfile({ ...profile, complement: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Apt, Bloco, etc"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-2">
                      Bairro
                    </label>
                    <input
                      id="neighborhood"
                      type="text"
                      value={profile.neighborhood}
                      onChange={(e) => setProfile({ ...profile, neighborhood: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent bg-gray-100"
                      placeholder="Bairro"
                      readOnly
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade
                      </label>
                      <input
                        id="city"
                        type="text"
                        value={profile.city}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent bg-gray-100"
                        placeholder="Cidade"
                        readOnly
                      />
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <input
                        id="state"
                        type="text"
                        value={profile.state}
                        onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent bg-gray-100"
                        placeholder="UF"
                        readOnly
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      loadProfile();
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-[#00ff00] text-black py-3 rounded-lg font-semibold hover:bg-[#00dd00] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              )}
            </form>
            ) : (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Você ainda não fez nenhum pedido</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            Pedido #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.payment_status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {order.payment_status === 'paid' ? 'Pago' : 'Pagamento Pendente'}
                          </span>
                          {order.paid_at && (
                            <span className="text-xs text-gray-500">
                              Pago em {new Date(order.paid_at).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.name} x{item.quantity}
                            </span>
                            <span className="font-semibold text-black">
                              R$ {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">
                            Pagamento: <span className="font-semibold">{order.payment_method === 'pix' ? 'PIX' : 'Dinheiro'}</span>
                          </span>
                          <span className="text-lg font-bold text-[#00ff00]">
                            Total: R$ {order.total_amount.toFixed(2)}
                          </span>
                        </div>
                        {order.payment_status === 'paid' && (
                          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-700 font-semibold">
                              Pagamento confirmado!
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              Seu pedido foi enviado para o WhatsApp e está sendo processado.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
