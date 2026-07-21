import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchCep } from '../utils/cep';

type PageType = 'home' | 'login' | 'register' | 'account' | 'admin-login' | 'admin-dashboard';

type RegisterForm = {
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
  password: string;
  confirmPassword: string;
};

const emptyForm: RegisterForm = {
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
  password: '',
  confirmPassword: '',
};

export default function RegisterPage({ onNavigate }: { onNavigate: (page: PageType) => void }) {
  const { signUp } = useAuth();
  const [form, setForm] = useState<RegisterForm>(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [addressEditable, setAddressEditable] = useState(false);

  const maskCpf = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 11);
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const maskPhone = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length === 0) return '';
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const maskCep = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 8);
    return d.replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleCepChange = async (rawValue: string) => {
    const cleanCep = rawValue.replace(/\D/g, '').slice(0, 8);
    setForm((prev) => ({ ...prev, cep: cleanCep }));

    if (cleanCep.length === 8) {
      setLoadingCep(true);
      setError('');
      const result = await fetchCep(cleanCep);
      if (result) {
        setForm((prev) => ({
          ...prev,
          street: result.street || prev.street,
          neighborhood: result.neighborhood || prev.neighborhood,
          city: result.city || prev.city,
          state: result.state || prev.state,
        }));
        setAddressEditable(true);
      } else {
        setAddressEditable(true);
        setError('CEP nao encontrado. Preencha o endereco manualmente.');
      }
      setLoadingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) { setError('Nome Completo e obrigatorio'); return; }
    if (!form.email.trim()) { setError('Email e obrigatorio'); return; }
    if (form.cpf.replace(/\D/g, '').length !== 11) { setError('CPF invalido. Digite os 11 digitos.'); return; }
    if (form.phone.replace(/\D/g, '').length < 10) { setError('Telefone invalido. Digite o DDD e o numero.'); return; }
    if (form.password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres'); return; }
    if (form.password !== form.confirmPassword) { setError('As senhas nao coincidem'); return; }
    if (form.cep.replace(/\D/g, '').length !== 8) { setError('CEP invalido'); return; }
    if (!form.street.trim()) { setError('Rua e obrigatoria'); return; }
    if (!form.number.trim()) { setError('Numero e obrigatorio'); return; }
    if (!form.neighborhood.trim()) { setError('Bairro e obrigatorio'); return; }
    if (!form.city.trim()) { setError('Cidade e obrigatoria'); return; }
    if (!form.state.trim()) { setError('Estado e obrigatorio'); return; }

    setLoading(true);

    const { error: signUpError } = await signUp(form.email, form.password, {
      name: form.name.trim(),
      cpf: form.cpf.replace(/\D/g, ''),
      phone: form.phone.replace(/\D/g, ''),
      cep: form.cep.replace(/\D/g, ''),
      street: form.street.trim(),
      number: form.number.trim(),
      complement: form.complement.trim(),
      neighborhood: form.neighborhood.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
    });

    if (signUpError) {
      const msg = signUpError.message?.toLowerCase() || '';
      if (msg.includes('already registered') || msg.includes('user already exists') || msg.includes('email already')) {
        setError('Este e-mail ja esta cadastrado. Use outro e-mail ou faca login.');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    }

    setLoading(false);
  };

  const inputClass =
    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent transition-colors';

  const disabledInputClass =
    'w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 text-white hover:text-[#00ff00] mb-8 transition"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>

          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <img src="/starphone.png" alt="Starphone" className="h-16 w-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-black mb-2">Criar Conta</h2>
              <p className="text-gray-600">Preencha todos os campos para se cadastrar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  <p>{error}</p>
                  {error.includes('ja esta cadastrado') && (
                    <div className="mt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => onNavigate('login')}
                        className="text-red-800 font-semibold underline hover:no-underline"
                      >
                        Fazer login
                      </button>
                      <span className="text-red-400">|</span>
                      <button
                        type="button"
                        onClick={() => onNavigate('forgot-password' as any)}
                        className="text-red-800 font-semibold underline hover:no-underline"
                      >
                        Esqueci minha senha
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* DADOS PESSOAIS */}
              <div>
                <h3 className="text-lg font-bold text-black mb-4 border-b pb-2">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputClass}
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={inputClass}
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPF <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={maskCpf(form.cpf)}
                      onChange={(e) => setForm({ ...form, cpf: e.target.value.replace(/\D/g, '') })}
                      className={inputClass}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={maskPhone(form.phone)}
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                      className={inputClass}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className={inputClass + ' pr-12'}
                        placeholder="Minimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Senha <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        className={inputClass + ' pr-12'}
                        placeholder="Repita a senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ENDERECO */}
              <div>
                <h3 className="text-lg font-bold text-black mb-4 border-b pb-2">Endereco</h3>
                <div className="space-y-4">
                  <div className="max-w-xs">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={maskCep(form.cep)}
                      onChange={(e) => handleCepChange(e.target.value)}
                      className={inputClass}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    {loadingCep && <p className="text-sm text-gray-500 mt-1">Buscando endereco...</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rua <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.street}
                      onChange={(e) => setForm({ ...form, street: e.target.value })}
                      className={addressEditable ? inputClass : disabledInputClass}
                      placeholder="Nome da rua"
                      disabled={!addressEditable}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numero <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.number}
                        onChange={(e) => setForm({ ...form, number: e.target.value })}
                        className={addressEditable ? inputClass : disabledInputClass}
                        placeholder="123"
                        disabled={!addressEditable}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Complemento
                      </label>
                      <input
                        type="text"
                        value={form.complement}
                        onChange={(e) => setForm({ ...form, complement: e.target.value })}
                        className={addressEditable ? inputClass : disabledInputClass}
                        placeholder="Apt, Bloco (opcional)"
                        disabled={!addressEditable}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bairro <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.neighborhood}
                      onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                      className={addressEditable ? inputClass : disabledInputClass}
                      placeholder="Bairro"
                      disabled={!addressEditable}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className={addressEditable ? inputClass : disabledInputClass}
                        placeholder="Cidade"
                        disabled={!addressEditable}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                        className={addressEditable ? inputClass : disabledInputClass}
                        placeholder="UF"
                        maxLength={2}
                        disabled={!addressEditable}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00ff00] text-black py-3 rounded-lg font-semibold hover:bg-[#00dd00] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando conta...' : 'Cadastrar'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Ja tem uma conta?{' '}
                <button
                  onClick={() => onNavigate('login')}
                  className="text-[#00ff00] font-semibold hover:underline"
                >
                  Entre aqui
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
