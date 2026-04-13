import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white shadow-lg z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="w-6 h-6 text-[#00ff00] flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Política de Cookies e Privacidade</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Este site utiliza cookies essenciais para garantir o funcionamento adequado da plataforma,
                incluindo autenticação de usuários e gerenciamento do carrinho de compras. Em conformidade
                com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), seus dados pessoais são
                tratados com segurança e utilizados apenas para processar seus pedidos e melhorar sua
                experiência de compra. Não compartilhamos suas informações com terceiros sem seu consentimento.
                Ao continuar navegando, você concorda com nossa política de cookies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleReject}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition text-sm"
            >
              Recusar
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-[#00ff00] hover:bg-[#00dd00] text-black rounded-lg font-semibold transition text-sm"
            >
              Aceitar e Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
