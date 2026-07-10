import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import CheckoutPage from './pages/CheckoutPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import WhatsAppButton from './components/WhatsAppButton';
import CookieConsent from './components/CookieConsent';

type Page = 'home' | 'login' | 'register' | 'account' | 'admin-login' | 'admin-dashboard' | 'checkout' | 'forgot-password' | 'reset-password';

type CartItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
};

function MaintenancePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-lg">
        <div className="text-8xl mb-8">🚧</div>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">SITE EM MANUTENÇÃO!</h1>
        <p className="text-[#00ff00] text-xl font-semibold mb-3">Estamos trabalhando para melhorar sua experiência.</p>
        <p className="text-gray-400 text-lg">Voltaremos em breve!</p>
        <div className="mt-10 flex justify-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#00ff00] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-3 h-3 rounded-full bg-[#00ff00] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-3 h-3 rounded-full bg-[#00ff00] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [redirectToCheckout, setRedirectToCheckout] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentPage('reset-password');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    supabase.from('banner_settings').select('maintenance_mode').limit(1).maybeSingle().then(({ data }) => {
      if (data) setMaintenanceMode(data.maintenance_mode ?? false);
    });

    const channel = supabase
      .channel('maintenance_mode_watch')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'banner_settings' }, (payload) => {
        setMaintenanceMode((payload.new as any).maintenance_mode ?? false);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!loading && currentPage !== 'reset-password') {
      if (currentPage === 'login' && user) {
        if (redirectToCheckout) {
          setCurrentPage('checkout');
          setRedirectToCheckout(false);
        } else {
          setCurrentPage('account');
        }
      } else if (currentPage === 'register' && user) {
        if (redirectToCheckout) {
          setCurrentPage('checkout');
          setRedirectToCheckout(false);
        } else {
          setCurrentPage('account');
        }
      } else if (currentPage === 'account' && !user) {
        setCurrentPage('home');
      } else if (currentPage === 'admin-login' && user && isAdmin) {
        setCurrentPage('admin-dashboard');
      } else if (currentPage === 'admin-dashboard' && (!user || !isAdmin)) {
        setCurrentPage('home');
      } else if (currentPage === 'checkout' && !user) {
        setRedirectToCheckout(true);
        setCurrentPage('login');
      }
    }
  }, [user, loading, currentPage, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (maintenanceMode && !isAdmin) {
    return <MaintenancePage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'register':
        return <RegisterPage onNavigate={setCurrentPage} />;
      case 'account':
        return <AccountPage onNavigate={setCurrentPage} />;
      case 'admin-login':
        return <AdminLoginPage onNavigate={setCurrentPage} />;
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={setCurrentPage} />;
      case 'checkout':
        return <CheckoutPage onNavigate={setCurrentPage} cart={cart} onCheckoutComplete={() => setCart([])} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={setCurrentPage} />;
      case 'reset-password':
        return <ResetPasswordPage onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} cart={cart} setCart={setCart} />;
    }
  };

  return (
    <>
      {renderPage()}
      <WhatsAppButton />
      <CookieConsent />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
