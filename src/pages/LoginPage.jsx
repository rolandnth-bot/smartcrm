import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useToastStore from '../stores/toastStore';
import { validateForm, validateEmail } from '../utils/validation';
import Button from '../components/common/Button';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, mockLogin, error, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    document.title = 'Bejelentkezés - SmartCRM';
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validáció
    const validation = validateForm({ email, password }, {
      email: ['required', 'email'],
      password: ['required', { type: 'length', min: 6, max: 100 }]
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      useToastStore.getState().error(firstError);
      return;
    }

    // Email validáció (ha van megadva)
    if (email && !validateEmail(email)) {
      useToastStore.getState().error('Érvényes email cím szükséges');
      return;
    }

    // Próbáljuk meg a Firebase auth-ot, ha nem sikerül, mock login
    const result = await login(email, password);
    if (!result.success) {
      // Ha Firebase nincs konfigurálva, mock login-t használunk
      const mockResult = await mockLogin(email, password);
      if (mockResult.success) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [email, password, login, mockLogin, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">SmartCRM</h1>
          <p className="text-gray-600 dark:text-gray-400">Vállalatirányítási Rendszer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="email@example.com"
              required
              aria-required="true"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'login-error' : undefined}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Jelszó
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
              aria-required="true"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'login-error' : undefined}
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            variant="primary"
            className="w-full"
          >
            Bejelentkezés
          </Button>
        </form>

        {error && (
          <div id="login-error" className="mt-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200 text-sm" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={async () => {
              setEmail('teszt@smartcrm.hu');
              setPassword('teszt123');
              // Automatikus bejelentkezés
              const result = await mockLogin('teszt@smartcrm.hu', 'teszt123');
              if (result.success) {
                navigate('/');
              }
            }}
            disabled={isLoading}
            loading={isLoading}
            variant="success"
            className="w-full"
          >
            <span aria-hidden="true">🚀</span> Teszt bejelentkezés
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            Email: teszt@smartcrm.hu | Jelszó: teszt123
          </p>
        </div>
        
        <div className="mt-4 text-center">
          <Link
            to="/register"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Még nincs fiókod? Regisztrálj itt
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

