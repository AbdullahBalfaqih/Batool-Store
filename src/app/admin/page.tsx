
'use client';
import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSupabase } from '@/lib/supabase/provider';
import Image from 'next/image';

type Order = {
    id: string;
    orderId: string;
    customerName: string;
    date: string;
    status: 'تم التسليم' | 'قيد التجهيز' | 'تم الشحن' | 'ملغي';
    total: number;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  status: 'نشط' | 'غير نشط';
  total_spent: number;
  city: string;
};


export default function AdminDashboard() {
    const [stats, setStats] = useState({ totalRevenue: 0, sales: 0 });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currencyImageUrl, setCurrencyImageUrl] = useState<string>('');
    const { supabase } = useSupabase();

    const CurrencyDisplay = ({imageUrl, className}: {imageUrl: string, className?: string}) => {
        if (imageUrl) {
            return <Image src={imageUrl} alt="currency" width={16} height={16} className={cn("inline-block", className)} />;
        }
        return <span className={className}>ر.س</span>;
    }


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch orders
                const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*').limit(5).order('date', { ascending: false });
                if (ordersError) throw ordersError;
                
                // Fetch customers
                const { data: customersData, error: customersError } = await supabase.from('customers').select('*').limit(5).order('created_at', { ascending: false });
                if (customersError) throw customersError;

                // Fetch settings
                const { data: settingsData, error: settingsError } = await supabase.from('site').select('settings').single();
                if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;

                const allOrders = await supabase.from('orders').select('status,total');
                if (allOrders.error) throw allOrders.error;

                const deliveredOrders = allOrders.data.filter((o: Order) => o.status === 'تم التسليم');
                const totalRevenue = deliveredOrders.reduce((acc: number, order: Order) => acc + order.total, 0);
                const sales = deliveredOrders.length;
                
                if (settingsData && (settingsData.settings as any)?.currencyImageUrl) {
                    setCurrencyImageUrl((settingsData.settings as any).currencyImageUrl);
                }
                
                setStats({ totalRevenue, sales });
                setRecentOrders(ordersData || []);
                setRecentCustomers(customersData || []);

            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [supabase]);

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl text-primary">لوحة التحكم</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
        <Card className="bg-surface-dark border-border-dark text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="h-8 w-32 bg-gray-700 rounded animate-pulse mt-2"/> : <div className="text-2xl font-bold flex items-center gap-1">{stats.totalRevenue.toFixed(2)} <CurrencyDisplay imageUrl={currencyImageUrl} className="size-5" /></div>}
          </CardContent>
        </Card>
        <Card className="bg-surface-dark border-border-dark text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المبيعات</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="h-8 w-20 bg-gray-700 rounded animate-pulse mt-2"/> : <div className="text-2xl font-bold">+{stats.sales}</div>}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2 bg-surface-dark border-border-dark text-white">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle className="text-primary">المعاملات</CardTitle>
              <CardDescription>
                المعاملات الأخيرة من متجرك.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="mr-auto gap-1 bg-primary text-primary-foreground hover:bg-primary/80">
              <Link href="/admin/orders">
                عرض الكل
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border-dark bg-blue-900/20">
                  <TableHead className="text-blue-300 text-center">العميل</TableHead>
                  <TableHead className="text-blue-300 text-center">الحالة</TableHead>
                  <TableHead className="hidden md:table-cell text-blue-300 text-center">التاريخ</TableHead>
                  <TableHead className="text-center text-blue-300">المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index} className="border-border-dark/50">
                            <TableCell><div className="h-4 w-32 bg-gray-700 rounded animate-pulse mx-auto" /></TableCell>
                            <TableCell><div className="h-6 w-20 bg-gray-700 rounded-full animate-pulse mx-auto" /></TableCell>
                            <TableCell className="hidden md:table-cell"><div className="h-4 w-24 bg-gray-700 rounded animate-pulse mx-auto" /></TableCell>
                            <TableCell><div className="h-4 w-20 bg-gray-700 rounded animate-pulse mx-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                    <TableRow key={order.id} className="border-border-dark/50">
                        <TableCell className="text-center">
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-sm text-gray-400">
                                {order.orderId}
                            </div>
                        </TableCell>
                        <TableCell className="text-center">
                            <Badge className={cn("text-xs", order.status === 'تم التسليم' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20')} variant="outline">
                                {order.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center">{new Date(order.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-center flex items-center justify-center gap-1">{Number(order.total).toFixed(2)} <CurrencyDisplay imageUrl={currencyImageUrl} /></TableCell>
                    </TableRow>
                ))
               ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-gray-400">
                        لا توجد معاملات حتى الآن.
                    </TableCell>
                </TableRow>
               )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="bg-surface-dark border-border-dark text-white">
          <CardHeader>
            <CardTitle className="text-primary">العملاء الجدد</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-8">
            {isLoading ? (
                 Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="grid gap-1 w-full">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                         <Skeleton className="h-4 w-16 ml-auto" />
                    </div>
                ))
            ) : recentCustomers.length > 0 ? (
                recentCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center gap-4">
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">{customer.name}</p>
                        <p className="text-sm text-gray-400">{customer.email}</p>
                    </div>
                     <div className="mr-auto font-medium flex items-center gap-1">{Number(customer.total_spent).toFixed(2)} <CurrencyDisplay imageUrl={currencyImageUrl} /></div>
                    <CircleUser className="hidden h-9 w-9 sm:flex text-gray-400" />
                </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-10">
                لا يوجد عملاء جدد.
            </div>
          )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
