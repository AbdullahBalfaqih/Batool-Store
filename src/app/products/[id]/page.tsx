'use client';
import { useState, useEffect, useCallback, use } from 'react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ProductDetails } from '@/components/sections/product-details';
import { HowToWear } from '@/components/sections/how-to-wear';
import { Skeleton } from '@/components/ui/skeleton';
import { useSupabase } from '@/lib/supabase/provider';
import { RelatedProducts } from '@/components/sections/related-products';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/hooks/use-localization';

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image_url: string;
  lens_image_url?: string;
  category: 'عدسات تجميلية' | 'عدسات طبيه' | 'نظارات شمسية';
  measurements?: string[];
  usage?: string;
  brand?: string;
  diameter?: number;
  baseCurve?: number;
  type?: string;
  description?: string;
};

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addItem, setIsCartOpen } = useCart();
  const { toast } = useToast();
  const { supabase } = useSupabase();
  const { rate, currencySymbol, currency } = useLocalization();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'no-power' | 'power'>('power');
  const [differentPower, setDifferentPower] = useState(true);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [currencyImageUrl, setCurrencyImageUrl] = useState<string>('');
  
  const [quantity, setQuantity] = useState(1);
  const [quantityRight, setQuantityRight] = useState(1);
  const [quantityLeft, setQuantityLeft] = useState(1);
  
  const [totalPrice, setTotalPrice] = useState(0);

  const calculatePrice = useCallback(() => {
    if (!product) return 0;

    if (selectedTab === 'no-power') {
      return product.price * quantity * rate;
    }

    if (selectedTab === 'power') {
      if (differentPower) {
        return (product.price * quantityRight * rate) + (product.price * quantityLeft * rate);
      } else {
        return product.price * quantity * rate;
      }
    }
    return 0;
  }, [product, selectedTab, quantity, quantityRight, quantityLeft, differentPower, rate]);

  useEffect(() => {
    setTotalPrice(calculatePrice());
  }, [calculatePrice]);


   const fetchProduct = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error && error.code !== 'PGRST116') throw error;
      
      if(data) {
        const foundProduct = data as Product;
        setProduct(foundProduct);
        setMainImage(foundProduct.image_url);
        setTotalPrice(foundProduct.price * rate);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [id, supabase, rate]);

  const fetchSettings = useCallback(async () => {
    try {
        const { data, error } = await supabase.from('site_settings').select('currency_image_url').single();
        if (error && error.code !== 'PGRST116') throw error;
        if(data) {
            setCurrencyImageUrl(data.currency_image_url);
        }
    } catch (error) {
        console.error("Failed to fetch currency settings", error);
    }
  }, [supabase]);

  useEffect(() => {
      fetchProduct();
      fetchSettings();
  }, [fetchProduct, fetchSettings]);

  const handleAddToCart = () => {
      if (!product) return;
      const totalQuantity = selectedTab === 'no-power' 
          ? quantity 
          : differentPower ? quantityLeft + quantityRight : quantity;
      
      addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: totalQuantity,
          originalPrice: product.originalPrice
      });

      toast({
          title: "تمت الإضافة للسلة!",
          description: `تمت إضافة ${product.name} إلى سلة التسوق.`,
      });
      setIsCartOpen(true);
  }

  if (isLoading) {
    return <div className="bg-background-light w-full min-h-screen pt-28">
        <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col gap-8">
                    <div className="max-w-md mx-auto w-full">
                        <div className="flex flex-col-reverse md:flex-row-reverse gap-4">
                            <div className="flex md:flex-col gap-2">
                                <Skeleton className="w-20 h-20 rounded-full" />
                            </div>
                            <Skeleton className="flex-1 aspect-square rounded-lg" />
                        </div>
                    </div>
                </div>
                <div className="lg:sticky top-28 flex flex-col gap-6">
                    <Skeleton className="h-10 w-3/4" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-8 w-20" />
                    </div>
                    <Skeleton className="h-6 w-1/2" />
                    <div>
                         <Skeleton className="h-6 w-20 mb-2" />
                         <div className="flex gap-2">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <Skeleton className="w-10 h-10 rounded-full" />
                         </div>
                    </div>
                    <Skeleton className="h-60 w-full rounded-lg" />
                    <Skeleton className="h-14 w-full rounded-lg" />
                </div>
            </div>
        </div>
    </div>;
  }

  if (!product) {
    return <div className="flex items-center justify-center h-screen text-brand-dark">المنتج غير موجود.</div>;
  }
  
  const powerOptions = product.measurements || [];
  
  const thumbnails = [product.image_url, product.lens_image_url].filter(Boolean) as string[];

  const PurchaseOptions = () => (
    <div className="flex flex-col gap-6 w-full max-w-full">
        <h1 className="text-3xl font-bold text-brand-dark">{product.name}</h1>

        <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-primary flex items-center gap-1">
                {(product.price * rate).toFixed(2)}
                <span className="text-sm">{currencySymbol}</span>
            </span>
            {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through flex items-center gap-1">
                    {(product.originalPrice * rate).toFixed(2)}
                    <span className="text-xs">{currencySymbol}</span>
                </span>
            )}
        </div>

        <div className="text-sm text-gray-500">
            ادفع بواسطة <span className="font-bold text-gray-600">العمقي</span> أو <span className="font-bold text-gray-600">الكريمي</span>
        </div>

        <p className="text-gray-700">{product.description}</p>

        {(product.category === 'عدسات تجميلية' || product.category === 'عدسات طبيه') && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <div className="bg-gray-100 rounded-full p-1 grid grid-cols-2">
                    <button
                        className={`text-center py-2 rounded-full text-sm font-medium transition-colors ${selectedTab === 'power' ? 'bg-white text-brand-dark shadow' : 'bg-transparent text-gray-500 hover:bg-gray-200'}`}
                        onClick={() => setSelectedTab('power')}
                    >
                        قياس النظر
                    </button>
                    <button
                        className={`text-center py-2 rounded-full text-sm font-medium transition-colors ${selectedTab === 'no-power' ? 'bg-white text-brand-dark shadow' : 'bg-transparent text-gray-500 hover:bg-gray-200'}`}
                        onClick={() => setSelectedTab('no-power')}
                    >
                        بدون قياس النظر
                    </button>
                </div>

                {selectedTab === 'no-power' && (
                    <div className="pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
                        <Select value={String(quantity)} onValueChange={(val) => setQuantity(Number(val))}>
                            <SelectTrigger className="w-full bg-gray-50 border-gray-300 h-10 text-brand-dark">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-brand-dark border-gray-300">
                                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {selectedTab === 'power' && (
                    <div className="pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <label htmlFor="different-power" className="text-sm font-medium text-gray-700">قياس مختلف لكل عين</label>
                            <Switch id="different-power" checked={differentPower} onCheckedChange={setDifferentPower} />
                        </div>

                        {!differentPower && (
                            <div className="flex flex-col sm:flex-row items-end gap-4">
                                <div className="w-full flex-1">
                                    <label className="block text-sm font-medium mb-1 text-gray-700">درجة النظر</label>
                                    <Select defaultValue={powerOptions[0]}>
                                        <SelectTrigger className="w-full bg-gray-50 text-brand-dark border-gray-300 h-10"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-white text-brand-dark border-gray-300">
                                            {powerOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-full sm:w-28 mt-2 sm:mt-0">
                                    <label className="block text-sm font-medium mb-1 text-gray-700">الكمية</label>
                                    <Select value={String(quantity)} onValueChange={(val) => setQuantity(Number(val))}>
                                        <SelectTrigger className="w-full bg-gray-50 border-gray-300 h-10 text-brand-dark">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white text-brand-dark border-gray-300">
                                            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {differentPower && (
                             <div className="space-y-6">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">العين اليمنى (OD)</p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">درجة النظر</label>
                                            <Select>
                                                <SelectTrigger className="w-full bg-gray-50 text-brand-dark border-gray-300 h-10"><SelectValue placeholder="اختر درجة النظر" /></SelectTrigger>
                                                <SelectContent className="bg-white text-brand-dark border-gray-300">
                                                    {powerOptions.map(p => <SelectItem key={`right-${p}`} value={p}>{p}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">الكمية</label>
                                            <Select value={String(quantityRight)} onValueChange={(val) => setQuantityRight(Number(val))}>
                                                <SelectTrigger className="w-full bg-gray-50 text-brand-dark border-gray-300 h-10"><SelectValue /></SelectTrigger>
                                                <SelectContent className="bg-white text-brand-dark border-gray-300">
                                                    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <SelectItem key={`right-qty-${n}`} value={String(n)}>{n}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">العين اليسرى (OS)</p>
                                    <div className="space-y-4">
                                       <div>
                                            <label className="text-xs text-gray-500 mb-1 block">درجة النظر</label>
                                            <Select>
                                                <SelectTrigger className="w-full bg-gray-50 text-brand-dark border-gray-300 h-10"><SelectValue placeholder="اختر درجة النظر" /></SelectTrigger>
                                                <SelectContent className="bg-white text-brand-dark border-gray-300">
                                                    {powerOptions.map(p => <SelectItem key={`left-${p}`} value={p}>{p}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">الكمية</label>
                                            <Select value={String(quantityLeft)} onValueChange={(val) => setQuantityLeft(Number(val))}>
                                                <SelectTrigger className="w-full bg-gray-50 text-brand-dark border-gray-300 h-10"><SelectValue /></SelectTrigger>
                                                <SelectContent className="bg-white text-brand-dark border-gray-300">
                                                    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <SelectItem key={`left-qty-${n}`} value={String(n)}>{n}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

        <div className="mt-6 w-full">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
                <button className="flex-1 cartBtn" onClick={handleAddToCart}>
                    <p className="text">أضف إلى السلة</p>
                    <span className="iconContainer">
                        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512" className="cart-icon"><path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" fill="#fff"></path></svg>
                    </span>
                    <p className="price">
                        {totalPrice.toFixed(2)}
                        <span className="text-xs ml-1">{currencySymbol}</span>
                    </p>
                </button>
            </div>
        </div>
    </div>
);


  return (
    <>
    <div className="bg-background-light text-brand-dark font-arabic overflow-x-hidden" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="text-sm text-gray-500 mb-4 pt-28">
          <span>الصفحة الرئيسية</span> / <span>{product.category}</span> / <span>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          <div className="flex flex-col gap-8 w-full max-w-full">
             <div className="max-w-md mx-auto w-full">
                <div className="flex flex-col-reverse md:flex-row-reverse gap-4">
                    <div className="flex overflow-x-auto md:flex-col gap-2 no-scrollbar max-w-full">
                        {thumbnails.map((thumbUrl, index) => (
                           <div 
                                key={index}
                                className={`w-16 sm:w-20 h-16 sm:h-20 flex-shrink-0 rounded-lg border-2 ${mainImage === thumbUrl ? 'border-primary' : 'border-gray-300'} overflow-hidden cursor-pointer`}
                                onClick={() => setMainImage(thumbUrl)}
                            >
                                <Image src={thumbUrl} alt={`Thumbnail ${index + 1}`} width={80} height={80} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    <div className="flex-1 aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <Image priority src={mainImage || product.image_url} alt={product.name} width={600} height={600} className="w-full h-full object-cover" data-ai-hint="gray eye" />
                    </div>
                </div>
            </div>

            <div className="lg:hidden">
              <PurchaseOptions />
            </div>

            <ProductDetails product={product} />
            <HowToWear />
          </div>

          <div className="hidden lg:block lg:sticky top-28">
            <PurchaseOptions />
          </div>

        </div>
        
        {product && <RelatedProducts currentProductId={product.id} category={product.category} />}

      </div>
    </div>
    </>
  );
}
