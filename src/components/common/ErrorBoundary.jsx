import { Component } from 'react';
import Button from './Button';
import { createLogger } from '../../utils/logger';

const logger = createLogger('ErrorBoundary');

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Strukturált error logging
    logger.error('ErrorBoundary caught an error', error, {
      componentStack: errorInfo?.componentStack,
      errorName: error?.name,
      errorMessage: error?.message,
      errorStack: error?.stack
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-2xl w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                Hiba történt
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sajnáljuk, valami hiba történt az alkalmazás betöltésekor.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                <h2 className="font-bold text-red-800 dark:text-red-200 mb-2">Hibadetalok (csak development módban):</h2>
                <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto max-h-48">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} variant="primary">
                Oldal újratöltése
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="secondary"
              >
                Főoldal
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

