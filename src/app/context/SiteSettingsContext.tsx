import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SiteSettings {
  logo_url: string;
  company_name: string;
  company_tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  location: string;
  location_url: string;
  working_hours: string;
  footer_description: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  logo_url: '/logo_gs.png',
  company_name: 'GREAT SOCIETY',
  company_tagline: 'REALESTATE & CONSTRUCTION',
  phone: '01100111618',
  whatsapp: '201100111618',
  email: 'greatsociety6@gmail.com',
  location: 'Villa 99, 1st District, 90 Street, New Cairo 1, Cairo',
  location_url: 'https://www.google.com/maps/search/Villa+99+1st+District+90+street,+New+Cairo+1,+Cairo,+Egypt',
  working_hours: 'السبت - الخميس: 9ص - 9م',
  footer_description: 'شركة Great Society للاستثمار العقاري - شركة مصرية متخصصة في تقديم خدمات عقارية شاملة في مجالات متعددة',
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_SETTINGS,
  refreshSettings: async () => {},
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  const refreshSettings = async () => {
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${BASE_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      }
    } catch {}
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export const useSiteSettings = () => useContext(SiteSettingsContext);
