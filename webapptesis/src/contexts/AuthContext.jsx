// AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import apiAuth from '../lib/apiAuth'; // Asegúrate de que esta ruta sea correcta

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  

  
  const verifyTokenOnServer = async (t) => {
  try {
    const res = await apiAuth.post("/verify-token", { token: t })
    return true 
  } catch (error) {
    return false
    }
}

  
  useEffect(() => {
  const checkToken = async () => {
    const t = localStorage.getItem("token")

    if (!t) {
      setLoading(false)
      return
    }
    const isValid = await verifyTokenOnServer(t)
    if (isValid) {
      setToken(t)
      setIsAuthenticated(true)
    } else {
      localStorage.removeItem("token")
      setIsAuthenticated(false)
    }
    setLoading(false)
  }
  checkToken()
}, [])


  
  const login = (newToken, username, email) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);

    setToken(newToken);
    
    setIsAuthenticated(true);
  };

  // logout: borra todo
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return ctx;
};
