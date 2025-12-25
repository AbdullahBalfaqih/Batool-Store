'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, Phone, Map, MapPin, Receipt, ArrowRight, X, Loader2, ShoppingBag, Download, Trash2 } from 'lucide-react';
import { Invoice } from './invoice';
import { toPng } from 'html-to-image';
import { useRef } from 'react';
import { useSupabase } from '@/lib/supabase/provider';
import { useToast } from '@/hooks/use-toast';
import Stepper, { Step } from './ui/stepper';
import { useCart } from '@/hooks/use-cart';
import { useLocalization } from '@/hooks/use-localization';


const yemeniGovernorates = [
  "صنعاء", "حضرموت", "تعز", "عدن", "الحديدة", "إب", "ذمار", "صعدة",
  "البيضاء", "شبوة", "المهرة", "لحج", "المحويت", "ريمة", "الضالع", "حجة", "أبين"
];

const phoneRegex = /^(70|71|73|77|78)\d{7}$/;

const checkoutSchema = z.object({
  customerName: z.string().min(1, { message: "اسم العميل مطلوب." }),
  phone: z.string().regex(phoneRegex, {
    message: "يجب أن يبدأ الرقم بـ 70, 71, 73, 77, أو 78 ويتكون من 9 أرقام.",
  }),
  governorate: z.string().min(1, { message: "يرجى اختيار المحافظة." }),
  city: z.string().min(1, { message: "اسم المدينة مطلوب." }),
  paymentReceipt: z.any().refine(files => files?.length > 0, 'صورة الإيصال مطلوبة.'),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const YemenFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 3 2" className="rounded-sm">
        <rect width="3" height="2" fill="#000"/>
        <rect width="3" height="1.333" fill="#fff"/>
        <rect width="3" height="0.667" fill="red"/>
    </svg>
)

const createSafeFileName = (file: File) => {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `receipts/${timestamp}-${randomString}.${fileExtension}`;
};

export function CartSheet() {
  const { items, removeItem, updateQuantity, clearCart, isCartOpen, setIsCartOpen, subtotal } = useCart();
  const { currency, rate, currencySymbol } = useLocalization();
  const [view, setView] = useState<'cart' | 'checkout'>('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInvoiceReady, setIsInvoiceReady] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormValues | null>(null);
  const [settings, setSettings] = useState({
      logo_url: '',
      bank_account_image1_url: '',
      bank_account_image2_url: '',
      website_barcode_image_url: ''
  });
  const [currencyImageUrl, setCurrencyImageUrl] = useState<string>('');

  const { supabase } = useSupabase();
  const { toast } = useToast();


  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const { register, handleSubmit, formState: { errors }, control, reset, trigger } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange"
  });
  
  const handleStepChange = async (step: number) => {
    setIsProcessing(true);
    try {
        if (step === 2) {
            // No validation needed to move from 1 to 2, just proceed.
        } else if (step === 3) {
            const result = await trigger(['customerName', 'phone', 'governorate', 'city']);
            if (!result) {
                toast({
                    variant: "destructive",
                    title: "بيانات غير مكتملة",
                    description: "يرجى مراجعة الحقول والتأكد من تعبئتها بشكل صحيح.",
                });
                return Promise.reject("Validation failed");
            }
        }
    } finally {
        setIsProcessing(false);
    }
  };


  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setSettings(data);
        setCurrencyImageUrl(data.currency_image_url || '');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  }, [supabase]);

  useEffect(() => {
    if (isCartOpen) {
      fetchSettings();
    }
  }, [isCartOpen, fetchSettings]);

  const handleDownloadInvoice = async () => {
    if (!invoiceRef.current) return;
    try {
        const dataUrl = await toPng(invoiceRef.current, { skipFonts: true });
        const link = document.createElement('a');
        link.download = 'invoice.png';
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error('oops, something went wrong!', error);
    }
  };
  
  const uploadFile = async (file: File): Promise<string> => {
      const safeFileName = createSafeFileName(file);
      const { data, error } = await supabase.storage.from('site-assets').upload(safeFileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(data.path);
      return publicUrl;
  };

  const onSubmit: SubmitHandler<CheckoutFormValues> = async (data) => {
    if (items.length === 0) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'سلة التسوق فارغة.' });
        return;
    }
    setFormData(data);
    setIsProcessing(true);

    try {
        const uniqueEmail = `${data.phone}@batool.app`;
        const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .upsert({ 
                name: data.customerName, 
                email: uniqueEmail, 
                phone: data.phone,
                city: data.governorate, 
                status: 'نشط'
            }, { onConflict: 'email', ignoreDuplicates: false })
            .select()
            .single();

        if (customerError) throw customerError;

        let receiptUrl = '';
        if (data.paymentReceipt && data.paymentReceipt.length > 0) {
            receiptUrl = await uploadFile(data.paymentReceipt[0]);
        }
        
        const totalInSAR = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

        const orderId = `BT-${Date.now().toString().slice(-6)}`;
        const { error: orderError } = await supabase.from('orders').insert({
            orderId: orderId,
            customerName: data.customerName,
            customerPhone: data.phone,
            customerAddress: `${data.governorate}, ${data.city}`,
            date: new Date().toISOString(),
            status: 'قيد التجهيز',
            total: totalInSAR,
            paymentReceiptUrl: receiptUrl,
        });

        if (orderError) throw orderError;
        
        setIsInvoiceReady(true);
        clearCart();

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'فشل في حفظ الطلب',
            description: error.message
        });
    } finally {
        setIsProcessing(false);
    }
  };
  
  const handleCloseDialog = () => {
    setIsInvoiceReady(false);
    setIsProcessing(false);
    setIsCartOpen(false);
    setTimeout(() => setView('cart'), 300);
    reset();
  }

  const renderCartView = () => (
    <>
      <SheetHeader className="text-right">
        <SheetTitle className="text-2xl text-primary">سلة التسوق</SheetTitle>
        <SheetDescription>
          لديك {items.length} {items.length === 1 ? 'منتج' : 'منتجات'} في سلتك.
        </SheetDescription>
      </SheetHeader>
      <Separator className='my-4 bg-border-dark' />
      {items.length > 0 ? (
        <div className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 py-4 text-right">
              <div className="flex items-center gap-4">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-md object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                        <Select value={String(item.quantity)} onValueChange={(val) => updateQuantity(item.id, Number(val))}>
                            <SelectTrigger className="w-20 h-8 bg-background-dark border-gray-700 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background-dark text-white border-gray-700">
                                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 h-8 w-8" onClick={() => removeItem(item.id)}>
                            <Trash2 size={16} />
                        </Button>
                  </div>
                </div>
              </div>
              <div className="font-semibold flex items-center gap-1 text-sm">
                {(item.price * item.quantity * rate).toFixed(2)}
                <span className="text-xs">{currencySymbol}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <ShoppingBag className="w-16 h-16 text-gray-600" />
          <p className="text-gray-500">سلتك فارغة.</p>
        </div>
      )}
      <SheetFooter className="mt-auto pt-6 border-t border-border-dark">
          <div className="w-full space-y-4 text-right">
              <div className="flex justify-between font-semibold text-lg">
                  <span>المجموع الفرعي</span>
                  <span className='flex items-center gap-1'>
                      {subtotal.toFixed(2)}
                      <span className="text-sm">{currencySymbol}</span>
                  </span>
              </div>
              <p className="text-xs text-gray-500">
                  الشحن والضرائب سيتم حسابها عند الدفع.
              </p>
               <Button className="w-full h-12 bg-primary text-white hover:bg-primary/90 text-base font-bold" onClick={() => setView('checkout')} disabled={items.length === 0}>
                  إتمام الطلب
              </Button>
               <Button variant="outline" className="w-full h-12 border-primary text-primary hover:bg-primary/10" onClick={() => setIsCartOpen(false)}>
                  متابعة التسوق
              </Button>
          </div>
      </SheetFooter>
    </>
  );

  const renderCheckoutView = () => (
    <>
      <SheetHeader className="text-right">
        <SheetTitle className="text-2xl text-primary">إتمام الطلب</SheetTitle>
      </SheetHeader>
      <Separator className='my-4 bg-border-dark' />
      <div className="flex-1 overflow-y-auto flex flex-col text-right -mx-6">
        <Stepper
            onStepChange={handleStepChange}
            onFinalStepCompleted={handleSubmit(onSubmit)}
            stepCircleContainerClassName="!p-4"
            stepContainerClassName="!p-4"
            contentClassName="!px-4"
            footerClassName="!px-4 !pb-4"
            backButtonText="رجوع"
            nextButtonText="التالي"
            backButtonProps={{
                className: "bg-gray-700/50 hover:bg-gray-700 text-white rounded-full"
            }}
            nextButtonProps={{
                className: "bg-primary hover:bg-primary/90 text-white rounded-full",
                disabled: isProcessing,
                children: isProcessing ? <Loader2 className="animate-spin" /> : null,
            }}
        >
            <Step>
                <h3 className="font-bold text-lg mb-2">ملخص السلة</h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-4 py-2 text-right border-b border-border-dark last:border-b-0">
                        <div className="flex items-center gap-4">
                            <Image src={item.image_url} alt={item.name} width={50} height={50} className="rounded-md object-cover" />
                            <div>
                            <h3 className="font-semibold text-sm">{item.name}</h3>
                            <p className="text-xs text-gray-400">الكمية: {item.quantity}</p>
                            </div>
                        </div>
                        <div className="font-semibold text-sm flex items-center gap-1">
                            {(item.price * item.quantity * rate).toFixed(2)}
                            <span className="text-xs">{currencySymbol}</span>
                        </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between font-bold text-md pt-4 mt-4 border-t border-border-dark">
                    <span>الإجمالي:</span>
                    <span className='flex items-center gap-1'>
                        {subtotal.toFixed(2)}
                        <span className="text-sm">{currencySymbol}</span>
                    </span>
                </div>
            </Step>
            <Step>
                <h3 className="font-bold text-lg mb-4">بيانات العميل</h3>
                 <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="customerName" className="flex items-center gap-2 text-gray-300 justify-end">
                            <span>اسم العميل</span>
                            <User className="w-4 h-4" />
                        </Label>
                        <Input id="customerName" {...register('customerName')} className="bg-background-dark border-border-dark text-right" />
                        {errors.customerName && <p className="text-red-500 text-xs text-right pr-2">{errors.customerName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2 text-gray-300 justify-end">
                            <span>رقم التواصل</span>
                            <Phone className="w-4 h-4" />
                        </Label>
                        <div className="relative">
                            <Input id="phone" type="text" pattern="\d*" {...register('phone')} className="bg-background-dark border-border-dark text-right pl-12" maxLength={9} />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <YemenFlag />
                            </div>
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs text-right pr-2">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="governorate" className="flex items-center gap-2 text-gray-300 justify-end">
                            <span>المحافظة</span>
                            <Map className="w-4 h-4" />
                        </Label>
                        <Controller
                            name="governorate"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                                    <SelectTrigger id="governorate" className="w-full bg-background-dark border-border-dark">
                                        <SelectValue placeholder="اختر محافظة" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background-dark text-white border-border-dark">
                                        {yemeniGovernorates.map(gov => <SelectItem key={gov} value={gov}>{gov}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.governorate && <p className="text-red-500 text-xs text-right pr-2">{errors.governorate.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="city" className="flex items-center gap-2 text-gray-300 justify-end">
                            <span>المدينة</span>
                            <MapPin className="w-4 h-4" />
                        </Label>
                        <Input id="city" {...register('city')} className="bg-background-dark border-border-dark text-right" />
                        {errors.city && <p className="text-red-500 text-xs text-right pr-2">{errors.city.message}</p>}
                    </div>
                 </div>
            </Step>
            <Step>
                <h3 className="font-bold text-lg mb-4">الدفع</h3>
                <div className="flex flex-col gap-4">
                     <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-gray-300 justify-end">
                            <span>طرق الدفع المتاحة</span>
                        </Label>
                        <div className="flex gap-4 justify-center items-center p-2 bg-black rounded-md">
                            {settings.bank_account_image1_url && <Image src={settings.bank_account_image1_url} alt="Bank 1" width={120} height={120} className="rounded-md object-contain" />}
                            {settings.bank_account_image2_url && <Image src={settings.bank_account_image2_url} alt="Bank 2" width={120} height={120} className="rounded-md object-contain" />}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="paymentReceipt" className="flex items-center gap-2 text-gray-300 justify-end">
                            <span>صورة إيصال الدفع</span>
                            <Receipt className="w-4 h-4" />
                        </Label>
                        <Input id="paymentReceipt" type="file" {...register('paymentReceipt')} className="bg-background-dark border-border-dark file:text-gray-400 file:ml-4 file:mr-2" accept="image/*" />
                        {errors.paymentReceipt && <p className="text-red-500 text-xs text-right pr-2">{errors.paymentReceipt.message as string}</p>}
                    </div>
                </div>
                 <p className="text-xs text-center text-yellow-400 bg-yellow-500/10 p-3 mt-4 rounded-md border border-yellow-500/20">
                   ملاحظة: الأسعار المعروضة لا تشمل رسوم التوصيل. العميل هو من يتكفل برسوم التوصيل عند استلام الطلب.
                </p>
            </Step>
        </Stepper>
      </div>
    </>
  );

  return (
    <>
    <Sheet open={isCartOpen} onOpenChange={(open) => { if(!isInvoiceReady && !isProcessing) { setIsCartOpen(open); if(!open) setTimeout(() => setView('cart'), 300)}}}>
      <SheetContent side="left" className="bg-surface-dark border-r border-border-dark text-white w-full max-w-md sm:max-w-lg flex flex-col" dir="rtl">
        <SheetClose asChild>
            <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none" onClick={handleCloseDialog}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
        </SheetClose>
        {view === 'cart' ? renderCartView() : renderCheckoutView()}
      </SheetContent>
    </Sheet>
    
    <Dialog open={isProcessing || isInvoiceReady} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-surface-dark border-border-dark text-white sm:max-w-md">
           {isProcessing && !isInvoiceReady && (
             <div className="flex flex-col items-center justify-center gap-4 p-8">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <DialogTitle className="text-lg">جاري حفظ وتأكيد الطلب...</DialogTitle>
             </div>
           )}
           {isInvoiceReady && formData && (
             <>
                <DialogHeader className="text-center">
                    <DialogTitle className="text-primary text-2xl mb-2">تم إرسال طلبك!</DialogTitle>
                    <DialogDescription>
                        سوف تتلقى رسالة بتأكيد طلبك.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto p-1">
                   <Invoice ref={invoiceRef} orderData={formData} items={items} logoUrl={settings.logo_url} currencyImageUrl={currencyImageUrl} websiteBarcodeImageUrl={settings.website_barcode_image_url} />
                </div>
                <div className="flex flex-col-reverse sm:flex-row-reverse gap-2 mt-4 justify-center">
                     <Button onClick={handleCloseDialog} variant="outline" className="w-full sm:w-auto h-9 px-4 py-2">
                        إغلاق
                    </Button>
                     <Button onClick={handleDownloadInvoice} className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 h-9 px-4 py-2">
                         <Download className="ml-2 h-4 w-4" />
                         حفظ الفاتورة
                     </Button>
                </div>
            </>
           )}
        </DialogContent>
    </Dialog>
    </>
  );
}
