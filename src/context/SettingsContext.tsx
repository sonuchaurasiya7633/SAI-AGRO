'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface CompanySettings {
  companyName: string;
  tagline: string;
  phonePrimary: string;
  phoneSecondary: string;
  whatsappNumber: string;
  emailPrimary: string;
  emailSupport: string;
  registeredAddress: string;
  factoryAddress: string;
  gstin: string;
  stats: {
    farmersHelped: string;
    productsDelivered: string;
    statesPresence: string;
    yieldImprovement: string;
  };
  socialLinks: {
    facebook: string;
    youtube: string;
    instagram: string;
    linkedin: string;
    whatsapp: string;
  };
  heroVideoUrl: string;
  heroVideoUrl2: string;
}

export const defaultSettings: CompanySettings = {
  companyName: 'SAI AGRO INDUSTRIES',
  tagline: 'Pioneering Sustainable Agriculture & High-Yield Bio Solutions',
  phonePrimary: '+91 98765 43210',
  phoneSecondary: '+91 91234 56789',
  whatsappNumber: '919876543210',
  emailPrimary: 'info@saiagroindustries.com',
  emailSupport: 'contact@saiagroindustries.com',
  registeredAddress: 'Bela Industrial Area, Phase II, Agro Complex, India',
  factoryAddress: 'Plot No. 12-16, Eco Biotech Zone, Sai Agro Park',
  gstin: '10AAACS9988F1Z9',
  stats: {
    farmersHelped: '50,000+',
    productsDelivered: '1,50,000+',
    statesPresence: '18+ States',
    yieldImprovement: '25-35%',
  },
  socialLinks: {
    facebook: 'https://facebook.com/saiagroindustries',
    youtube: 'https://youtube.com/@saiagroindustries',
    instagram: 'https://instagram.com/saiagroindustries',
    linkedin: 'https://linkedin.com/company/saiagroindustries',
    whatsapp: 'https://wa.me/919876543210',
  },
  heroVideoUrl: 'https://res.cloudinary.com/dqpbo1uho/video/upload/v1790006013/cfxq9ax4finlluesengh.mp4',
  heroVideoUrl2: 'https://res.cloudinary.com/dqpbo1uho/video/upload/v1790006093/okb0skw8akivryv3drin.mp4',
};

interface SettingsContextType {
  settings: CompanySettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.setting) {
        setSettings((prev) => ({
          ...prev,
          ...data.setting,
          stats: { ...prev.stats, ...(data.setting.stats || {}) },
          socialLinks: { ...prev.socialLinks, ...(data.setting.socialLinks || {}) },
        }));
      }
    } catch (err) {
      console.error('Failed to load company settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
