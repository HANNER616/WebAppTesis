// src/contexts/AlertsContext.jsx
import React, { createContext, useState } from 'react';

export const AlertsContext = createContext({
  alerts: [],
  setAlerts: () => {}
});

export const AlertsProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  return (
    <AlertsContext.Provider value={{ alerts, setAlerts }}>
      {children}
    </AlertsContext.Provider>
  );
};
