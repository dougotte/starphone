import { useState } from 'react';
import { Eye, EyeOff, KeyRound, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

type PageType = 'home' | 'login' | 'register' | 'account' | 'admin-login' | 'admin-dashboard' | 'forgot-password' | 'reset-password';

export default function ResetPasswordPage({ onNavigate }: { onNavigate: (page: PageType) => void }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError('Erro ao redefinir senha. O link pode ter expirado. Solicite um novo link.');
    } else {
      setDone(true);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#00ff00] rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound size={32} className="text-black" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-2">Nova senha</h2>
              <p className="text-gray-600">Escolha uma nova senha para sua conta</p>
            </div>

            {done ? (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle size={56} className="text-[#00cc00]" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Senha alterada!</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Sua senha foi redefinida com sucesso. Agora voce pode fazer login com a nova senha.
                </p>
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full bg-[#00ff00] text-black py-3 rounded-lg font-semibold hover:bg-[#00dd00] transition"
                >
                  Ir para o login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                    {error}
                    {error.includes('expirado') && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => onNavigate('forgot-password')}
                          className="text-red-800 font-semibold underline hover:no-underline"
                        >
                          Solicitar novo link
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nova senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent pr-12"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent pr-12"
                      placeholder="Repita a nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00ff00] text-black py-3 rounded-lg font-semibold hover:bg-[#00dd00] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Salvando...' : 'Redefinir senha'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
