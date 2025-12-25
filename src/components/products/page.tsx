
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useSupabase } from '@/lib/supabase/provider';
import { Search, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image_url: string;
  category: 'عدسات تجميلية' | 'عدسات طبيه' | 'نظارات شمسية';
  brand?: string;
  description?: string;
};

const ProductCardSkeleton = () => (
    <div className="flex flex-col gap-3 bg-surface-dark rounded-lg overflow-hidden shadow-lg">
        <Skeleton className="w-full aspect-square" />
        <div className="flex flex-col p-4 gap-4">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-5 w-3/4" />
            </div>
            <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="size-8 rounded-full" />
            </div>
        </div>
    </div>
);

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get('category') as Product['category'] | null;
  const initialSearchTerm = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [currencyImageUrl, setCurrencyImageUrl] = useState<string>('');
  const { supabase } = useSupabase();
  const { addItem, setIsCartOpen } = useCart();
  const { toast } = useToast();

   const handleAddToCart = (e: React.MouseEvent, product: Product) => {
      e.preventDefault();
      e.stopPropagation();
      addItem({ ...product, quantity: 1 });
      toast({
        title: 'تمت الإضافة للسلة!',
        description: `تمت إضافة ${product.name} إلى سلة التسوق.`,
        variant: 'default',
      });
      setIsCartOpen(true);
  }

  useEffect(() => {
    const fetchProductsAndSettings = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from('products').select('*');
        
        if (category) {
            query = query.eq('category', category);
        }

        const { data: productsData, error: productsError } = await query;

        if (productsError) throw productsError;
        setProducts(productsData as Product[]);

        const { data: settingsData, error: settingsError } = await supabase.from('site_settings').select('*').single();
        if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
        if(settingsData) {
            setCurrencyImageUrl(settingsData.currency_image_url);
        }

      } catch (error: any) {
        console.error(`Error fetching data:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductsAndSettings();
  }, [category, supabase]);
  
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSearchTerm = e.target.value;
      setSearchTerm(newSearchTerm);
      const params = new URLSearchParams(window.location.search);
      if (newSearchTerm) {
          params.set('q', newSearchTerm);
      } else {
          params.delete('q');
      }
      router.replace(`${window.location.pathname}?${params.toString()}`);
  }

  return (
    <div className="bg-background-dark text-white w-full min-h-screen pt-28 font-arabic" dir="rtl">
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-bold text-primary">{category || 'جميع المنتجات'}</h1>
                <div className="relative w-full md:w-72">
                    <Input 
                        type="text"
                        placeholder="ابحث عن منتج..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="bg-surface-dark border-border-dark rounded-full h-12 pr-12 text-base"
                    />
                     <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {isLoading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)}
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                         <Link key={product.id} href={`/products/${product.id}`} passHref>
                          <div 
                            className="snap-center shrink-0 w-full flex flex-col gap-3 group cursor-pointer bg-surface-dark rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2"
                          >
                            <div className="w-full aspect-square overflow-hidden relative">
                              <Image
                                alt={product.name}
                                className="w-full h-full object-cover"
                                src={product.image_url}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                data-ai-hint="beautiful eyes colored lenses"
                              />
                              {product.originalPrice && product.price < product.originalPrice && (
                                <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-red-600 text-white text-xs font-bold">
                                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col p-4 gap-4">
                              <div className="flex flex-col text-right">
                                <p className="text-gray-400 text-xs">{product.brand}</p>
                                <h4 className="text-white text-sm font-bold truncate">{product.name}</h4>
                              </div>
                              <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                      <p className="text-primary font-bold text-lg flex items-center gap-1">
                                        {product.price}
                                        {currencyImageUrl ? <Image src={currencyImageUrl} alt="currency" width={16} height={16} style={{ width: 'auto', height: 'auto' }} /> : 'ر.س'}
                                        </p>
                                      {product.originalPrice && <p className="text-gray-500 line-through text-sm flex items-center gap-1">
                                        {product.originalPrice}
                                        {currencyImageUrl ? <Image src={currencyImageUrl} alt="currency" width={12} height={12} className="opacity-70" style={{ width: 'auto', height: 'auto' }} /> : 'ر.س'}
                                        </p>}
                                  </div>
                                  <button onClick={(e) => handleAddToCart(e, product)} className="size-8 rounded-full border border-gray-700 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-black transition-colors">
                                      <ShoppingBag size={16} />
                                  </button>
                              </div>
                            </div>
                          </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-xl text-gray-400">لا توجد منتجات تطابق بحثك في هذا التصنيف.</p>
                </div>
            )}
        </div>
    </div>
  );
}


export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="bg-background-dark min-h-screen"></div>}>
            <ProductsPageContent />
        </Suspense>
    )
}
