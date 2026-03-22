import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { fetchMe, logout as apiLogout, type AuthUser, type BrandProfile } from "./api";

interface AuthContextValue {
  user: AuthUser | null;
  brand: BrandProfile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  brand: null,
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [brand, setBrand] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchMe();
      if (data) {
        setUser(data.user);
        setBrand(data.brand);
      } else {
        setUser(null);
        setBrand(null);
      }
    } catch {
      setUser(null);
      setBrand(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setBrand(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, brand, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
