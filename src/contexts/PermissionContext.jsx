import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useAuthStore from '../stores/authStore';
import api, { getMyPermissions } from '../services/api';

const PermissionContext = createContext(null);

export const PermissionProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [permissions, setPermissions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadMyPermissions = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setPermissions([]);
      setIsLoading(false);
      return;
    }

    // Ha van API, próbáljuk betölteni a permissions-t
    if (api.isConfigured()) {
      try {
        setIsLoading(true);
        const response = await getMyPermissions();
        const perms = response?.permissions || response?.data || [];
        setPermissions(Array.isArray(perms) ? perms : []);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error loading permissions:', error);
        }
        // Fallback: ha van role a user-ben, használjuk azt
        // Development módban mindig admin
        if (import.meta.env.DEV) {
          setPermissions(['*']); // Admin = minden jogosultság
        } else if (user.role) {
          setPermissions(getDefaultPermissionsForRole(user.role));
        } else {
          setPermissions(['*']); // Default: admin
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Lokális fallback: role alapján permissions
    // Development módban vagy ha nincs role, admin jogosultságot adunk
    if (import.meta.env.DEV || !user.role) {
      setPermissions(['*']); // Admin = minden jogosultság
    } else if (user.role) {
      setPermissions(getDefaultPermissionsForRole(user.role));
    } else {
      // Default: admin permissions (development módban)
      setPermissions(['*']);
    }
    setIsLoading(false);
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadMyPermissions();
  }, [loadMyPermissions]);

  const hasPermission = useCallback((key) => {
    if (!permissions || permissions.length === 0) return false;
    // Admin wildcard
    if (permissions.includes('*')) return true;
    return permissions.includes(key);
  }, [permissions]);

  const canView = useCallback((module) => {
    // Development módban minden látható
    if (import.meta.env.DEV) {
      return true;
    }
    return hasPermission(`${module}.view`) || hasPermission(`${module}.edit`);
  }, [hasPermission]);

  const canEdit = useCallback((module) => {
    // Development módban minden szerkeszthet
    if (import.meta.env.DEV) {
      return true;
    }
    return hasPermission(`${module}.edit`);
  }, [hasPermission]);

  return (
    <PermissionContext.Provider value={{
      permissions,
      hasPermission,
      canView,
      canEdit,
      isLoading,
      reloadPermissions: loadMyPermissions
    }}>
      {children}
    </PermissionContext.Provider>
  );
};

// Default permissions role-okhoz (lokális fallback)
function getDefaultPermissionsForRole(role) {
  const rolePermissions = {
    admin: ['*'], // Wildcard = minden
    manager: [
      'calendar.view', 'calendar.edit',
      'finance.view', 'finance.edit',
      'accounting.view', 'accounting.edit',
      'warehouse.view', 'warehouse.edit',
      'maintenance.view', 'maintenance.edit',
      'cleaning.view', 'cleaning.edit',
      'apartments.view', 'apartments.edit',
      'leads.view', 'leads.edit',
      'marketing.view', 'marketing.edit',
      'sales.view', 'sales.edit',
      'bookings.view', 'bookings.edit',
      'settings.view', 'settings.edit'
    ],
    housekeeping: [
      'calendar.view',
      'cleaning.view', 'cleaning.edit'
    ],
    accountant: [
      'finance.view',
      'accounting.view', 'accounting.edit',
      'maintenance.view',
      'cleaning.view',
      'calendar.view',
      'apartments.view',
      'bookings.view'
    ],
    readonly: [
      'calendar.view',
      'finance.view',
      'accounting.view',
      'warehouse.view',
      'maintenance.view',
      'cleaning.view',
      'apartments.view',
      'leads.view',
      'marketing.view',
      'sales.view',
      'bookings.view',
      'settings.view'
    ]
  };

  return rolePermissions[role] || rolePermissions.readonly;
}

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  return context;
};

