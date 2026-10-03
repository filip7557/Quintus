"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { createServiceRotation } from "@/lib/serviceRotation";

const ServiceRotationContext = createContext(null);

export function useServiceRotation() {
  return useContext(ServiceRotationContext);
}

export default function ServiceRotationProvider({ children }) {
  const rotation = useMemo(() => createServiceRotation(), []);

  useEffect(() => {
    return () => rotation.dispose();
  }, [rotation]);

  return (
    <ServiceRotationContext.Provider value={rotation}>
      {children}
    </ServiceRotationContext.Provider>
  );
}
