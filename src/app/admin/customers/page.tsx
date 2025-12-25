
'use client';
import { useState, useEffect } from 'react';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSupabase } from '@/lib/supabase/provider';
import Image from 'next/image';

type Customer = {
  id: string;
  name: string;
  email: string;
  status: 'نشط' | 'غير نشط';
  total_spent: number;
  city: string;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [currencyImageUrl, setCurrencyImageUrl] = useState<string>('');
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState<'نشط' | 'غير نشط'>('نشط');
  const [totalSpent, setTotalSpent] = useState('0');

  const { toast } = useToast();
  const { supabase } = useSupabase();

   const CurrencyDisplay = ({imageUrl, className}: {imageUrl: string, className?: string}) => {
        if (imageUrl) {
            return <Image src={imageUrl} alt="currency" width={16} height={16} className={cn("inline-block", className)} />;
        }
        return <span className={className}>ر.س</span>;
    }

  const fetchCustomers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('customers').select('*');
    if (error) {
      toast({
        variant: 'destructive',
        title: 'فشل جلب العملاء',
        description: error.message,
      });
    } else {
      setCustomers(data as Customer[]);
    }
     const { data: settingsData, error: settingsError } = await supabase.from('site').select('settings').single();
      if (settingsError && settingsError.code !== 'PGRST116') {
            toast({ variant: 'destructive', title: 'فشل جلب الإعدادات', description: settingsError.message });
      } else if (settingsData) {
          setCurrencyImageUrl((settingsData.settings as any)?.currencyImageUrl || '');
      }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenDialog = (customer: Customer | null = null) => {
    setEditingCustomer(customer);
    if (customer) {
      setName(customer.name);
      setEmail(customer.email);
      setCity(customer.city);
      setStatus(customer.status);
      setTotalSpent(String(customer.total_spent));
    } else {
      setName('');
      setEmail('');
      setCity('');
      setStatus('نشط');
      setTotalSpent('0');
    }
    setIsDialogOpen(true);
  };
  
  const handleDeleteCustomer = async (customerId: string) => {
    const { error } = await supabase.from('customers').delete().eq('id', customerId);
    if (error) {
       toast({
        variant: 'destructive',
        title: 'فشل الحذف',
        description: error.message,
      });
    } else {
      toast({ title: 'تم الحذف بنجاح', description: 'تم حذف العميل.' });
      fetchCustomers();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerData = {
      name,
      email,
      city,
      status,
      total_spent: parseFloat(totalSpent) || 0,
    };

    let error;
    if (editingCustomer) {
      ({ error } = await supabase.from('customers').update(customerData).eq('id', editingCustomer.id));
    } else {
      ({ error } = await supabase.from('customers').insert({
        ...customerData,
        created_at: new Date().toISOString(),
      }));
    }

    if (error) {
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: error.message,
      });
    } else {
      toast({
        title: 'تم الحفظ بنجاح!',
        description: `تم ${editingCustomer ? 'تحديث' : 'إضافة'} العميل بنجاح.`,
      });
      setIsDialogOpen(false);
      fetchCustomers();
    }
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl text-primary">العملاء</h1>
        <div className="mr-auto flex items-center gap-2">
          <Button size="sm" className="h-8 gap-1" onClick={() => handleOpenDialog()}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              إضافة عميل
            </span>
          </Button>
        </div>
      </div>
      <Card className="bg-surface-dark border-border-dark text-white">
        <CardHeader>
          <CardTitle>قائمة العملاء</CardTitle>
          <CardDescription>
            إدارة العملاء وعرض أدائهم.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border-dark bg-blue-900/20">
                <TableHead className="text-blue-300">الاسم</TableHead>
                <TableHead className="text-blue-300">الحالة</TableHead>
                <TableHead className="hidden md:table-cell text-blue-300">المدينة</TableHead>
                <TableHead className="hidden md:table-cell text-left text-blue-300">
                  إجمالي الإنفاق
                </TableHead>
                <TableHead>
                    <span className="sr-only">الإجراءات</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-border-dark/50">
                    <TableCell><div className="h-4 w-40 bg-gray-700 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-6 w-20 bg-gray-700 rounded-full animate-pulse" /></TableCell>
                    <TableCell className="hidden md:table-cell"><div className="h-4 w-24 bg-gray-700 rounded animate-pulse" /></TableCell>
                    <TableCell className="hidden md:table-cell text-left"><div className="h-4 w-20 bg-gray-700 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-8 w-8 bg-gray-700 rounded-md animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow key={customer.id} className="border-border-dark/50">
                    <TableCell>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-400">{customer.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.status === 'نشط' ? 'default' : 'destructive'} className={cn({
                        'bg-green-500/10 text-green-400 border-green-500/20': customer.status === 'نشط',
                        'bg-red-500/10 text-red-400 border-red-500/20': customer.status === 'غير نشط',
                      })}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{customer.city}</TableCell>
                    <TableCell className="hidden md:table-cell text-left">
                        <div className="flex items-center justify-end gap-1">
                            {Number(customer.total_spent).toFixed(2)} <CurrencyDisplay imageUrl={currencyImageUrl} />
                        </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" className="hover:bg-surface-dark/50">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background-dark text-white border-border-dark">
                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenDialog(customer)}>تعديل</DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <button className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-red-500/20 focus:text-red-400 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left text-red-400">حذف</button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-surface-dark border-border-dark text-white">
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>هل أنت متأكد من حذف {customer.name}؟</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          لا يمكن التراجع عن هذا الإجراء. سيتم حذف بيانات العميل نهائياً.
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteCustomer(customer.id)} className="bg-red-600 hover:bg-red-700">تأكيد الحذف</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-gray-400">
                        لا يوجد عملاء حتى الآن.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-gray-400">
            عرض <strong>1-{customers.length}</strong> من <strong>{customers.length}</strong> عميل
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-surface-dark border-border-dark text-white">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-primary">
                {editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingCustomer ? 'قم بتحديث تفاصيل العميل.' : 'أدخل تفاصيل العميل الجديد.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">الاسم</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3 bg-background-dark border-border-dark" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">البريد الإلكتروني</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3 bg-background-dark border-border-dark" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="city" className="text-right">المدينة</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="col-span-3 bg-background-dark border-border-dark" required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="total_spent" className="text-right">إجمالي الإنفاق</Label>
                    <Input id="total_spent" type="number" value={totalSpent} onChange={(e) => setTotalSpent(e.target.value)} className="col-span-3 bg-background-dark border-border-dark" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">الحالة</Label>
                    <Select value={status} onValueChange={(value: 'نشط' | 'غير نشط') => setStatus(value)}>
                        <SelectTrigger className="col-span-3 bg-background-dark border-border-dark">
                            <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                        <SelectContent className="bg-background-dark text-white border-border-dark">
                            <SelectItem value="نشط">نشط</SelectItem>
                            <SelectItem value="غير نشط">غير نشط</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" className="hover:bg-surface-dark/50">إلغاء</Button>
              </DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">حفظ</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
