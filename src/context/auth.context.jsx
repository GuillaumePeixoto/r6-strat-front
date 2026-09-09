import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

function AuthWrapper({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedUserId, setLoggedUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // pour éviter un "flash" avant la vérification

  const verifyUser = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setIsLoggedIn(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Token invalide');
      }

      const data = await response.json();
      setIsLoggedIn(true);
      setLoggedUserId(data.user.id);
    } catch (err) {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setLoggedUserId(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    await verifyUser();
  }, []);

  const passedContext = {
    isLoggedIn,
    setIsLoggedIn,
    loggedUserId,
    setLoggedUserId,
    isLoading,
    verifyUser,
  };

  return (
    <AuthContext.Provider value={passedContext}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthWrapper };