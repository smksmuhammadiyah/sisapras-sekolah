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
  const [features] = useState<Features>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('feature_flags');
      if (local) {
        try {
          return { ...defaultFeatures, ...JSON.parse(local) };
        } catch (e) {
          return defaultFeatures;
        }
      }
    }
    return defaultFeatures;
  });

  // No longer need effect for initial load from local
  useEffect(() => {
    // This effect could be used for syncing if needed, but currently empty to avoid the warning
  }, []);

  return (
    <FeatureFlagContext.Provider value={{ features }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export const useFeatureFlags = () => useContext(FeatureFlagContext);
