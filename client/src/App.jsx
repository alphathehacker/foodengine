import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MenuProvider } from './context/MenuContext';
import MenuManagement from './pages/MenuManagement';
import OrdersDashboard from './pages/OrdersDashboard';
import OrderHistory from './pages/OrderHistory';

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: (
      <svg className="w-5 h-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-error-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-warning-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    )
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {icons[type] || icons.success}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-secondary-900">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-secondary-400 hover:text-secondary-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Global toast context
const ToastContext = React.createContext();

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = React.useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = React.useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Professional Navigation Component
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = window.location.pathname;

  const navItems = [
    { path: '/menu', label: 'Menu Management', icon: '🍽️' },
    { path: '/orders', label: 'Orders Dashboard', icon: '📋' },
    { path: '/order-history', label: 'Order History', icon: '📚' }
  ];

  return (
    <header className="bg-white shadow-soft border-b border-secondary-100 sticky top-0 z-30 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-soft">
              <span className="text-white text-lg font-bold">🍽️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Restaurant Admin</h1>
              <p className="text-xs text-secondary-500">Management System</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  location === item.path
                    ? 'bg-primary-50 text-primary-700 shadow-soft'
                    : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-secondary-600 hover:bg-secondary-50 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-100">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    location === item.path
                      ? 'bg-primary-50 text-primary-700 shadow-soft'
                      : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Enhanced Layout Component
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      <Navigation />
      <main className="animate-fade-in">
        {children}
      </main>
      
      {/* Professional Footer */}
      <footer className="bg-white border-t border-secondary-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">🍽️</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary-900">Restaurant Admin Dashboard</p>
                <p className="text-xs text-secondary-500">Eatoes Intern Assessment</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs text-secondary-500">
              <span>© 2024 All rights reserved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Enhanced Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Layout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-error-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-4">
                Something went wrong
              </h1>
              <p className="text-secondary-600 mb-8 max-w-md mx-auto">
                We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the issue persists.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-primary"
                >
                  Refresh Page
                </button>
                <a
                  href="/menu"
                  className="btn btn-secondary"
                >
                  Go to Dashboard
                </a>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-8 text-left max-w-2xl mx-auto">
                  <summary className="cursor-pointer text-sm text-secondary-500 hover:text-secondary-700">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 p-4 bg-secondary-100 rounded-xl text-xs overflow-auto border border-secondary-200">
                    {this.state.error?.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </Layout>
      );
    }

    return this.props.children;
  }
}

// Enhanced 404 Page
const NotFound = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <div className="w-32 h-32 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-6xl">🔍</span>
        </div>
        <h1 className="text-4xl font-bold text-secondary-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-secondary-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/menu"
            className="btn btn-primary"
          >
            Go to Menu Management
          </a>
          <a
            href="/order-history"
            className="btn btn-secondary"
          >
            View Order History
          </a>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <MenuProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/menu" replace />} />
            <Route
              path="/menu"
              element={
                <Layout>
                  <MenuManagement />
                </Layout>
              }
            />
            <Route
              path="/orders"
              element={
                <Layout>
                  <OrdersDashboard />
                </Layout>
              }
            />
            <Route
              path="/order-history"
              element={
                <Layout>
                  <OrderHistory />
                </Layout>
              }
            />
            <Route
              path="*"
              element={
                <Layout>
                  <NotFound />
                </Layout>
              }
            />
          </Routes>
        </MenuProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
export { useToast };
