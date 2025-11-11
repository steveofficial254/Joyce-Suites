// src/context/TenantContext.js
import { createContext, useContext, useState, useEffect } from "react";

const TenantContext = createContext();

export function TenantProvider({ children }) {
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/tenants`)
      .then((res) => res.json())
      .then(setTenants)
      .catch((err) => console.error("Error fetching tenants:", err));
  }, []);

  return (
    <TenantContext.Provider value={{ tenants, setTenants }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenants() {
  return useContext(TenantContext);
}
