import { create } from 'zustand';

/**
 * Email fiókok  közös store (Email oldal, Beállítások).
 * localStorage perzisztencia: smartcrm_email_accounts
 */

const STORAGE_KEY = 'smartcrm_email_accounts';

const DEFAULT_ACCOUNTS = [
  { id: 1, email: 'info@smartproperties.hu', role: 'info', storage: 45, maxStorage: 100, password: '', imapServer: 'imap.rackhost.hu', imapPort: 993, smtpServer: 'smtp.rackhost.hu', smtpPort: 587 },
  { id: 2, email: 'registration@smartproperties.hu', role: 'registration', storage: 30, maxStorage: 100, password: '', imapServer: 'imap.rackhost.hu', imapPort: 993, smtpServer: 'smtp.rackhost.hu', smtpPort: 587 },
  { id: 3, email: 'roli@smartproperties.hu', role: 'roli', storage: 60, maxStorage: 100, password: '', imapServer: 'imap.rackhost.hu', imapPort: 993, smtpServer: 'smtp.rackhost.hu', smtpPort: 587 },
  { id: 4, email: 'sales@smartproperties.hu', role: 'sales', storage: 25, maxStorage: 100, password: '', imapServer: 'imap.rackhost.hu', imapPort: 993, smtpServer: 'smtp.rackhost.hu', smtpPort: 587 },
  { id: 5, email: 'zoli@smartproperties.hu', role: 'zoli', storage: 15, maxStorage: 100, password: '', imapServer: 'imap.rackhost.hu', imapPort: 993, smtpServer: 'smtp.rackhost.hu', smtpPort: 587 },
];

const useEmailAccountsStore = create((set, get) => ({
  accounts: [],

  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) {
          set({ accounts: arr });
          return;
        }
      }
    } catch (_) {}
    set({ accounts: [...DEFAULT_ACCOUNTS] });
  },

  persistToStorage: () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(get().accounts));
    } catch (_) {}
  },

  setAccounts: (accounts) => {
    set({ accounts });
    get().persistToStorage();
  },

  addAccount: (payload) => {
    const nextId = Math.max(0, ...get().accounts.map((a) => a.id)) + 1;
    const acc = {
      id: nextId,
      email: payload.email || '',
      role: payload.role || '',
      storage: payload.storage ?? 0,
      maxStorage: payload.maxStorage ?? 100,
      password: payload.password || '',
      imapServer: payload.imapServer || '',
      imapPort: payload.imapPort ?? 993,
      smtpServer: payload.smtpServer || '',
      smtpPort: payload.smtpPort ?? 587,
    };
    set((s) => ({ accounts: [...s.accounts, acc] }));
    get().persistToStorage();
    return acc;
  },

  updateAccount: (id, payload) => {
    set((s) => ({
      accounts: s.accounts.map((a) =>
        a.id === id ? { ...a, ...payload } : a
      ),
    }));
    get().persistToStorage();
  },

  removeAccount: (id) => {
    set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) }));
    get().persistToStorage();
  },

  getAccountById: (id) => get().accounts.find((a) => a.id === id),
}));

export default useEmailAccountsStore;
