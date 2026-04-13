import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import CheckoutPage from './pages/CheckoutPage';
import WhatsAppButton from './components/WhatsAppButton';
import CookieConsent from './components/CookieConsent';

type Page = 'home' | 'login' | 'register' | 'account' | 'admin-login' | 'admin-dashboard' | 'checkout';

type CartItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [redirectToCheckout, setRedirectToCheckout] = useState(false);
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading) {
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
