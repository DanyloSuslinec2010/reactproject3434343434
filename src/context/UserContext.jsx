import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const STORAGE_KEY = 'user';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(readUser);

  // Пароль не зберігаємо, лише ім'я та пошту
  const register = ({ name, email }) => {
    const data = { name, email };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setUser(data);
  };

  const logOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, register, logOut }}>
      {children}
    </UserContext.Provider>
  );
};
