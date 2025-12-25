'use client';
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import SupabaseProvider from '@/lib/supabase/provider';
import { usePathname } from 'next/navigation';
import { FloatingContactButton } from '@/components/ui/floating-contact-button';
import { CartProvider } from '@/hooks/use-cart';
import { LocalizationProvider, useLocalization } from '@/hooks/use-localization';
import Script from 'next/script';

function AppBody({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { language } = useLocalization();
    const isAdminPage = pathname.startsWith('/admin');

    return (
        <html lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <head>
            <title>عدسات بتول - انظر إلى العالم بنور جديد</title>
            <meta name="description" content="عدسات لاصقة ملونة عالية الجودة لكل مناسبة." />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
          </head>
          <body className="bg-background-light text-[#1A1A1A] font-arabic">
                <CartProvider>
                    <div id="google_translate_element" style={{ display: 'none' }}></div>
                    {!isAdminPage && <Header />}
                    <main>
                    {children}
                    </main>
                    {!isAdminPage && <Footer />}
                    <Toaster />
                    <FloatingContactButton />
                </CartProvider>
                <Script
                    src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
                    strategy="afterInteractive"
                />
                 <Script id="google-translate-init" strategy="afterInteractive">
                    {`
                        function googleTranslateElementInit() {
                            new google.translate.TranslateElement({
                                pageLanguage: 'ar',
                                includedLanguages: 'en,ar',
                                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                                autoDisplay: false
                            }, 'google_translate_element');
                        }

                        function changeLanguage(lang) {
                            var iframe = document.getElementsByClassName('goog-te-menu-frame')[0];
                            if (!iframe) return;
                            
                            var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
                            var langElements = innerDoc.getElementsByClassName('goog-te-menu2-item');
                            
                            for (var i = 0; i < langElements.length; i++) {
                                var lang_text = langElements[i].getElementsByTagName('span')[0].innerText.toLowerCase();
                                if (lang_text == lang.toLowerCase()) {
                                    langElements[i].click();
                                    return;
                                }
                            }
                        }
                    `}
                </Script>
          </body>
        </html>
    )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <SupabaseProvider>
        <LocalizationProvider>
            <AppBody>{children}</AppBody>
        </LocalizationProvider>
      </SupabaseProvider>
  );
}
