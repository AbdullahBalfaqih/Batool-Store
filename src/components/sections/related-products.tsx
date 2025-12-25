'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollAnimationWrapper } from '../ui/scroll-animation-wrapper';
import { Skeleton } from '@/components/ui/skeleton';
import { useSupabase } from '@/lib/supabase/provider';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/hooks/use-localization';

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
    <div className="snap-center shrink-0 w-[320px] flex flex-col gap-3 bg-white rounded-lg overflow-hidden shadow-lg border border-gray-100">
        <Skeleton className="w-full h-80" />
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

export function RelatedProducts({ currentProductId, category }: { currentProductId: string, category: Product['category'] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { supabase } = useSupabase();
  const { addItem, setIsCartOpen } = useCart();
  const { toast } = useToast();
  const { rate, currencySymbol } = useLocalization();

   const handleAddToCart = (e: React.MouseEvent, product: Product) => {
      e.preventDefault();
      e.stopPropagation();
      addItem({ ...product, quantity: 1 });
      toast({
        title: 'تمت الإضافة للسلة!',
        description: `تمت إضافة ${product.name} إلى سلة التسوق.`,
      });
      setIsCartOpen(true);
  }

  const fetchProductsAndSettings = useCallback(async () => {
    setIsLoading(true);
    try {
        const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .eq('category', category)
            .not('id', 'eq', currentProductId)
            .limit(6);

        if (productsError) throw productsError;
        setProducts(productsData as Product[]);

    } catch (error: any) {
        console.error(`Error fetching related products:`, error);
    } finally {
        setIsLoading(false);
    }
  }, [category, currentProductId, supabase]);

  useEffect(() => {
      fetchProductsAndSettings();
  }, [fetchProductsAndSettings]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) {
      return (
          <div className="w-full py-12">
               <ScrollAnimationWrapper className="flex flex-col md:flex-row justify-between md:items-end px-4 gap-4 mb-6">
                    <h3 className="text-brand-dark text-2xl md:text-3xl font-bold">منتجات أخرى قد تعجبك</h3>
                </ScrollAnimationWrapper>
                <div className="relative">
                    <div className="flex gap-6 overflow-x-hidden pb-8 px-4">
                        {Array.from({ length: 3 }).map((_, index) => <ProductCardSkeleton key={index} />)}
                    </div>
                </div>
          </div>
      )
  }

  if (products.length === 0) return null;

  return (
    <div className="w-full py-12">
        <ScrollAnimationWrapper className="flex flex-col md:flex-row justify-between md:items-end px-4 gap-4 mb-6">
            <h3 className="text-brand-dark text-2xl md:text-3xl font-bold">منتجات أخرى قد تعجبك</h3>
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper className="relative">
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8 px-4 snap-x" ref={scrollContainerRef}>
              {products.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} passHref>
                  <div 
                    className="snap-center shrink-0 w-[320px] flex flex-col gap-3 group cursor-pointer bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
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
                        <p className="text-gray-500 text-xs">{product.brand}</p>
                        <h4 className="text-brand-dark text-sm font-bold truncate">{product.name}</h4>
                      </div>
                      <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                              <p className="text-primary font-bold text-lg flex items-center gap-1">
                                {(product.price * rate).toFixed(2)}
                                <span className="text-xs">{currencySymbol}</span>
                                </p>
                              {product.originalPrice && <p className="text-gray-400 line-through text-sm flex items-center gap-1">
                                {(product.originalPrice * rate).toFixed(2)}
                                <span className="text-xs">{currencySymbol}</span>
                                </p>}
                          </div>
                          <button onClick={(e) => handleAddToCart(e, product)} className="size-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-colors">
                              <ShoppingBag size={16} />
                          </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
             {products.length > 3 && (
              <>
                 <div className="absolute top-1/2 -translate-y-1/2 -right-4 size-10 bg-white/80 backdrop-blur-sm rounded-full items-center justify-center cursor-pointer hover:bg-white transition-colors shadow-md md:flex hidden" onClick={() => scroll('right')}>
                    <span className="material-symbols-outlined text-brand-dark">chevron_right</span>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 -left-4 size-10 bg-white/80 backdrop-blur-sm rounded-full items-center justify-center cursor-pointer hover:bg-white transition-colors shadow-md md:flex hidden" onClick={() => scroll('left')}>
                    <span className="material-symbols-outlined text-brand-dark">chevron_left</span>
                </div>
              </>
            )}
        </ScrollAnimationWrapper>
    </div>
  );
};
