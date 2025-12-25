
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useSupabase } from '@/lib/supabase/provider';
import { NavbarContainer, NavbarLink } from './new-navbar';
import { Search, ShoppingBag, Globe, ChevronsUpDown, DollarSign } from 'lucide-react';
import { CartSheet } from '@/components/cart-sheet';
import { usePathname, useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useLocalization } from '@/hooks/use-localization';

function Logo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data, error } = await supabase.from('site_settings').select('logo_url').single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setLogoUrl(data.logo_url);
        }
      } catch (error) {
        console.error('Failed to fetch logo:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogo();
  }, [supabase]);

  if (loading) {
    return <Skeleton className="size-11 rounded-full bg-neutral-500/20" />;
  }

  return (
    <Link href="/" className="flex items-center justify-center size-11 shrink-0">
      {logoUrl ? (
         <Image src={logoUrl} alt="Batool Lenses Logo" width={44} height={44} className="rounded-md" priority style={{ width: 'auto', height: 'auto' }} />
      ) : (
        <div className="size-11 flex items-center justify-center text-primary bg-primary/10 rounded-full">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'opsz' 24" }}>visibility</span>
        </div>
      )}
    </Link>
  );
}

function SearchBar() {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="relative inline-flex text-sm size-11 items-center justify-center text-neutral-800 dark:text-neutral-300 before:absolute before:inset-0 before:bg-neutral-500/20 hover:before:scale-100 before:scale-50 before:opacity-0 hover:before:opacity-100 before:transition before:rounded-[14px]">
                    <Search size={18} />
                </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 bg-neutral-800/50 backdrop-blur-md border-neutral-400/10 text-white"
              align="start"
              sideOffset={10}
            >
                <form onSubmit={handleSearch} className="grid gap-4">
                    <div className="space-y-2 text-right">
                        <h4 className="font-medium leading-none text-white">بحث</h4>
                        <p className="text-sm text-neutral-300">
                            ابحث عن منتجاتك المفضلة.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="relative">
                            <Input
                                id="search"
                                placeholder="عدسات، نظارات..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 bg-neutral-900/50 border-neutral-400/20 text-right pr-10"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                        </div>
                         <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90 font-bold">بحث</Button>
                    </div>
                </form>
            </PopoverContent>
        </Popover>
    );
}

function LocalizationBar() {
    const { currency, setCurrency, language, setLanguage } = useLocalization();

    return (
        <div className="bg-background-dark/80 backdrop-blur-sm text-white text-xs w-full py-1">
            <div className="container mx-auto flex justify-start items-center px-4">
                <div className="flex items-center divide-x-reverse divide-x divide-gray-600">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2 text-gray-300 hover:bg-gray-700/50 hover:text-white">
                                <Globe size={14}/>
                                <span>{language === 'ar' ? 'العربية' : 'English'}</span>
                                <ChevronsUpDown size={14} className="opacity-50"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40 bg-surface-dark border-border-dark text-white" sideOffset={10}>
                            <div className="grid gap-1">
                                <Button variant="ghost" className="justify-start" onClick={() => setLanguage('ar')}>العربية</Button>
                                <Button variant="ghost" className="justify-start" onClick={() => setLanguage('en')}>English</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2 text-gray-300 hover:bg-gray-700/50 hover:text-white">
                                <DollarSign size={14}/>
                                <span>{currency === 'SAR' ? 'ريال سعودي' : 'ريال يمني'}</span>
                                <ChevronsUpDown size={14} className="opacity-50"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40 bg-surface-dark border-border-dark text-white" sideOffset={10}>
                            <div className="grid gap-1">
                                <Button variant="ghost" className="justify-start" onClick={() => setCurrency('SAR')}>ريال سعودي (SAR)</Button>
                                <Button variant="ghost" className="justify-start" onClick={() => setCurrency('YER')}>ريال يمني (YER)</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    )
}

export function Header() {
  const { items, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (pathname.startsWith('/admin')) return null;

  return (
    <>
          <header className="fixed top-0 left-0 right-0 z-50">
              <LocalizationBar />

              <div className="flex justify-center px-4 py-4">
                  <NavbarContainer>
                      {/* Left side */}
                      <div className="flex items-center gap-x-1 sm:gap-x-2">
                          <Logo />
                      </div>

                      {/* Right side */}
                      <div className="flex items-center gap-x-0 sm:gap-x-1">
                          <NavbarLink href="#services" className="hidden md:inline-flex">
                              المميزات
                          </NavbarLink>

                          <NavbarLink href="#work" className="hidden md:inline-flex">
                              المعرض
                          </NavbarLink>

                          {/* Search + Cart */}
                          <div className="flex items-center gap-0">
                              <SearchBar />

                              <button
                                  onClick={() => setIsCartOpen(true)}
                                  className="relative inline-flex size-11 items-center justify-center text-sm text-neutral-800 dark:text-neutral-300
              before:absolute before:inset-0 before:rounded-[14px]
              before:bg-neutral-500/20 before:scale-50 before:opacity-0
              hover:before:scale-100 hover:before:opacity-100
              before:transition"
                              >
                                  <ShoppingBag size={18} />

                                  {itemCount > 0 && (
                                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                                          {itemCount}
                                      </span>
                                  )}
                              </button>
                          </div>

                          <NavbarLink href="/products" isHighlighted>
                              تسوق الآن
                          </NavbarLink>
                      </div>
                  </NavbarContainer>
              </div>
          </header>

      <CartSheet />
    </>
  );
}
