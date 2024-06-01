import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isLogined, setIsLogined] = useState(false);

  return (
    <AuthContext.Provider value={{ isLogined, setIsLogined }}>
      {children}
    </AuthContext.Provider>
  );
};
