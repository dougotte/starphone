import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type PageType = 'home' | 'login' | 'register' | 'account' | 'admin-login' | 'admin-dashboard';

export default function AdminLoginPage({ onNavigate }: { onNavigate: (page: PageType) => void }) {
  const { signInAdmin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await signInAdmin(username, password);

      if (signInError) {
        console.error('Login error:', signInError);
        setError('Usuário ou senha incorretos');
        setLoading(false);
      } else {
        console.log('Login successful, navigating to dashboard');
        setTimeout(() => {
          onNavigate('admin-dashboard');
        }, 100);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Erro ao fazer login. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
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
              <h2 className="text-3xl font-bold text-black mb-2">Acesso Admin</h2>
              <p className="text-gray-600">Painel administrativo</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Usuário
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent"
                  placeholder="Nome de usuário"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent pr-12"
                    placeholder="••••••••"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00ff00] text-black py-3 rounded-lg font-semibold hover:bg-[#00dd00] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Entrando...' : 'Entrar como Admin'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => onNavigate('login')}
                className="text-gray-500 text-sm hover:text-gray-700"
              >
                Voltar ao login de usuário
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
