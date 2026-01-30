import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../contexts/PermissionContext';
import Card from '../common/Card';
import Button from '../common/Button';

const ProtectedRoute = ({ permission, children, fallback }) => {
  const { hasPermission, isLoading } = usePermissions();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center" aria-live="polite" aria-busy="true">
        <div className="text-gray-600 dark:text-gray-400">Betöltés...</div>
      </div>
    );
  }

  if (!hasPermission(permission)) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <div className="text-6xl mb-4" aria-hidden="true"></div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Hozzáférés megtagadva</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Nincs jogosultsága az oldal megtekintéséhez.
              <br />
              Szükséges jogosultság: <code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded text-sm">{permission}</code>
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Vissza a foldalra
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

