// AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estado de si estamos autenticados
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Mientras comprobamos el token en el servidor
  const [loading, setLoading] = useState(true);
  // Guardamos también el valor crudo por si lo necesitas
  const [token, setToken] = useState(null);


  // Función para verificar en backend
  const verifyTokenOnServer = async (t) => {

   
    const res = await fetch('http://localhost:3000/service/auth/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: t }),
    });
    return res.ok; // Devuelve true si el token es válido
  };

  // Efecto que corre sólo al montar el provider
  useEffect(() => {
    (async () => {
      const t = localStorage.getItem('token');
      console.log('Token recuperado del localStorage:', t);
      if (!t) {
        // No había token
        setLoading(false);
        return;
      }

      try {
        const valid = await verifyTokenOnServer(t);
        if (valid) {
          // Si el backend dice que sigue válido, lo mantenemos
          setToken(t);
          setIsAuthenticated(true);
        } else {
          // Token expirado o inválido → desloguear
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } catch (err) {
        // Cualquier error de red o 401 → desloguear
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // login: guarda token en estado + localStorage
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
