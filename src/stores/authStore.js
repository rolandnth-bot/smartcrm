import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../services/firebase';
import api, { authLogin, authRegister, authCheck, authLogout } from '../services/api';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  // Actions
  setUser: (user) => {
    set({ 
      user, 
      isAuthenticated: !!user,
      isLoading: false 
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  // Login (Backend API vagy Firebase)
  login: async (email, password) => {
    // Backend API használata, ha be van állítva
    if (api.isConfigured()) {
      try {
        set({ error: null, isLoading: true });
        const response = await authLogin(email, password);
        if (response.success && response.user) {
          const user = {
            id: response.user.id,
            uid: response.user.id,
            email: response.user.email,
            name: response.user.name,
            role: response.user.role,
            displayName: response.user.name || response.user.email?.split('@')[0]
          };
          set({ 
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          return { success: true, user };
        } else {
          throw new Error(response.error || 'Bejelentkezési hiba');
        }
      } catch (error) {
        const errorMessage = error.message || error.data?.error || 'Bejelentkezési hiba';
        set({ 
          error: errorMessage,
          isLoading: false,
          isAuthenticated: false,
          user: null
        });
        return { success: false, error: errorMessage };
      }
    }
    
    // Firebase Auth fallback (ha auth null pl. helyi dev, elfogadunk bármit és mock user)
    if (!auth && import.meta.env.DEV) {
      set({
        user: { uid: 'dev-mock', email: email || 'dev@local', displayName: (email || 'dev').split('@')[0] },
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      return { success: true, user: get().user };
    }
    try {
      set({ error: null, isLoading: true });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ 
        user: userCredential.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      return { success: true, user: userCredential.user };
    } catch (error) {
      const errorMessage = error.message || 'Bejelentkezési hiba';
      set({ 
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        user: null
      });
      return { success: false, error: errorMessage };
    }
  },

  register: async (data) => {
    // Backend API használata, ha be van állítva
    if (api.isConfigured()) {
      try {
        set({ error: null, isLoading: true });
        const response = await authRegister(data);
        if (response.success) {
          set({ 
            isLoading: false,
            error: null
          });
          return { success: true, message: response.message };
        } else {
          throw new Error(response.error || 'Regisztrációs hiba');
        }
      } catch (error) {
        const errorMessage = error.message || error.data?.error || 'Regisztrációs hiba';
        set({ 
          error: errorMessage,
          isLoading: false,
          isAuthenticated: false,
          user: null
        });
        return { success: false, error: errorMessage };
      }
    }
    
    // Firebase Auth fallback (csak email + password)
    const email = typeof data === 'string' ? data : data.email;
    const password = typeof data === 'object' ? data.password : data;
    try {
      set({ error: null, isLoading: true });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      set({ 
        user: userCredential.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      return { success: true, user: userCredential.user };
    } catch (error) {
      const errorMessage = error.message || 'Regisztrációs hiba';
      set({ 
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        user: null
      });
      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    // Backend API használata, ha be van állítva
    if (api.isConfigured()) {
      try {
        await authLogout();
        set({ 
          user: null,
          isAuthenticated: false,
          error: null
        });
        return { success: true };
      } catch (error) {
        // Még ha a backend hiba, akkor is kijelentkezünk lokálisan
        set({ 
          user: null,
          isAuthenticated: false,
          error: null
        });
        return { success: true };
      }
    }
    
    // Firebase Auth fallback
    try {
      await signOut(auth);
      set({ 
        user: null,
        isAuthenticated: false,
        error: null
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Kijelentkezési hiba';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // PIN alapú bejelentkezés
  loginWithPin: async (pin) => {
    const CORRECT_PIN = '0000';
    
    if (!pin || pin.trim() === '') {
      set({ 
        error: 'PIN kód megadása kötelez',
        isLoading: false
      });
      return { success: false, error: 'PIN kód megadása kötelez' };
    }

    if (pin.trim() !== CORRECT_PIN) {
      set({ 
        error: 'Hibás PIN kód',
        isLoading: false,
        isAuthenticated: false,
        user: null
      });
      return { success: false, error: 'Hibás PIN kód' };
    }

    // Sikeres bejelentkezés
    set({ 
      user: { 
        uid: 'admin-user',
        email: 'admin@smartcrm.hu',
        displayName: 'Admin',
        name: 'Admin',
        role: 'admin'
      },
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
    localStorage.setItem('smartcrm_auth', 'true');
    localStorage.setItem('smartcrm_user', JSON.stringify({ 
      email: 'admin@smartcrm.hu',
      name: 'Admin',
      role: 'admin'
    }));
    return { success: true };
  },

  // Mock login (teszteléshez, ha nincs Firebase konfigurálva)
  mockLogin: async (email, password) => {
    // Mock login - csak teszteléshez
    if (email && password) {
      set({ 
        user: { 
          uid: 'mock-user-id',
          email: email,
          displayName: email.split('@')[0]
        },
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      localStorage.setItem('smartcrm_auth', 'true');
      localStorage.setItem('smartcrm_user', JSON.stringify({ email }));
      return { success: true };
    }
    return { success: false, error: 'Email és jelszó megadása kötelez' };
  },

  mockLogout: () => {
    set({ 
      user: null,
      isAuthenticated: false,
      error: null
    });
    localStorage.removeItem('smartcrm_auth');
    localStorage.removeItem('smartcrm_user');
  },

  // Auth state check (Backend API vagy Firebase)
  checkAuth: async () => {
    if (api.isConfigured()) {
      try {
        const response = await authCheck();
        if (response.authenticated && response.user) {
          const user = {
            id: response.user.id,
            uid: response.user.id,
            email: response.user.email,
            name: response.user.name,
            role: response.user.role,
            displayName: response.user.name || response.user.email?.split('@')[0]
          };
          get().setUser(user);
          return { authenticated: true, user };
        } else {
          get().setUser(null);
          return { authenticated: false };
        }
      } catch (error) {
        get().setUser(null);
        return { authenticated: false };
      }
    }
    
    // Firebase Auth fallback
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          get().setUser(user);
          resolve({ authenticated: true, user });
        } else {
          // Ha nincs Firebase user, ellenrizzük a localStorage-t (mock mode)
          const storedAuth = localStorage.getItem('smartcrm_auth');
          if (storedAuth) {
            const storedUser = localStorage.getItem('smartcrm_user');
            if (storedUser) {
              try {
                const userData = JSON.parse(storedUser);
                const mockUser = { 
                  uid: 'mock-user-id',
                  email: userData.email,
                  displayName: userData.email?.split('@')[0]
                };
                get().setUser(mockUser);
                resolve({ authenticated: true, user: mockUser });
              } catch (e) {
                get().setUser(null);
                resolve({ authenticated: false });
              }
            } else {
              get().setUser(null);
              resolve({ authenticated: false });
            }
          } else {
            get().setUser(null);
            resolve({ authenticated: false });
          }
        }
        unsubscribe();
      });
    });
  },

  // Auth state listener inicializálása (Firebase-hez)
  initAuth: () => {
    // OFFLINE MODE: Automatikusan bejelentkeztetünk mock felhasználóval
    if (!api.isConfigured()) {
      const mockUser = {
        uid: 'mock-user-' + Date.now(),
        email: 'demo@smartcrm.hu',
        displayName: 'Demo Felhasználó'
      };
      get().setUser(mockUser);
      localStorage.setItem('smartcrm_auth', JSON.stringify({ mock: true }));
      localStorage.setItem('smartcrm_user', JSON.stringify({ email: mockUser.email }));
      return () => {};
    }

    if (api.isConfigured()) {
      // Backend API esetén csak egyszer ellenrizzük
      const done = () => {};
      get().checkAuth().then(done).catch(() => get().setUser(null));
      // DEV: ha a backend nem elérhet (pl. Cursor/localhost), 2.5 mp után mutassuk a login oldalt
      if (import.meta.env.DEV) {
        setTimeout(() => {
          if (get().isLoading) get().setUser(null);
        }, 2500);
      }
      return () => {};
    }

    // Firebase auth state listener (ha auth null, pl. Firebase init sikertelen helyben)
    if (!auth) {
      get().setUser(null);
      return () => {};
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        get().setUser(user);
      } else {
        // Ha nincs Firebase user, ellenrizzük a localStorage-t (mock mode)
        const storedAuth = localStorage.getItem('smartcrm_auth');
        if (storedAuth) {
          const storedUser = localStorage.getItem('smartcrm_user');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              get().setUser({
                uid: 'mock-user-id',
                email: userData.email,
                displayName: userData.email?.split('@')[0]
              });
            } catch (e) {
              get().setUser(null);
            }
          } else {
            get().setUser(null);
          }
        } else {
          get().setUser(null);
        }
      }
    });

    // DEV (Cursor/localhost): ha a Firebase nem válaszol, 2.5 mp után mutassuk a login oldalt
    if (import.meta.env.DEV) {
      const t = setTimeout(() => {
        if (get().isLoading) get().setUser(null);
      }, 2500);
      const origUnsubscribe = unsubscribe;
      return () => {
        clearTimeout(t);
        origUnsubscribe();
      };
    }

    return unsubscribe;
  }
}));

export default useAuthStore;

