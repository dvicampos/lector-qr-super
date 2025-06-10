import React, { createContext, useState, ReactNode } from 'react';

export const AuthContext = createContext({
  token: null,
  setToken: () => {},
  escuelasupervisor: '',
  setEscuelaSupervisor: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [escuelasupervisor, setEscuelaSupervisor] = useState('');

  return (
    <AuthContext.Provider value={{ token, setToken, escuelasupervisor, setEscuelaSupervisor }}>
      {children}
    </AuthContext.Provider>
  );
};
