import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface AuthState {
  phone: string | null;
  loginTime: number | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (phone: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'sudoku_auth';

function loadFromStorage(): { phone: string; loginTime: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.phone && data.loginTime) return data;
  } catch {
    // 数据损坏，清除
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

function saveToStorage(phone: string, loginTime: number) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ phone, loginTime }));
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ phone: null, loginTime: null, loading: true });

  // 启动时检查已有登录态
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      setState({ phone: saved.phone, loginTime: saved.loginTime, loading: false });
    } else {
      setState({ phone: null, loginTime: null, loading: false });
    }
  }, []);

  const login = useCallback((phone: string) => {
    const now = Date.now();
    saveToStorage(phone, now);
    setState({ phone, loginTime: now, loading: false });
  }, []);

  const logout = useCallback(() => {
    clearStorage();
    setState({ phone: null, loginTime: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
