import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePermissions } from '../contexts/PermissionContext';
import { usersList, usersCreate, usersUpdate, rolesList, settingsGet, settingsUpdate } from '../services/api';
import api, { usersList as fetchUsersList } from '../services/api';
import useToastStore from '../stores/toastStore';
import useApartmentsStore from '../stores/apartmentsStore';
import useEmailAccountsStore from '../stores/emailAccountsStore';
import EmailAccountEditModal from '../components/email/EmailAccountEditModal';
import { copyToClipboard } from '../utils/clipboard';
import { validateForm, validateRequired, validateLength } from '../utils/validation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Tooltip from '../components/common/Tooltip';
import FormField from '../components/common/FormField';
import { Edit2, X, Copy, Plus, Trash2, RefreshCw } from '../components/common/Icons';
import { SkeletonListItem } from '../components/common/Skeleton';

// Default role-ok (lokális fallback)
const DEFAULT_ROLES = [
  { id: 'admin', name: 'Admin', description: 'Teljes hozzáférés minden modulhoz' },
  { id: 'manager', name: 'Manager', description: 'Naptár, pénzügy, takarítás, lakások kezelése' },
  { id: 'housekeeping', name: 'Takarító', description: 'Takarítás modul kezelése' },
  { id: 'accountant', name: 'Könyvelő', description: 'Pénzügyi adatok megtekintése' },
  { id: 'readonly', name: 'Csak olvasás', description: 'Minden modul megtekintése, szerkesztés nélkül' }
];

// Permission keys (modulok szerint csoportosítva)
const PERMISSION_MODULES = [
  {
    module: 'leads',
    label: 'Leadek',
    permissions: [
      { key: 'leads.view', label: 'Megtekintés' },
      { key: 'leads.edit', label: 'Szerkesztés' }
    ]
  },
  {
    module: 'marketing',
    label: 'Marketing',
    permissions: [
      { key: 'marketing.view', label: 'Megtekintés' },
      { key: 'marketing.edit', label: 'Szerkesztés' }
    ]
  },
  {
    module: 'sales',
    label: 'Értékesítés',
    permissions: [
      { key: 'sales.view', label: 'Megtekintés' },
      { key: 'sales.edit', label: 'Szerkesztés' }
    ]
  },
  {
    module: 'apartments',
    label: 'Lakások',
    permissions: [
      { key: 'apartments.view', label: 'Megtekintés' },
      { key: 'apartments.edit', label: 'Szerkesztés' }
    ]
  },
  {
    module: 'bookings',
    label: 'Foglalások',
    permissions: [
      { key: 'bookings.view', label: 'Megtekintés' },
      { key: 'bookings.edit', label: 'Szerkesztés' }
    ]
  },
  {
    module: 'cleaning',
    label: 'Takarítás',
    permissions: [
      { key: 'cleaning.view', label: 'Megtekintés' },
      { key: 'cleaning.edit', label: 'Szerkesztés' }
    ]
  },
  {
    module: 'settings',
    label: 'Beállítások',
    permissions: [
      { key: 'settings.view', label: 'Megtekintés' },
      { key: 'settings.edit', label: 'Szerkesztés' }
    ]
  }
];

