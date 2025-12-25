
'use client';
import { useState, useEffect, useMemo } from 'react';
import { File, ListFilter, MoreHorizontal, PlusCircle, Check, X, Phone, User, MapPin, Receipt, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSupabase } from '@/lib/supabase/provider';
import Image from 'next/image';
import Link from 'next/link';

type Order = {
    id: string;
    orderId: string;
    customerName: string;
    customerPhone?: string;
    customerAddress?: string;
    date: string;
    status: 'تم التسليم' | 'قيد التجهيز' | 'تم الشحن' | 'ملغي';
    total: number;
    paymentReceiptUrl?: string;
};

const ORDER_STATUSES: Order['status'][] = ['تم التسليم', 'قيد التجهيز', 'تم الشحن', 'ملغي'];

const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'تم التسليم':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'قيد التجهيز':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'تم الشحن':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'ملغي':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
    const [currencyImageUrl, setCurrencyImageUrl] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string[]>([]);
    const { toast } = useToast();
    const { supabase } = useSupabase();

    const filteredOrders = useMemo(() => {
        if (filterStatus.length === 0) {
            return orders;
        }
        return orders.filter(order => filterStatus.includes(order.status));
    }, [orders, filterStatus]);

    const handleFilterChange = (status: string) => {
        setFilterStatus(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const handleExport = () => {
        const tableHtml = `
            <html dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <title>تقرير الطلبات</title>
                    <style>
                        body { font-family: 'Almarai', sans-serif; background-color: #111; color: #fff; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #333; padding: 12px; text-align: right; }
                        th { background-color: #1a2c42; color: #60a5fa; }
                        tr:nth-child(even) { background-color: #222; }
                        h1 { color: #60a5fa; text-align: center; }
                    </style>
                </head>
                <body>
                    <h1>تقرير الطلبات</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>العميل</th>
                                <th>رقم الطلب</th>
                                <th>الحالة</th>
                                <th>التاريخ</th>
                                <th>المبلغ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredOrders.map(order => `
                                <tr>
                                    <td>${order.customerName}</td>
                                    <td>${order.orderId}</td>
                                    <td>${order.status}</td>
                                    <td>${new Date(order.date).toLocaleDateString()}</td>
                                    <td>${Number(order.total).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;
        const blob = new Blob([tableHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orders-report.html';
        a.click();
        URL.revokeObjectURL(url);
    };


    const CurrencyDisplay = ({imageUrl, className}: {imageUrl: string, className?: string}) => {
        if (imageUrl) {
            return <Image src={imageUrl} alt="currency" width={16} height={16} className={cn("inline-block", className)} />;
        }
        return <span className={className}>ر.س</span>;
    }
    
    const handleWhatsAppAction = async (action: 'accept' | 'reject') => {
        if (!selectedOrder || !selectedOrder.customerPhone) return;

        const phone = selectedOrder.customerPhone.startsWith('967') ? selectedOrder.customerPhone : `967${selectedOrder.customerPhone}`;
        let message = '';
        let newStatus: Order['status'] | null = null;
        
        if (action === 'accept') {
            message = `مرحباً ${selectedOrder.customerName}، تم قبول طلبك رقم #${selectedOrder.orderId} وجاري تجهيزه للشحن. شكراً لثقتك بـ عدسات بتول!`;
            newStatus = 'تم الشحن';
        } else {
            message = `مرحباً ${selectedOrder.customerName}، نأسف لإبلاغك بأنه تم رفض طلبك رقم #${selectedOrder.orderId}. يرجى التواصل معنا لمزيد من التفاصيل.`;
            newStatus = 'ملغي';
        }
        
        if (newStatus) {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', selectedOrder.id);

            if (error) {
                toast({
                    variant: 'destructive',
                    title: 'فشل تحديث حالة الطلب',
                    description: error.message
                });
                return;
            }
            
            // This local state update is now handled by the realtime subscription
            // setOrders(prevOrders => prevOrders.map(o => o.id === selectedOrder.id ? {...o, status: newStatus as Order['status']} : o));
            setSelectedOrder(prev => prev ? {...prev, status: newStatus as Order['status']} : null);
        }

        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        setIsDetailViewOpen(false);
    };

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });;
            if (error) {
                toast({
                    variant: 'destructive',
                    title: 'فشل جلب الطلبات',
                    description: error.message,
                });
            } else {
                setOrders(data as Order[]);
            }

            const { data: settingsData, error: settingsError } = await supabase.from('site').select('settings').single();
            if (settingsError && settingsError.code !== 'PGRST116') {
                 toast({ variant: 'destructive', title: 'فشل جلب الإعدادات', description: settingsError.message });
            } else if (settingsData) {
                setCurrencyImageUrl((settingsData.settings as any)?.currencyImageUrl || '');
            }

            setIsLoading(false);
        };
        fetchOrders();

        const channel = supabase.channel('realtime orders')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'orders'}, 
            (payload) => {
                fetchOrders();
            }
          ).subscribe();

        return () => {
            supabase.removeChannel(channel);
        }

    }, [supabase, toast]);
    
    const handleRowClick = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailViewOpen(true);
    };

  return (
    <>
    <Tabs defaultValue="all">
      <div className="flex items-center">
         <h1 className="text-lg font-semibold md:text-2xl text-primary">الطلبات</h1>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1 text-sm bg-surface-dark border-border-dark text-gray-300 hover:text-primary">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">فلتر</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background-dark text-white border-border-dark">
              <DropdownMenuLabel>فلترة حسب الحالة</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ORDER_STATUSES.map(status => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={filterStatus.includes(status)}
                    onCheckedChange={() => handleFilterChange(status)}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
           <Button size="sm" variant="outline" className="h-7 gap-1 text-sm bg-surface-dark border-border-dark text-gray-300 hover:text-primary" onClick={handleExport}>
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">تصدير</span>
          </Button>
        </div>
      </div>
      <TabsContent value="all">
        <Card className="bg-surface-dark border-border-dark text-white">
          <CardHeader className="px-7">
            <CardTitle className="text-primary">الطلبات</CardTitle>
            <CardDescription>الطلبات الأخيرة من متجرك.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border-dark bg-blue-900/20">
                  <TableHead className="text-right text-blue-300">العميل</TableHead>
                  <TableHead className="hidden sm:table-cell text-right text-blue-300">
                    رقم الطلب
                  </TableHead>
                  <TableHead className="hidden sm:table-cell text-right text-blue-300">الحالة</TableHead>
                  <TableHead className="hidden md:table-cell text-right text-blue-300">التاريخ</TableHead>
                  <TableHead className="text-left text-blue-300">المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-border-dark/50">
                            <TableCell><div className="h-4 w-32 bg-gray-700 rounded animate-pulse" /></TableCell>
                            <TableCell className="hidden sm:table-cell"><div className="h-4 w-24 bg-gray-700 rounded animate-pulse" /></TableCell>
                            <TableCell className="hidden sm:table-cell"><div className="h-6 w-20 bg-gray-700 rounded-full animate-pulse" /></TableCell>
                            <TableCell className="hidden md:table-cell"><div className="h-4 w-24 bg-gray-700 rounded animate-pulse" /></TableCell>
                            <TableCell className="text-left"><div className="h-4 w-16 bg-gray-700 rounded animate-pulse" /></TableCell>
                        </TableRow>
                    ))
                ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <TableRow key={order.id} className="border-border-dark/50 cursor-pointer hover:bg-surface-dark/50" onClick={() => handleRowClick(order)}>
                            <TableCell>
                                <div className="font-medium text-right">{order.customerName}</div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-right">
                                {order.orderId}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-right">
                                <Badge className={cn("text-xs", getStatusBadgeClass(order.status))} variant="outline">
                                    {order.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-right">{new Date(order.date).toLocaleDateString()}</TableCell>
                            <TableCell className="text-left flex items-center justify-start gap-1">{Number(order.total).toFixed(2)} <CurrencyDisplay imageUrl={currencyImageUrl} /></TableCell>
                        </TableRow>
                    ))
                ) : (
                     <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-gray-400">
                            لا توجد طلبات تطابق الفلتر المحدد.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
    
     {selectedOrder && (
        <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
            <DialogContent className="sm:max-w-md bg-surface-dark border-border-dark text-white">
                <DialogHeader>
                    <DialogTitle className="text-primary">تفاصيل الطلب #{selectedOrder.orderId}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4 text-right">
                   <div className="flex items-center gap-2">
                       <User className="text-gray-400" size={18} />
                       <span className="font-semibold">العميل:</span>
                       <span>{selectedOrder.customerName}</span>
                   </div>
                    <div className="flex items-center gap-2">
                       <Phone className="text-gray-400" size={18} />
                       <span className="font-semibold">رقم التواصل:</span>
                       <span>{selectedOrder.customerPhone || 'غير متوفر'}</span>
                   </div>
                    <div className="flex items-center gap-2">
                       <MapPin className="text-gray-400" size={18} />
                       <span className="font-semibold">العنوان:</span>
                       <span>{selectedOrder.customerAddress || 'غير متوفر'}</span>
                   </div>
                   {selectedOrder.paymentReceiptUrl && (
                        <div className="flex items-center gap-2">
                           <Receipt className="text-gray-400" size={18} />
                           <span className="font-semibold">إيصال الدفع:</span>
                           <Link href={selectedOrder.paymentReceiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                               <span>عرض الإيصال</span>
                               <LinkIcon size={14} />
                           </Link>
                       </div>
                   )}
                    <div className="flex items-center gap-2">
                       <Badge className={cn("text-xs", getStatusBadgeClass(selectedOrder.status))} variant="outline">
                           {selectedOrder.status}
                       </Badge>
                   </div>
                    <div className="flex items-center gap-2 text-lg">
                       <span className="font-bold">الإجمالي:</span>
                       <span className="text-primary font-bold flex items-center gap-1">{Number(selectedOrder.total).toFixed(2)} <CurrencyDisplay imageUrl={currencyImageUrl} /></span>
                   </div>
                </div>
                <DialogFooter className="sm:justify-start pt-4 border-t border-border-dark">
                    <div className="flex gap-2 w-full">
                        <Button type="button" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleWhatsAppAction('accept')} disabled={!selectedOrder.customerPhone}>
                             <Check className="ml-2 h-4 w-4" />
                            قبول وإبلاغ
                        </Button>
                        <Button type="button" className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => handleWhatsAppAction('reject')} disabled={!selectedOrder.customerPhone}>
                             <X className="ml-2 h-4 w-4" />
                            رفض وإبلاغ
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
     )}
    </>
  );
}
