import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'superadmin';
  sub_role?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  subRole: string | undefined;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token') || localStorage.getItem('remembered_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if remember expiry is still valid
    const rememberedToken = localStorage.getItem('remembered_token');
    const rememberExpiry = localStorage.getItem('remember_expiry');
    
    if (rememberExpiry && Date.now() > parseInt(rememberExpiry)) {
      // Expiry passed, clear remembered data
      localStorage.removeItem('remembered_email');
      localStorage.removeItem('remember_expiry');
      localStorage.removeItem('remembered_token');
    }

    if (token) {
      api.me().then(u => { setUser(u); setLoading(false); }).catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('remembered_token');
        setToken(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (emailOrPhone: string, password: string) => {
    const data = await api.login(emailOrPhone, password);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (formData: any) => {
    const data = await api.register(formData);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('remembered_token');
    localStorage.removeItem('remembered_email');
    localStorage.removeItem('remember_expiry');
    setToken(null);
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : prev);
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout, updateUser,
      isAdmin: ['admin', 'superadmin'].includes(user?.role || ''),
      isSuperAdmin: user?.role === 'superadmin',
      subRole: user?.sub_role,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