const SettingsPage = () => {
  const { canEdit: canEditSettings } = usePermissions();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomPermissions, setShowCustomPermissions] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Application settings state
  const [appSettings, setAppSettings] = useState({
    eurRate: 400,
    defaultHourlyRate: 2500,
    defaultTextileRate: 600,
    laundryPricePerKg: 800,
    defaultManagementFee: 25,
    defaultCleaningFee: 15000,
    companyName: 'SmartCRM',
    companyEmail: 'info@smartcrm.hu',
    companyPhone: '+36 1 234 5678'
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Email beállítások state
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: true, // TLS/SSL
    fromEmail: '',
    fromName: 'SmartCRM',
    replyTo: ''
  });
  const [isLoadingEmailSettings, setIsLoadingEmailSettings] = useState(false);
  const [isSavingEmailSettings, setIsSavingEmailSettings] = useState(false);

  // Email fiókok (közös store – Email oldal, Beállítások)
  const { success, error: showError } = useToastStore();
  const { accounts: emailAccounts, loadFromStorage: loadEmailAccounts, updateAccount, addAccount, removeAccount } = useEmailAccountsStore();
  const [editingEmailAccount, setEditingEmailAccount] = useState(null);
  const [showEmailAccountModal, setShowEmailAccountModal] = useState(false);


  // Számla fiókok state
  const [invoiceAccounts, setInvoiceAccounts] = useState([]);
  const [editingInvoiceAccount, setEditingInvoiceAccount] = useState(null);
  const [showInvoiceAccountModal, setShowInvoiceAccountModal] = useState(false);
  const [isLoadingInvoiceAccounts, setIsLoadingInvoiceAccounts] = useState(false);
  const [isSavingInvoiceAccount, setIsSavingInvoiceAccount] = useState(false);
  const [navValidation, setNavValidation] = useState({
    isValid: false,
    companyName: '',
    isValidating: false
  });

  // Cégem (Adminisztráció) state
  const [companyData, setCompanyData] = useState({
    companyName: 'HNR Smart Invest kft',
    taxNumber: '32698660-2-41',
    euTaxNumber: '',
    postalCode: '1138',
    city: 'Budapest',
    streetName: 'Úszódaru',
    streetType: 'utca',
    houseNumber: '1',
    country: 'Magyarország',
    defaultCurrency: 'Ft',
    defaultPartnerType: 'Belföldi cég'
  });
  const [logoFile, setLogoFile] = useState(null);
  const [aszfFile, setAszfFile] = useState(null);
  const [dataProtectionFile, setDataProtectionFile] = useState(null);
  const [isSavingCompanyData, setIsSavingCompanyData] = useState(false);

  const { apartments } = useApartmentsStore();
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    document.title = 'Beállítások - SmartCRM';
    fetchUsers();
    fetchRoles();
    fetchSettings();
    fetchEmailSettings();
    fetchInvoiceAccounts();
    fetchPartners();
    loadEmailAccounts();
  }, []);

  const fetchPartners = useCallback(async () => {
    if (api.isConfigured()) {
      try {
        const data = await fetchUsersList({ role: 'partner', status: 'active' });
        const partnersList = Array.isArray(data) ? data : (data?.users || []);
        setPartners(partnersList.filter(user => user.role === 'partner' && user.status === 'active'));
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Hiba a partnerek betöltésekor:', error);
        }
      }
    }
  }, []);

  const fetchEmailSettings = useCallback(async () => {
    if (!api.isConfigured()) return;
    
    setIsLoadingEmailSettings(true);
    try {
      const response = await settingsGet();
      const settings = response?.settings || response || {};
      setEmailSettings((prev) => ({
        smtpHost: settings.smtp_host || settings.smtpHost || prev.smtpHost,
        smtpPort: parseInt(settings.smtp_port || settings.smtpPort || prev.smtpPort) || 587,
        smtpUser: settings.smtp_user || settings.smtpUser || prev.smtpUser,
        smtpPassword: settings.smtp_password || settings.smtpPassword || prev.smtpPassword,
        smtpSecure: settings.smtp_secure !== undefined ? settings.smtp_secure : (settings.smtpSecure !== undefined ? settings.smtpSecure : prev.smtpSecure),
        fromEmail: settings.from_email || settings.fromEmail || prev.fromEmail,
        fromName: settings.from_name || settings.fromName || prev.fromName,
        replyTo: settings.reply_to || settings.replyTo || prev.replyTo
      }));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching email settings:', error);
      }
    } finally {
      setIsLoadingEmailSettings(false);
    }
  }, []);

  const handleEditEmailAccount = (acc) => {
    setEditingEmailAccount(acc);
    setShowEmailAccountModal(true);
  };

  const handleAddEmailAccount = () => {
    setEditingEmailAccount(null);
    setShowEmailAccountModal(true);
  };

  const handleSaveEmailAccount = (data) => {
    if (editingEmailAccount) {
      updateAccount(editingEmailAccount.id, data);
      success('Email fiók sikeresen frissítve!');
    } else {
      addAccount(data);
      success('Új email fiók hozzáadva.');
    }
  };

  const handleDeleteEmailAccount = (id) => {
    removeAccount(id);
    success('Email fiók törölve!');
  };

  const fetchInvoiceAccounts = useCallback(async () => {
    if (!api.isConfigured()) {
      // Mock data for development
      setInvoiceAccounts([
        {
          id: 1,
          name: 'Alapértelmezett számlázási fiók',
          taxNumber: '',
          companyName: '',
          address: '',
          email: '',
          navLogin: '',
          navPassword: '',
          navXmlSignKey: '',
          navXmlExchangeKey: '',
          assignedTo: 'partner', // partner, apartment
          partnerId: null,
          apartmentId: null,
          isDefault: false
        }
      ]);
      setIsLoadingInvoiceAccounts(false);
      return;
    }
    
    setIsLoadingInvoiceAccounts(true);
    try {
      // TODO: API endpoint létrehozása számla fiókokhoz
      // const response = await invoiceAccountsList();
      // setInvoiceAccounts(response?.accounts || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching invoice accounts:', error);
      }
    } finally {
      setIsLoadingInvoiceAccounts(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!api.isConfigured()) {
      // Mock users for development
      setUsers([
        { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', roleId: 'admin' },
        { id: 2, name: 'Manager User', email: 'manager@example.com', role: 'manager', roleId: 'manager' },
        { id: 3, name: 'Worker User', email: 'worker@example.com', role: 'housekeeping', roleId: 'housekeeping' }
      ]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await usersList();
      const usersList = Array.isArray(response) ? response : (response?.users || []);
      setUsers(usersList);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching users:', error);
      }
      useToastStore.getState().error('Hiba a felhasználók betöltésekor.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    if (api.isConfigured()) {
      try {
        const response = await rolesList();
        if (response?.data && Array.isArray(response.data)) {
          setRoles(response.data);
          return;
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.debug('[SettingsPage] Roles API not available, using default roles');
        }
      }
    }
    // Fallback: használjuk a DEFAULT_ROLES-t
    setRoles(DEFAULT_ROLES);
  }, []);

  const fetchSettings = useCallback(async () => {
    if (!api.isConfigured()) return;
    
    setIsLoadingSettings(true);
    try {
      const response = await settingsGet();
      const settings = response?.settings || response || {};
      setAppSettings((prev) => ({
        eurRate: parseInt(settings.eur_rate || settings.eurRate || prev.eurRate) || 400,
        defaultHourlyRate: parseInt(settings.default_hourly_rate || settings.defaultHourlyRate || prev.defaultHourlyRate) || 2500,
        defaultTextileRate: parseInt(settings.default_textile_rate || settings.defaultTextileRate || prev.defaultTextileRate) || 600,
        laundryPricePerKg: parseInt(settings.laundry_price_per_kg || settings.laundryPricePerKg || prev.laundryPricePerKg) || 800,
        defaultManagementFee: parseInt(settings.default_management_fee || settings.defaultManagementFee || prev.defaultManagementFee) || 25,
        defaultCleaningFee: parseInt(settings.default_cleaning_fee || settings.defaultCleaningFee || prev.defaultCleaningFee) || 15000,
        companyName: settings.company_name || settings.companyName || prev.companyName,
        companyEmail: settings.company_email || settings.companyEmail || prev.companyEmail,
        companyPhone: settings.company_phone || settings.companyPhone || prev.companyPhone
      }));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching settings:', error);
      }
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  const handleSaveSettings = useCallback(async () => {
    if (isSavingSettings) return;
    
    setIsSavingSettings(true);
    try {
      if (api.isConfigured()) {
        await settingsUpdate({
          eur_rate: appSettings.eurRate,
          default_hourly_rate: appSettings.defaultHourlyRate,
          default_textile_rate: appSettings.defaultTextileRate,
          laundry_price_per_kg: appSettings.laundryPricePerKg,
          default_management_fee: appSettings.defaultManagementFee,
          default_cleaning_fee: appSettings.defaultCleaningFee,
          company_name: appSettings.companyName,
          company_email: appSettings.companyEmail,
          company_phone: appSettings.companyPhone
        });
        useToastStore.getState().success('Beállítások sikeresen mentve');
      } else {
        useToastStore.getState().success('Beállítások mentve (mock mode)');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving settings:', error);
      }
      useToastStore.getState().error(error?.message || 'Hiba a beállítások mentésekor.');
    } finally {
      setIsSavingSettings(false);
    }
  }, [appSettings, canEditSettings, isSavingSettings]);

  const handleSettingsChange = useCallback((field, value) => {
    setAppSettings((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCopyToClipboard = useCallback(async (text, label) => {
    if (text) {
      await copyToClipboard(text, { successMessage: `${label} másolva a vágólapra` });
    }
  }, []);

  const handleEditUser = useCallback((user) => {
    setEditingUser({
      ...user,
      customPermissions: user.customPermissions || { granted: [], revoked: [] },
      salary: user.salary || user.monthlySalary || null,
      hourlyRate: user.hourlyRate || user.hourly_rate || null,
      salaryType: user.salaryType || user.salary_type || (user.hourlyRate || user.hourly_rate ? 'hourly' : 'fixed'),
      notes: user.notes || user.comment || ''
    });
    setShowEditModal(true);
    setShowCustomPermissions(false);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditingUser(null);
    setShowEditModal(false);
  }, []);

  const handleSaveUser = useCallback(async () => {
    if (!editingUser || isSubmitting) return;

    // Validáció
    const validationRules = {
      name: ['required', { type: 'length', min: 2, max: 100 }],
      email: ['required', 'email'],
      roleId: ['required']
    };
    
    // Új felhasználó esetén jelszó is kötelező
    if (!editingUser.id) {
      validationRules.password = ['required', { type: 'length', min: 8 }];
    }
    
    const validation = validateForm(editingUser, validationRules);

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      useToastStore.getState().error(firstError);
      return;
    }

    setIsSubmitting(true);
    try {
      if (api.isConfigured()) {
        if (editingUser.id) {
        // API hívás a user frissítéséhez
        const updateData = {
          name: editingUser.name,
          role_id: editingUser.roleId || editingUser.role,
          bank_account: editingUser.bankAccount || editingUser.bank_account || null,
          salary: editingUser.salary || editingUser.monthlySalary || null,
          hourly_rate: editingUser.hourlyRate || editingUser.hourly_rate || null,
          salary_type: editingUser.salaryType || editingUser.salary_type || 'fixed',
          notes: editingUser.notes || editingUser.comment || null,
          custom_permissions: editingUser.customPermissions || { granted: [], revoked: [] }
        };
        await usersUpdate(editingUser.id, updateData);
          useToastStore.getState().success('Felhasználó sikeresen frissítve');
        } else {
          // Új felhasználó létrehozása
          const createData = {
            name: editingUser.name,
            email: editingUser.email,
            password: editingUser.password || 'TempPassword123!',
            role: editingUser.roleId || editingUser.role || 'partner',
            phone: editingUser.phone || '',
            company_name: editingUser.company_name || editingUser.companyName || '',
            salary: editingUser.salary || editingUser.monthlySalary || null,
            hourly_rate: editingUser.hourlyRate || editingUser.hourly_rate || null,
            salary_type: editingUser.salaryType || editingUser.salary_type || 'fixed',
            notes: editingUser.notes || editingUser.comment || null
          };
          await usersCreate(createData);
          useToastStore.getState().success('Felhasználó sikeresen létrehozva');
        }
        // Frissítjük a listát
        await fetchUsers();
      } else {
        // Lokális frissítés/létrehozás (mock mode)
        if (editingUser.id) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, ...editingUser } : u))
        );
        useToastStore.getState().success('Felhasználó sikeresen frissítve');
        } else {
          const newUser = {
            id: Date.now().toString(),
            ...editingUser,
            createdAt: new Date().toISOString()
          };
          setUsers((prev) => [...prev, newUser]);
          useToastStore.getState().success('Felhasználó sikeresen létrehozva');
        }
      }
      handleCloseEditModal();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving user:', error);
      }
      useToastStore.getState().error(error?.message || (editingUser.id ? 'Hiba a felhasználó frissítésekor.' : 'Hiba a felhasználó létrehozásakor.'));
    } finally {
      setIsSubmitting(false);
    }
  }, [editingUser, canEditSettings, isSubmitting, handleCloseEditModal, fetchUsers]);

  const handleRoleChange = useCallback((roleId) => {
    if (!editingUser) return;
    setEditingUser({ ...editingUser, roleId, role: roleId });
    // Real-time validáció
    if (fieldErrors.roleId) {
      setFieldErrors((prev) => ({ ...prev, roleId: null }));
    }
  }, [editingUser, fieldErrors]);

  const handleNameChange = useCallback((name) => {
    if (!editingUser) return;
    setEditingUser({ ...editingUser, name });
    // Real-time validáció
    const validation = validateForm({ name }, {
      name: ['required', { type: 'length', min: 2, max: 100 }]
    });
    if (validation.isValid) {
      setFieldErrors((prev) => ({ ...prev, name: null }));
    } else {
      setFieldErrors((prev) => ({ ...prev, name: validation.errors.name }));
    }
  }, [editingUser]);

  const handleToggleCustomPermission = useCallback((permissionKey, type) => {
    if (!editingUser) return;
    const customPerms = editingUser.customPermissions || { granted: [], revoked: [] };
    const currentList = customPerms[type] || [];
    const isInList = currentList.includes(permissionKey);

    const newList = isInList
      ? currentList.filter((p) => p !== permissionKey)
      : [...currentList, permissionKey];

    // Ha granted-ből töröljük, akkor revoked-ból is töröljük (ha benne van)
    // és fordítva
    const otherType = type === 'granted' ? 'revoked' : 'granted';
    const otherList = (customPerms[otherType] || []).filter((p) => p !== permissionKey);

    setEditingUser({
      ...editingUser,
      customPermissions: {
        ...customPerms,
        [type]: newList,
        [otherType]: otherList
      }
    });
  }, [editingUser]);

  const skeletonListItems = useMemo(() => Array.from({ length: 5 }, (_, i) => i), []);

  // Effective permissions számítása
  const calculateEffectivePermissions = useCallback((user) => {
    const roleId = user.roleId || user.role || 'readonly';
    
    // Role permissions lekérése
    const getRolePermissions = (roleId) => {
      const rolePerms = {
        admin: ['*'],
        manager: [
          'calendar.view', 'calendar.edit',
          'finance.view', 'finance.edit',
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
          'cleaning.view',
          'calendar.view',
          'apartments.view',
          'bookings.view'
        ],
        readonly: [
          'calendar.view',
          'finance.view',
          'cleaning.view',
          'apartments.view',
          'leads.view',
          'marketing.view',
          'sales.view',
          'bookings.view',
          'settings.view'
        ]
      };
      return rolePerms[roleId] || rolePerms.readonly;
    };

    const rolePermissions = getRolePermissions(roleId);
    
    // Ha admin (wildcard), akkor minden permission
    if (rolePermissions.includes('*')) {
      return ['*'];
    }

    const customPerms = user.customPermissions || { granted: [], revoked: [] };
    const granted = customPerms.granted || [];
    const revoked = customPerms.revoked || [];

    // Effective = rolePermissions + granted - revoked
    const effective = [...rolePermissions, ...granted].filter(
      (perm) => !revoked.includes(perm)
    );

    return [...new Set(effective)]; // Duplikátumok eltávolítása
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-gray-200">Beállítások</h2>
      </div>

      {/* Alkalmazás beállítások */}
        <Card>
          <div className="mb-4">
            <h3 className="text-xl font-bold dark:text-gray-200 mb-2">Alkalmazás beállítások</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Általános beállítások, árfolyamok és alapértelmezett értékek
            </p>
          </div>

          {isLoadingSettings ? (
            <div className="space-y-4" aria-live="polite" aria-busy="true">
              {Array.from({ length: 3 }, (_, i) => (
                <SkeletonListItem key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    EUR árfolyam (Ft)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={appSettings.eurRate}
                      onChange={(e) => handleSettingsChange('eurRate', parseInt(e.target.value) || 400)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                    <Button
                      onClick={async () => {
                        // MNB árfolyam frissítés (szimuláció - valós implementációhoz MNB API kell)
                        const today = new Date().toISOString().split('T')[0];
                        const simulatedRate = Math.round(390 + Math.random() * 20);
                        handleSettingsChange('eurRate', simulatedRate);
                        useToastStore.getState().info(`MNB árfolyam frissítve: ${simulatedRate} Ft/EUR (${today})`);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      MNB Frissítés
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alapértelmezett óradíj (Ft)
                  </label>
                  <input
                    type="number"
                    value={appSettings.defaultHourlyRate}
                    onChange={(e) => handleSettingsChange('defaultHourlyRate', parseInt(e.target.value) || 2500)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alapértelmezett textil díj (Ft)
                  </label>
                  <input
                    type="number"
                    value={appSettings.defaultTextileRate}
                    onChange={(e) => handleSettingsChange('defaultTextileRate', parseInt(e.target.value) || 600)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mosoda ár/kg (Ft)
                  </label>
                  <input
                    type="number"
                    value={appSettings.laundryPricePerKg}
                    onChange={(e) => handleSettingsChange('laundryPricePerKg', parseInt(e.target.value) || 800)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alapértelmezett management fee (%)
                  </label>
                  <input
                    type="number"
                    value={appSettings.defaultManagementFee}
                    onChange={(e) => handleSettingsChange('defaultManagementFee', parseInt(e.target.value) || 25)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alapértelmezett takarítási díj (Ft)
                  </label>
                  <input
                    type="number"
                    value={appSettings.defaultCleaningFee}
                    onChange={(e) => handleSettingsChange('defaultCleaningFee', parseInt(e.target.value) || 15000)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cégnév
                  </label>
                  <input
                    type="text"
                    value={appSettings.companyName}
                    onChange={(e) => handleSettingsChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cég email
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={appSettings.companyEmail}
                      onChange={(e) => handleSettingsChange('companyEmail', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {appSettings.companyEmail && (
                      <Button
                        onClick={() => handleCopyToClipboard(appSettings.companyEmail, 'Email cím')}
                        variant="outline"
                        size="sm"
                        aria-label="Email cím másolása"
                        title="Email cím másolása"
                      >
                        <Copy size={16} />
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cég telefon
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={appSettings.companyPhone}
                      onChange={(e) => handleSettingsChange('companyPhone', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {appSettings.companyPhone && (
                      <Button
                        onClick={() => handleCopyToClipboard(appSettings.companyPhone, 'Telefonszám')}
                        variant="outline"
                        size="sm"
                        aria-label="Telefonszám másolása"
                        title="Telefonszám másolása"
                      >
                        <Copy size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveSettings}
                  variant="primary"
                  loading={isSavingSettings}
                  disabled={isSavingSettings}
                >
                  Beállítások mentése
                </Button>
              </div>
            </div>
          )}
        </Card>

      {/* Felhasználók kezelése */}
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <div>
          <h3 className="text-xl font-bold dark:text-gray-200 mb-2">Felhasználók kezelése</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Felhasználók listája és jogosultságok kezelése
          </p>
          </div>
            <Button
              variant="primary"
              onClick={() => {
                setEditingUser({
                  id: null,
                  name: '',
                  email: '',
                  password: '',
                  role: 'partner',
                  phone: '',
                  company_name: '',
                  status: 'active',
                  salary: null,
                  hourlyRate: null,
                  salaryType: 'fixed',
                  notes: ''
                });
                setShowEditModal(true);
              }}
              aria-label="Új felhasználó hozzáadása"
            >
              <Plus /> Új felhasználó
            </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2" aria-live="polite" aria-busy="true">
            {skeletonListItems.map((i) => (
              <SkeletonListItem key={i} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400" role="status" aria-live="polite">
            Nincsenek felhasználók.
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 dark:text-gray-200">{user.name || user.email}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Szerepkör: {roles.find((r) => r.id === (user.roleId || user.role))?.name || user.role || 'Nincs'}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {user.email && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">📧 {user.email}</span>
                        <button
                          onClick={() => handleCopyToClipboard(user.email, 'Email cím')}
                          className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          aria-label="Email cím másolása"
                          title="Email cím másolása"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">📞 {user.phone}</span>
                        <button
                          onClick={() => handleCopyToClipboard(user.phone, 'Telefonszám')}
                          className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          aria-label="Telefonszám másolása"
                          title="Telefonszám másolása"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    )}
                    {(user.bankAccount || user.bank_account) && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">🏦 {user.bankAccount || user.bank_account}</span>
                        <button
                          onClick={() => handleCopyToClipboard(user.bankAccount || user.bank_account, 'Bank számlaszám')}
                          className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          aria-label="Bank számlaszám másolása"
                          title="Bank számlaszám másolása"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    )}
                    {(user.salary || user.monthlySalary || user.hourlyRate || user.hourly_rate) && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          💰 {
                            (user.salaryType === 'hourly' || user.salary_type === 'hourly' || user.hourlyRate || user.hourly_rate)
                              ? `${new Intl.NumberFormat('hu-HU').format(user.hourlyRate || user.hourly_rate || 0)} Ft/óra`
                              : `${new Intl.NumberFormat('hu-HU').format(user.salary || user.monthlySalary || 0)} Ft/hó`
                          }
                        </span>
                  </div>
                    )}
                  </div>
                  {(user.notes || user.comment) && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                      📝 {user.notes || user.comment}
                    </div>
                  )}
                  {user.effectivePermissions && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Effektív jogosultságok: {user.effectivePermissions.length} db
                    </div>
                  )}
                </div>
                  <Button
                    onClick={() => handleEditUser(user)}
                    variant="ghost"
                    size="sm"
                    aria-label={`Felhasználó szerkesztése: ${user.name || user.email}`}
                  >
                    <Edit2 />
                  </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Szerkesztés/Létrehozás modal */}
        <Modal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          title={editingUser?.id ? "Felhasználó szerkesztése" : "Új felhasználó hozzáadása"}
          size="md"
        >
          {editingUser && (
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-user-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Név
                </label>
                <input
                  id="edit-user-name"
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    fieldErrors.name ? 'border-red-300 bg-red-50 dark:bg-red-900 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                />
                {fieldErrors.name && (
                  <p id="name-error" className="text-xs text-red-600 dark:text-red-400 mt-1" role="alert">
                    {fieldErrors.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="edit-user-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email {editingUser.id ? '(nem módosítható)' : '*'}
                </label>
                <input
                  id="edit-user-email"
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => {
                    setEditingUser({ ...editingUser, email: e.target.value });
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: null }));
                    }
                  }}
                  disabled={!!editingUser.id}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    fieldErrors.email ? 'border-red-300 bg-red-50 dark:bg-red-900 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                  } ${editingUser.id ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : ''}`}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                />
                {fieldErrors.email && (
                  <p id="email-error" className="text-xs text-red-600 dark:text-red-400 mt-1" role="alert">
                    {fieldErrors.email}
                  </p>
                )}
                {editingUser.id && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Az email cím nem módosítható</p>
                )}
              </div>
              {!editingUser.id && (
                <div>
                  <label htmlFor="edit-user-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Jelszó *
                  </label>
                  <input
                    id="edit-user-password"
                    type="password"
                    value={editingUser.password || ''}
                    onChange={(e) => {
                      setEditingUser({ ...editingUser, password: e.target.value });
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: null }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      fieldErrors.password ? 'border-red-300 bg-red-50 dark:bg-red-900 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  />
                  {fieldErrors.password && (
                    <p id="password-error" className="text-xs text-red-600 dark:text-red-400 mt-1" role="alert">
                      {fieldErrors.password}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum 8 karakter</p>
                </div>
              )}
              <div>
                <label htmlFor="edit-user-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Szerepkör *
                </label>
                <select
                  id="edit-user-role"
                  value={editingUser.roleId || editingUser.role || 'readonly'}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    fieldErrors.roleId ? 'border-red-300 bg-red-50 dark:bg-red-900 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  aria-invalid={!!fieldErrors.roleId}
                  aria-describedby={fieldErrors.roleId ? 'role-error' : undefined}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
                {fieldErrors.roleId && (
                  <p id="role-error" className="text-xs text-red-600 dark:text-red-400 mt-1" role="alert">
                    {fieldErrors.roleId}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="edit-user-bank-account" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank számla (opcionális)
                </label>
                <input
                  id="edit-user-bank-account"
                  type="text"
                  value={editingUser.bankAccount || editingUser.bank_account || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, bankAccount: e.target.value, bank_account: e.target.value })}
                  placeholder="Pl: 12345678-12345678-12345678"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Bank számla"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bank számlaszám a kifizetésekhez</p>
              </div>
              <div>
                <label htmlFor="edit-user-salary-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bér típus
                </label>
                <select
                  id="edit-user-salary-type"
                  value={editingUser.salaryType || editingUser.salary_type || 'fixed'}
                  onChange={(e) => setEditingUser({ ...editingUser, salaryType: e.target.value, salary_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Bér típus"
                >
                  <option value="fixed">Fix (havi bér)</option>
                  <option value="hourly">Órabér</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">A munkabérek innen lesznek szinkronizálva</p>
              </div>
              <div>
                <label htmlFor="edit-user-salary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bér (opcionális)
                </label>
                <input
                  id="edit-user-salary"
                  type="number"
                  value={editingUser.salary || editingUser.monthlySalary || editingUser.hourlyRate || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : null;
                    const salaryType = editingUser.salaryType || editingUser.salary_type || 'fixed';
                    if (salaryType === 'fixed') {
                      setEditingUser({ ...editingUser, salary: value, monthlySalary: value, hourlyRate: null });
                    } else {
                      setEditingUser({ ...editingUser, hourlyRate: value, salary: null, monthlySalary: null });
                    }
                  }}
                  placeholder={editingUser.salaryType === 'hourly' || editingUser.salary_type === 'hourly' ? "Pl: 3000" : "Pl: 300000"}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Bér"
                  min="0"
                  step={editingUser.salaryType === 'hourly' || editingUser.salary_type === 'hourly' ? "100" : "1000"}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {editingUser.salaryType === 'hourly' || editingUser.salary_type === 'hourly' 
                    ? 'Órabér Ft-ban' 
                    : 'Havi bér Ft-ban'}
                </p>
              </div>
              <div>
                <label htmlFor="edit-user-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Megjegyzés (opcionális)
                </label>
                <textarea
                  id="edit-user-notes"
                  value={editingUser.notes || editingUser.comment || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value, comment: e.target.value })}
                  placeholder="Megjegyzések a felhasználóhoz..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  aria-label="Megjegyzés"
                />
              </div>

              {/* Custom Permissions (expandable) */}
              <div className="border-t pt-4">
                <Tooltip
                  content="A szerepkörön felüli extra jogosultságok (granted) vagy elvett jogosultságok (revoked) beállítása. Ez lehetővé teszi a finomhangolt jogosultság-kezelést."
                  position="top"
                >
                  <button
                    type="button"
                    onClick={() => setShowCustomPermissions(!showCustomPermissions)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setShowCustomPermissions(!showCustomPermissions);
                      }
                    }}
                    className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-expanded={showCustomPermissions}
                    aria-controls="custom-permissions-section"
                  >
                    <span>Egyedi jogosultságok (opcionális)</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs" aria-hidden="true">{showCustomPermissions ? '▼' : '▶'}</span>
                  </button>
                </Tooltip>
                {showCustomPermissions && (
                  <div id="custom-permissions-section" className="mt-4 space-y-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      A szerepkörön felüli extra jogosultságok (granted) vagy elvett jogosultságok (revoked) beállítása.
                    </p>
                    {PERMISSION_MODULES.map((module) => (
                      <div key={module.module} className="border dark:border-gray-700 rounded-lg p-3">
                        <h4 className="font-semibold text-sm dark:text-gray-200 mb-2">{module.label}</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-green-700 dark:text-green-400 mb-1 block">
                              Hozzáadott jogosultságok
                            </label>
                            {module.permissions.map((perm) => {
                              const isGranted = (editingUser.customPermissions?.granted || []).includes(perm.key);
                              return (
                                <label key={perm.key} className="flex items-center gap-2 text-xs dark:text-gray-300">
                                  <input
                                    type="checkbox"
                                    checked={isGranted}
                                    onChange={() => handleToggleCustomPermission(perm.key, 'granted')}
                                    className="w-4 h-4 text-green-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded focus:ring-green-500"
                                  />
                                  <span>{perm.label}</span>
                                </label>
                              );
                            })}
                          </div>
                          <div>
                            <label className="text-xs font-medium text-red-700 dark:text-red-400 mb-1 block">
                              Elvett jogosultságok
                            </label>
                            {module.permissions.map((perm) => {
                              const isRevoked = (editingUser.customPermissions?.revoked || []).includes(perm.key);
                              return (
                                <label key={perm.key} className="flex items-center gap-2 text-xs dark:text-gray-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isRevoked}
                                    onChange={() => handleToggleCustomPermission(perm.key, 'revoked')}
                                    className="w-4 h-4 text-red-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded focus:ring-red-500"
                                    aria-label={`${perm.label} elvétele`}
                                  />
                                  <span>{perm.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Effective Permissions Preview */}
              {editingUser && (
                <div className="border-t dark:border-gray-700 pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Effektív jogosultságok (előnézet)</h4>
                  <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                    <Tooltip
                      content="Az effektív jogosultságok a szerepkör alapján kapott jogosultságok, plusz a hozzáadott (granted) jogosultságok, mínusz az elvett (revoked) jogosultságok."
                      position="top"
                    >
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 cursor-help">
                        A felhasználó tényleges jogosultságai (szerepkör + hozzáadott - elvett):
                      </div>
                    </Tooltip>
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        const effective = calculateEffectivePermissions(editingUser);
                        if (effective.includes('*')) {
                          return (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded text-xs font-medium">
                              * (Minden jogosultság)
                            </span>
                          );
                        }
                        return effective.map((perm) => {
                          const module = PERMISSION_MODULES.find((m) =>
                            m.permissions.some((p) => p.key === perm)
                          );
                          const permObj = module?.permissions.find((p) => p.key === perm);
                          return (
                            <span
                              key={perm}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-300 rounded text-xs"
                              title={perm}
                              role="listitem"
                            >
                              {module?.label || perm.split('.')[0]}: {permObj?.label || perm.split('.')[1]}
                            </span>
                          );
                        });
                      })()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Összesen: {calculateEffectivePermissions(editingUser).length} jogosultság
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button onClick={handleCloseEditModal} variant="outline" disabled={isSubmitting}>
                  Mégse
                </Button>
                <Button onClick={handleSaveUser} variant="primary" loading={isSubmitting} disabled={isSubmitting}>
                  Mentés
                </Button>
              </div>
            </div>
          )}
        </Modal>

      {/* Email fiókok */}
      <Card>
        <div className="mb-4">
          <h3 className="text-xl font-bold dark:text-gray-200 mb-2">Email fiókok</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Email fiókok kezelése (levelező portál, Beállítások)
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5 flex-wrap items-center">
            {emailAccounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleEditEmailAccount(acc)}
                className="text-sm px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                {acc.email}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleAddEmailAccount}>
              Új fiók
            </Button>
          </div>
        </div>
      </Card>

      <EmailAccountEditModal
        isOpen={showEmailAccountModal}
        onClose={() => { setShowEmailAccountModal(false); setEditingEmailAccount(null); }}
        account={editingEmailAccount}
        defaults={{
          imapServer: 'imap.rackhost.hu',
          imapPort: 993,
          smtpServer: emailSettings.smtpHost || 'smtp.rackhost.hu',
          smtpPort: emailSettings.smtpPort ?? 587,
        }}
        onSave={handleSaveEmailAccount}
        onDelete={editingEmailAccount ? handleDeleteEmailAccount : undefined}
      />

      {/* Email beállítások */}
      <Card>
        <div className="mb-4">
          <h3 className="text-xl font-bold dark:text-gray-200 mb-2">Email beállítások</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            SMTP szerver beállítások az email küldéshez
          </p>
        </div>

        {isLoadingEmailSettings ? (
          <div className="space-y-4" aria-live="polite" aria-busy="true">
            {Array.from({ length: 5 }, (_, i) => (
              <SkeletonListItem key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={emailSettings.smtpHost}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={emailSettings.smtpPort}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) || 587 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="65535"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SMTP Felhasználónév
                </label>
                <input
                  type="text"
                  value={emailSettings.smtpUser}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SMTP Jelszó
                </label>
                <input
                  type="password"
                  value={emailSettings.smtpPassword}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Feladó email
                </label>
                <input
                  type="email"
                  value={emailSettings.fromEmail}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="noreply@smartcrm.hu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Feladó név
                </label>
                <input
                  type="text"
                  value={emailSettings.fromName}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="SmartCRM"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Válasz email (Reply-To)
                </label>
                <input
                  type="email"
                  value={emailSettings.replyTo}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, replyTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="info@smartcrm.hu"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailSettings.smtpSecure}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpSecure: e.target.checked }))}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">TLS/SSL használata</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button
                onClick={async () => {
                  setIsSavingEmailSettings(true);
                  try {
                    if (api.isConfigured()) {
                      await settingsUpdate({
                        smtp_host: emailSettings.smtpHost,
                        smtp_port: emailSettings.smtpPort,
                        smtp_user: emailSettings.smtpUser,
                        smtp_password: emailSettings.smtpPassword,
                        smtp_secure: emailSettings.smtpSecure,
                        from_email: emailSettings.fromEmail,
                        from_name: emailSettings.fromName,
                        reply_to: emailSettings.replyTo
                      });
                      useToastStore.getState().success('Email beállítások sikeresen mentve');
                    } else {
                      useToastStore.getState().success('Email beállítások mentve (mock mode)');
                    }
                  } catch (error) {
                    useToastStore.getState().error(error?.message || 'Hiba az email beállítások mentésekor.');
                  } finally {
                    setIsSavingEmailSettings(false);
                  }
                }}
                variant="primary"
                loading={isSavingEmailSettings}
                disabled={isSavingEmailSettings}
              >
                Email beállítások mentése
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Cégem (Adminisztráció) */}
      <Card>
        <div className="mb-4">
          <h3 className="text-xl font-bold dark:text-gray-200 mb-2">Cégem</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Céginformációk és dokumentumok kezelése
          </p>
        </div>

        <div className="space-y-6">
          {/* Logó */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Logó
            </label>
            <div className="flex items-center gap-4">
              {logoFile ? (
                <div className="w-32 h-32 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  <img
                    src={URL.createObjectURL(logoFile)}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-400 text-sm text-center px-2">
                  {companyData.companyName || 'Logó'}
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Kép méret ellenőrzés
                      const img = new Image();
                      img.onload = () => {
                        if (img.width > 800 || img.height > 800) {
                          useToastStore.getState().error('A kép mérete nem lehet nagyobb 800x800px-nél!');
                          return;
                        }
                        setLogoFile(file);
                      };
                      img.src = URL.createObjectURL(file);
                    }
                  }}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm"
                >
                  Fájl kiválasztása
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {logoFile ? logoFile.name : 'Nincs fájl kiválasztva'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  PNG vagy JPG, maximum 800x800px.
                </p>
              </div>
            </div>
          </div>

          {/* ÁSZF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ÁSZF
            </label>
            <div>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAszfFile(file);
                  }
                }}
                className="hidden"
                id="aszf-upload"
              />
              <label
                htmlFor="aszf-upload"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm"
              >
                Fájl kiválasztása
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {aszfFile ? aszfFile.name : 'Nincs fájl kiválasztva'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Csak .PDF formátum tölthető fel.
              </p>
            </div>
          </div>

          {/* Adatkezelési tájékoztató */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adatkezelési tájékoztató
            </label>
            <div>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setDataProtectionFile(file);
                  }
                }}
                className="hidden"
                id="data-protection-upload"
              />
              <label
                htmlFor="data-protection-upload"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm"
              >
                Fájl kiválasztása
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {dataProtectionFile ? dataProtectionFile.name : 'Nincs fájl kiválasztva'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Csak .PDF formátum tölthető fel.
              </p>
            </div>
          </div>

          {/* Cégadatok */}
          <div className="border-t dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Cégadatok</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Cég neve">
                <input
                  type="text"
                  value={companyData.companyName}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="HNR Smart Invest kft"
                />
              </FormField>

              <FormField label="Adószám">
                <input
                  type="text"
                  value={companyData.taxNumber}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, taxNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="32698660-2-41"
                />
              </FormField>

              <FormField label="EU adószám">
                <input
                  type="text"
                  value={companyData.euTaxNumber}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, euTaxNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="HU32698660"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  EU adószám formátum: országkód + adószám (pl. HU32698660)
                </p>
              </FormField>

              <FormField label="Irányítósz.">
                <input
                  type="text"
                  value={companyData.postalCode}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, postalCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1138"
                />
              </FormField>

              <FormField label="Település">
                <input
                  type="text"
                  value={companyData.city}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Budapest"
                />
              </FormField>

              <FormField label="Közterület">
                <input
                  type="text"
                  value={companyData.streetName}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, streetName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Úszódaru"
                />
              </FormField>

              <FormField label="Közt. típus">
                <select
                  value={companyData.streetType}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, streetType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="utca">utca</option>
                  <option value="út">út</option>
                  <option value="tér">tér</option>
                  <option value="körút">körút</option>
                  <option value="sétány">sétány</option>
                  <option value="fasor">fasor</option>
                  <option value="park">park</option>
                  <option value="köz">köz</option>
                </select>
              </FormField>

              <FormField label="Házszám">
                <input
                  type="text"
                  value={companyData.houseNumber}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, houseNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
              </FormField>

              <FormField label="Ország">
                <select
                  value={companyData.country}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Magyarország">Magyarország</option>
                  <option value="Ausztria">Ausztria</option>
                  <option value="Németország">Németország</option>
                  <option value="Románia">Románia</option>
                  <option value="Szlovákia">Szlovákia</option>
                  <option value="Szlovénia">Szlovénia</option>
                  <option value="Horvátország">Horvátország</option>
                  <option value="Szerbia">Szerbia</option>
                  <option value="Ukrajna">Ukrajna</option>
                </select>
              </FormField>

              <FormField label="Alapértelmezett pénznem">
                <select
                  value={companyData.defaultCurrency}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, defaultCurrency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Ft">Ft</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </FormField>

              <FormField label="Alapértelmezett partner típus új rögzítésnél">
                <select
                  value={companyData.defaultPartnerType}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, defaultPartnerType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Belföldi cég">Belföldi cég</option>
                  <option value="Külföldi cég">Külföldi cég</option>
                  <option value="Magánszemély">Magánszemély</option>
                  <option value="Egyéb">Egyéb</option>
                </select>
              </FormField>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={async () => {
                setIsSavingCompanyData(true);
                try {
                  // TODO: API hívás a cégadatok mentéséhez
                  // await saveCompanyData({
                  //   ...companyData,
                  //   logo: logoFile,
                  //   aszf: aszfFile,
                  //   dataProtection: dataProtectionFile
                  // });
                  
                  // Szimulált mentés
                  await new Promise(resolve => setTimeout(resolve, 500));
                  useToastStore.getState().success('Változtatások mentve');
                } catch (error) {
                  useToastStore.getState().error(error?.message || 'Hiba a változtatások mentésekor.');
                } finally {
                  setIsSavingCompanyData(false);
                }
              }}
              variant="primary"
              loading={isSavingCompanyData}
              disabled={isSavingCompanyData}
            >
              Változtatások mentése
            </Button>
          </div>
        </div>
      </Card>

      {/* Számla fiókok kezelése */}
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold dark:text-gray-200 mb-2">Számla fiókok</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Számlázási fiókok kezelése, partnerhez és lakáshoz rendelés
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setEditingInvoiceAccount({
                id: null,
                name: '',
                taxNumber: '',
                companyName: '',
                address: '',
                email: '',
                navLogin: '',
                navPassword: '',
                navXmlSignKey: '',
                navXmlExchangeKey: '',
                assignedTo: 'partner',
                partnerId: null,
                apartmentId: null,
                isDefault: false
              });
              setNavValidation({ isValid: false, companyName: '', isValidating: false });
              setShowInvoiceAccountModal(true);
            }}
            aria-label="Új számla fiók hozzáadása"
          >
            <Plus /> Új számla fiók
          </Button>
        </div>

        {isLoadingInvoiceAccounts ? (
          <div className="space-y-2" aria-live="polite" aria-busy="true">
            {Array.from({ length: 3 }, (_, i) => (
              <SkeletonListItem key={i} />
            ))}
          </div>
        ) : invoiceAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400" role="status" aria-live="polite">
            Nincsenek számla fiókok. Hozz létre egy újat a fenti gombbal.
          </div>
        ) : (
          <div className="space-y-2">
            {invoiceAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{account.name}</div>
                    {account.isDefault && (
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded text-xs font-medium">
                        Alapértelmezett
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {account.companyName} • Adószám: {account.taxNumber}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Rendelve: {
                      account.assignedTo === 'partner' && account.partnerId ? `Partnerhez (ID: ${account.partnerId})` :
                      account.assignedTo === 'apartment' && account.apartmentId ? `Lakáshoz (ID: ${account.apartmentId})` :
                      account.assignedTo
                    }
                  </div>
                  {account.navLogin && (
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✓ NAV kapcsolat beállítva
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setEditingInvoiceAccount(account);
                      setShowInvoiceAccountModal(true);
                    }}
                    variant="ghost"
                    size="sm"
                    aria-label={`Számla fiók szerkesztése: ${account.name}`}
                  >
                    <Edit2 />
                  </Button>
                  {!account.isDefault && (
                    <Button
                      onClick={async () => {
                        if (confirm(`Biztosan törölni szeretnéd a "${account.name}" számla fiókot?`)) {
                          setInvoiceAccounts(prev => prev.filter(a => a.id !== account.id));
                          useToastStore.getState().success('Számla fiók törölve');
                        }
                      }}
                      variant="ghost"
                      size="sm"
                      aria-label={`Számla fiók törlése: ${account.name}`}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Számla fiók szerkesztés/létrehozás modal */}
      <Modal
        isOpen={showInvoiceAccountModal}
        onClose={() => {
          setShowInvoiceAccountModal(false);
          setEditingInvoiceAccount(null);
        }}
        title={editingInvoiceAccount?.id ? "Számla fiók szerkesztése" : "Új számla fiók hozzáadása"}
        size="lg"
      >
        {editingInvoiceAccount && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">NAV kapcsolat</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Számlázási adatkapcsolat beállítása.
              </p>
            </div>

            <FormField label="NAV Login">
              <input
                type="text"
                value={editingInvoiceAccount.navLogin || ''}
                onChange={(e) => setEditingInvoiceAccount(prev => ({ ...prev, navLogin: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder=""
              />
            </FormField>

            <FormField label="NAV jelszó">
              <input
                type="password"
                value={editingInvoiceAccount.navPassword || ''}
                onChange={(e) => setEditingInvoiceAccount(prev => ({ ...prev, navPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder=""
              />
            </FormField>

            <FormField label="NAV XML aláírókulcs">
              <input
                type="text"
                value={editingInvoiceAccount.navXmlSignKey || ''}
                onChange={(e) => setEditingInvoiceAccount(prev => ({ ...prev, navXmlSignKey: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder=""
              />
            </FormField>

            <FormField label="NAV XML cserekulcs">
              <input
                type="text"
                value={editingInvoiceAccount.navXmlExchangeKey || ''}
                onChange={(e) => setEditingInvoiceAccount(prev => ({ ...prev, navXmlExchangeKey: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder=""
              />
            </FormField>

            {/* NAV Validáció információk */}
            {(navValidation.isValidating || navValidation.isValid || (editingInvoiceAccount.navLogin && editingInvoiceAccount.navPassword)) && (
              <div className="border-t dark:border-gray-700 pt-4">
                <div className="space-y-2">
                  {navValidation.isValidating ? (
                    <div className="text-sm text-gray-600 dark:text-gray-400">Validálás folyamatban...</div>
                  ) : navValidation.isValid ? (
                    <>
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Az adószám valid.
                      </div>
                      {navValidation.companyName && (
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          Az adószámhoz tartozó név: {navValidation.companyName}
                        </div>
                      )}
                    </>
                  ) : null}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    https://api.onlineszamla.nav.gov.hu
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {editingInvoiceAccount.id && (
                <Button
                  onClick={async () => {
                    if (confirm(`Biztosan törölni szeretnéd a "${editingInvoiceAccount.name}" számla fiókot?`)) {
                      setInvoiceAccounts(prev => prev.filter(a => a.id !== editingInvoiceAccount.id));
                      useToastStore.getState().success('Számla fiók törölve');
                      setShowInvoiceAccountModal(false);
                      setEditingInvoiceAccount(null);
                    }
                  }}
                  variant="outline"
                  disabled={isSavingInvoiceAccount}
                  className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                >
                  <Trash2 /> Törlés
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  onClick={() => {
                    setShowInvoiceAccountModal(false);
                    setEditingInvoiceAccount(null);
                    setNavValidation({ isValid: false, companyName: '', isValidating: false });
                  }}
                  variant="outline"
                  disabled={isSavingInvoiceAccount}
                >
                  Mégse
                </Button>
                <Button
                onClick={async () => {
                  if (!editingInvoiceAccount.navLogin || !editingInvoiceAccount.navPassword) {
                    useToastStore.getState().error('Kérjük, töltse ki a NAV Login és NAV jelszó mezőket!');
                    return;
                  }

                  setIsSavingInvoiceAccount(true);
                  setNavValidation({ isValidating: true, companyName: '', isValid: false });

                  try {
                    // TODO: Valós NAV API integráció
                    // A NAV Online Számla API használatához szükséges:
                    // 1. NAV technikai felhasználó regisztráció
                    // 2. XML aláírókulcs és cserekulcs generálása
                    // 3. TokenExchange API hívás a technikai felhasználó token lekéréséhez
                    // 4. QueryTaxpayer API hívás az adószám validálásához
                    // 
                    // Példa API hívás struktúra:
                    // const response = await fetch('https://api.onlineszamla.nav.gov.hu/api/v1/tokenExchange', {
                    //   method: 'POST',
                    //   headers: { 'Content-Type': 'application/xml' },
                    //   body: generateTokenExchangeXML({
                    //     login: editingInvoiceAccount.navLogin,
                    //     password: editingInvoiceAccount.navPassword,
                    //     exchangeKey: editingInvoiceAccount.navXmlExchangeKey,
                    //     signKey: editingInvoiceAccount.navXmlSignKey
                    //   })
                    // });
                    //
                    // const taxpayerResponse = await fetch('https://api.onlineszamla.nav.gov.hu/api/v1/queryTaxpayer', {
                    //   method: 'POST',
                    //   headers: { 'Content-Type': 'application/xml', 'Authorization': `Bearer ${token}` },
                    //   body: generateQueryTaxpayerXML({ taxNumber: editingInvoiceAccount.taxNumber })
                    // });

                    // Szimulált validáció (valós implementációban a fenti API hívások kellenek)
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    // Szimulált sikeres validáció
                    setNavValidation({
                      isValid: true,
                      companyName: 'Cégnév automatikusan lekérve a NAV-ból',
                      isValidating: false
                    });

                    if (editingInvoiceAccount.id) {
                      // Frissítés
                      setInvoiceAccounts(prev => prev.map(a => a.id === editingInvoiceAccount.id ? editingInvoiceAccount : a));
                      useToastStore.getState().success('Számla fiók sikeresen frissítve');
                    } else {
                      // Új létrehozása
                      const newAccount = {
                        ...editingInvoiceAccount,
                        id: Date.now()
                      };
                      setInvoiceAccounts(prev => [...prev, newAccount]);
                      useToastStore.getState().success('Számla fiók sikeresen létrehozva');
                    }
                    
                    // Modal bezárása csak sikeres mentés után
                    setTimeout(() => {
                      setShowInvoiceAccountModal(false);
                      setEditingInvoiceAccount(null);
                      setNavValidation({ isValid: false, companyName: '', isValidating: false });
                    }, 500);
                  } catch (error) {
                    setNavValidation({ isValid: false, companyName: '', isValidating: false });
                    useToastStore.getState().error(error?.message || 'Hiba a NAV kapcsolat ellenőrzésekor vagy a számla fiók mentésekor.');
                  } finally {
                    setIsSavingInvoiceAccount(false);
                  }
                }}
                  variant="primary"
                  loading={isSavingInvoiceAccount}
                  disabled={isSavingInvoiceAccount}
                >
                  Mentés
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SettingsPage;

