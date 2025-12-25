
'use client';
import { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { useSupabase } from '@/lib/supabase/provider';
import Image from 'next/image';

type Currency = 'SAR' | 'YER';
type Language = 'ar' | 'en';

declare global {
  interface Window {
    google: any;
    changeLanguage: (lang: string) => void;
  }
}

interface LocalizationContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  rate: number;
  currencySymbol: string | ReactNode;
  currencyImageUrl: string;
}

const YEMENI_RIAL_RATE = 428;

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('SAR');
  const [language, setLanguageState] = useState<Language>('ar');
  const [currencyImageUrl, setCurrencyImageUrl] = useState('');
  const { supabase } = useSupabase();
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined' && window.changeLanguage) {
      window.changeLanguage(lang);
    }
  };

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('currency_image_url').single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data && data.currency_image_url) {
        setCurrencyImageUrl(data.currency_image_url);
      }
    } catch (error) {
      console.error("Failed to fetch currency image", error);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);


  const { rate, currencySymbol } = useMemo(() => {
    if (currency === 'YER') {
      return { rate: YEMENI_RIAL_RATE, currencySymbol: 'ر.ي' };
    }
    // When SAR is selected
    if (currencyImageUrl) {
        return { rate: 1, currencySymbol: <Image src={currencyImageUrl} alt="currency" width={16} height={16} /> };
    }
    return { rate: 1, currencySymbol: 'ر.س' };
  }, [currency, currencyImageUrl]);
  
  const value = {
      currency,
      setCurrency,
      language,
      setLanguage,
      rate,
      currencySymbol,
      currencyImageUrl
  };

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
};
