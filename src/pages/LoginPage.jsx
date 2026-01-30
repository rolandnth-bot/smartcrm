import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useToastStore from '../stores/toastStore';
import Button from '../components/common/Button';

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginWithPin, error, isLoading } = useAuthStore();
  const [pin, setPin] = useState('');

  useEffect(() => {
    document.title = 'Bejelentkezés - SmartCRM';
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!pin || pin.length === 0) {
      useToastStore.getState().error('PIN kód megadása kötelez');
      return;
    }

    const result = await loginWithPin(pin);
    if (result.success) {
      navigate('/');
    }
  }, [pin, loginWithPin, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">SmartCRM</h1>
          <p className="text-gray-600 dark:text-gray-400">Vállalatirányítási Rendszer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              PIN kód
            </label>
            <input
              id="login-pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
              placeholder=""
              maxLength="4"
              required
              aria-required="true"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'login-error' : undefined}
              autoComplete="off"
              autoFocus
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
              4 számjegy PIN kód
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading || pin.length !== 4}
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

      </div>
    </div>
  );
};

export default LoginPage;

