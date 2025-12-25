
'use client';

import React from 'react';
import Image from 'next/image';
import { Separator } from './ui/separator';
import { CheckoutFormValues } from './cart-sheet';
import { Badge } from './ui/badge';
import { CartItem } from '@/hooks/use-cart';
import { useLocalization } from '@/hooks/use-localization';


interface InvoiceProps {
  orderData: CheckoutFormValues;
  items: CartItem[];
  logoUrl?: string;
  currencyImageUrl: string;
  websiteBarcodeImageUrl?: string;
}

const Logo = ({ logoUrl }: { logoUrl?: string }) => {
    if (logoUrl) {
        return (
            <div className="relative size-16">
                <Image src={logoUrl} alt="Logo" layout="fill" objectFit="contain" className="rounded-full" />
            </div>
        );
    }
    return (
     <div className="size-16 flex items-center justify-center text-primary bg-primary/10 rounded-full border-2 border-primary/20">
        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1, 'opsz' 40" }}>visibility</span>
    </div>
    );
};


const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="font-medium text-white text-left">{value}</span>
    </div>
);

const CurrencyDisplay = ({imageUrl, symbol}: {imageUrl: string, symbol: string}) => {
    if (imageUrl) {
        return <Image src={imageUrl} alt="currency" width={16} height={16} className="inline-block" style={{ width: 'auto', height: 'auto' }} />;
    }
    return <span className="text-xs">{symbol}</span>;
}

export const Invoice = React.forwardRef<HTMLDivElement, InvoiceProps>(({ orderData, items, logoUrl, currencyImageUrl, websiteBarcodeImageUrl }, ref) => {
  const { rate, currencySymbol } = useLocalization();
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity * rate, 0);
  const orderDate = new Date().toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' });
  const orderId = `BT-${Date.now().toString().slice(-6)}`;

  return (
    <div ref={ref} className="bg-black text-white p-6 rounded-lg w-full max-w-md mx-auto font-arabic" dir='rtl'>
      <div className="flex flex-col items-center text-center">
        <Logo logoUrl={logoUrl} />
        <h1 className="text-2xl font-bold mt-4">فاتورة الطلب</h1>
        <p className="text-gray-500 text-xs">رقم الطلب: #{orderId}</p>
        <p className="text-gray-500 text-xs">التاريخ: {orderDate}</p>
      </div>

      <Separator className="my-6 bg-border-dark" />

      <div>
        <h2 className="font-bold mb-2 text-primary">تفاصيل العميل:</h2>
        <div className="space-y-2 text-sm bg-surface-dark p-4 rounded-md">
            <DetailRow label="اسم العميل" value={orderData.customerName} />
            <DetailRow label="رقم التواصل" value={`+967 ${orderData.phone}`} />
            <DetailRow label="العنوان" value={`${orderData.governorate}، ${orderData.city}`} />
        </div>
      </div>

      <Separator className="my-6 bg-border-dark" />

      <div>
        <h2 className="font-bold mb-2 text-primary">ملخص الطلب:</h2>
        <div className="space-y-4">
          {items.map(product => {
             const discountAmount = product.originalPrice ? (product.originalPrice - product.price) * rate : 0;
             const discountPercentage = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
            return (
              <div key={product.id} className="flex items-start justify-between gap-4 p-4 bg-surface-dark rounded-md">
                  <div className="flex items-center gap-4">
                      <Image src={product.image_url} alt={product.name} width={60} height={60} className="rounded-md object-cover" />
                      <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-xs text-gray-400">الكمية: {product.quantity}</p>
                          {discountPercentage > 0 && 
                            <Badge variant="destructive" className="mt-2 text-xs">خصم {discountPercentage}%</Badge>
                          }
                      </div>
                  </div>
                  <div className="text-left">
                      <p className="font-semibold flex items-center justify-end gap-1">
                        {(product.price * rate).toFixed(2)} <CurrencyDisplay imageUrl={currencyImageUrl} symbol={currencySymbol} />
                      </p>
                      {product.originalPrice && (
                         <p className="text-xs text-gray-500 line-through flex items-center justify-end gap-1">
                             {(product.originalPrice * rate).toFixed(2)} <CurrencyDisplay imageUrl={currencyImageUrl} symbol={currencySymbol} />
                         </p>
                      )}
                  </div>
              </div>
            )
          })}
        </div>
      </div>

       <Separator className="my-6 bg-border-dark" />

       <div className="space-y-2">
            <div className="flex justify-between font-semibold">
                <span>المجموع الفرعي:</span>
                <span className="flex items-center gap-1">{totalPrice.toFixed(2)} <CurrencyDisplay imageUrl={currencyImageUrl} symbol={currencySymbol} /></span>
            </div>
             <div className="flex justify-between text-sm text-gray-400">
                <span>رسوم التوصيل:</span>
                <span>عند الاستلام</span>
            </div>
             <div className="flex justify-between font-bold text-lg text-primary pt-2 border-t border-border-dark mt-2">
                <span>الإجمالي:</span>
                <span className="flex items-center gap-1">{totalPrice.toFixed(2)} <CurrencyDisplay imageUrl={currencyImageUrl} symbol={currencySymbol} /></span>
            </div>
       </div>

       <Separator className="my-6 bg-border-dark" />
       
       <div className="text-center text-gray-400 text-xs space-y-4">
            <p>شكرًا لتسوقك مع عدسات بتول!</p>
            {websiteBarcodeImageUrl && (
                <div className="flex justify-center">
                    <Image src={websiteBarcodeImageUrl} alt="Website Barcode" width={80} height={80} className="object-contain" />
                </div>
            )}
            <p>نظرة جديدة لعالمك.</p>
       </div>

    </div>
  );
});

Invoice.displayName = 'Invoice';
