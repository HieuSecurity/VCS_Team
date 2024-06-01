// File context.js
import React, { createContext, useContext, useState } from "react";

// Tạo một context mới
export const StateContext = createContext();

// Provider component để cung cấp state cho các component con
export const StateProvider = ({ children }) => {
  const [state, setState] = useState(false);

  return (
    <StateContext.Provider value={{ state, setState }}>
      {children}
    </StateContext.Provider>
  );
};

// Hook để sử dụng state trong các component con
