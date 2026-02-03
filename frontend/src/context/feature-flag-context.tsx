"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Features = {
  maintenanceMode: boolean;
  newProcurementFlow: boolean;
  emailNotifications: boolean;
  betaDashboard: boolean;
};

const defaultFeatures: Features = {
  maintenanceMode: false,
  newProcurementFlow: true,
  emailNotifications: true,
  betaDashboard: false,
};

const FeatureFlagContext = createContext<{ features: Features }>({ features: defaultFeatures });

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const [features, setFeatures] = useState<Features>(defaultFeatures);

  useEffect(() => {
    // In real app, fetch from backend /api/features
    // For now, allow override via localStorage for testing
    const local = localStorage.getItem('feature_flags');
    if (local) {
      setFeatures({ ...defaultFeatures, ...JSON.parse(local) });
    }
  }, []);

  return (
    <FeatureFlagContext.Provider value={{ features }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export const useFeatureFlags = () => useContext(FeatureFlagContext);
