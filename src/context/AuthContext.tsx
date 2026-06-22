import React from 'react';

interface AuthContextValue {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login: () => setIsLoggedIn(true),
        logout: () => setIsLoggedIn(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
