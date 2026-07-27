"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getCurrentUserProfile } from "@/services/authService";

const AuthContext = createContext<any>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const profile = await getCurrentUserProfile();

      setUser(profile);

      setLoading(false);
    }

    load();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}