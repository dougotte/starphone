import { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

type PageType = 'home' | 'login' | 'register' | 'account' | 'admin-login' | 'admin-dashboard' | 'forgot-password';

export default function ForgotPasswordPage({ onNavigate }: { onNavigate: (page: PageType) => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '?reset=true',
    });

    if (resetError) {
      setError('Erro ao enviar e-mail. Verifique o endereço e tente novamente.');
    } else {
      setSent(true);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center space-x-2 text-white hover:text-[#00ff00] mb-8 transition"
          >
            <ArrowLeft size={20} />
            <span>Voltar ao login</span>
          </button>

          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#00ff00] rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-black" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-2">Esqueceu a senha?</h2>
              <p className="text-gray-600">Informe seu e-mail para receber o link de redefinição</p>
            </div>

            {sent ? (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle size={56} className="text-[#00cc00]" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">E-mail enviado!</h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Enviamos um link de redefinição para <strong>{email}</strong>.<br />
                  Verifique sua caixa de entrada e siga as instruções.
                </p>
                <p className="text-xs text-gray-400 mb-6">Nao encontrou? Verifique a pasta de spam.</p>
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full bg-[#00ff00] text-black py-3 rounded-lg font-semibold hover:bg-[#00dd00] transition"
                >
                  Voltar ao login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail cadastrado
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ff00] focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00ff00] text-black py-3 rounded-lg font-semibold hover:bg-[#00dd00] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Enviar link de redefinição'}
                </button>

                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    Lembrou a senha?{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('login')}
                      className="text-[#00cc00] font-semibold hover:underline"
                    >
                      Fazer login
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
