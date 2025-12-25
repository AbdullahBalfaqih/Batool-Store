
'use client';
import Link from 'next/link';
import {
  Home,
  Menu,
  Package,
  ShoppingBag,
  Users,
  Settings,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useState, useEffect, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSupabase } from '@/lib/supabase/provider';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { useSidebar } from '@/components/ui/sidebar';
import { useRouter, useSearchParams } from 'next/navigation';

function AdminLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { open } = useSidebar();

  useEffect(() => {
    const fetchLogo = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('logo_url')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Failed to fetch logo:', error);
      } else if (data) {
        setLogoUrl(data.logo_url);
      }
      setLoading(false);
    };
    fetchLogo();
  }, [supabase]);

  return (
    <Link href="/" className="flex items-center gap-4 py-2">
      {loading ? (
        <Skeleton className="h-10 w-10" />
      ) : logoUrl ? (
        <Image src={logoUrl} alt="Logo" width={40} height={40} className="rounded-md" />
      ) : (
        <div className="size-10 flex items-center justify-center text-primary bg-primary/10 rounded-md">
           <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'opsz' 24" }}>visibility</span>
        </div>
      )}
      <AnimatePresence>
      {open && (
        <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-semibold text-white text-lg whitespace-nowrap"
        >
            عدسات بتول
        </motion.span>
       )}
       </AnimatePresence>
    </Link>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [ordersCount, setOrdersCount] = useState<number | null>(null);
    const { supabase } = useSupabase();

    useEffect(() => {
        const secret = searchParams.get('secret');
        if (secret === process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY) {
            setIsAuthorized(true);
        } else {
            router.replace('/');
        }
    }, [searchParams, router]);

     useEffect(() => {
        const fetchPendingOrdersCount = async () => {
            const { count, error } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'قيد التجهيز');
            
            if (error) {
                console.error('Error fetching pending orders count:', error);
            } else {
                setOrdersCount(count);
            }
        };

        fetchPendingOrdersCount();

        const channel = supabase.channel('realtime orders')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `status=eq.قيد التجهيز` }, 
            (payload) => {
                fetchPendingOrdersCount();
            }
          ).subscribe();
        
        return () => {
            supabase.removeChannel(channel);
        }

    }, [supabase]);


    if (!isAuthorized) {
        return (
            <div className="grid min-h-screen w-full place-items-center bg-background-dark text-white">
                <div>
                    <p>جاري التحقق...</p>
                </div>
            </div>
        );
    }
    
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr] bg-background-dark text-white">
      <Sidebar defaultOpen={false}>
          <SidebarBody>
              <div className="flex flex-col h-full">
                  <div className="flex-shrink-0 mb-8">
                    <AdminLogo />
                  </div>
                  <nav className="flex-grow grid gap-1 text-sm font-medium">
                      <SidebarLink href={`/admin?secret=${process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY}`} label="لوحة التحكم" icon={<Home />} />
                      <SidebarLink href={`/admin/orders?secret=${process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY}`} label="الطلبات" icon={<ShoppingBag />} badge={ordersCount} />
                      <SidebarLink href={`/admin/products?secret=${process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY}`} label="المنتجات" icon={<Package />} />
                      <SidebarLink href={`/admin/customers?secret=${process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY}`} label="العملاء" icon={<Users />} />
                      <SidebarLink href={`/admin/settings?secret=${process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY}`} label="الإعدادات" icon={<Settings />} />
                  </nav>
              </div>
          </SidebarBody>
      </Sidebar>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
        <div className="grid min-h-screen w-full place-items-center bg-background-dark text-white">
            <div><p>جاري التحميل...</p></div>
        </div>
    }>
        <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
