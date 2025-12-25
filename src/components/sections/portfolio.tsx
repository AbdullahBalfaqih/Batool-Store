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
};

const categories = [
    {
        title: 'عدسات تجميلية',
        name: 'عدسات تجميلية',
        image: '/categories/cosmetic.jpg',
    },
    {
        title: 'عدسات طبيه',
        name: 'عدسات طبيه',
        image: '/categories/medical.jpg',
    },
    {
        title: 'نظارات شمسية',
        name: 'نظارات شمسية',
        image: '/categories/sunglasses.jpg',
    },
] as const;

/* ---------------- Skeleton ---------------- */

const ProductCardSkeleton = () => (
    <div className="snap-center shrink-0 w-[320px] bg-white rounded-lg shadow-md border">
        <Skeleton className="w-full h-80" />
        <div className="p-4 space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-8 w-24" />
        </div>
    </div>
);

/* ---------------- Product Row ---------------- */

const ProductRow = ({
    category,
}: {
    category: {
        title: string;
        name: typeof categories[number]['name'];
        image: string;
    };
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { supabase } = useSupabase();
    const { addItem, setIsCartOpen } = useCart();
    const { toast } = useToast();
    const { rate, currencySymbol, currencyImageUrl } = useLocalization();

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('category', category.name)
            .limit(10);

        if (!error) setProducts(data as Product[]);
        setIsLoading(false);
    }, [category.name, supabase]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        addItem({ ...product, quantity: 1 });
        toast({ title: 'تمت الإضافة للسلة' });
        setIsCartOpen(true);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex gap-6 overflow-x-hidden px-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (!products.length) return null;

    return (
        <div className="w-full space-y-8">

            {/* صورة القسم */}
            <ScrollAnimationWrapper>
                <div className="relative h-[280px] md:h-[300px] rounded-2xl overflow-hidden">
                    <Image
                        src={category.image}
                        alt={category.title}
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h2 className="text-white text-3xl md:text-4xl font-bold drop-shadow-lg">
                            {category.title}
                        </h2>
                    </div>
                </div>
            </ScrollAnimationWrapper>

            {/* المنتجات */}
            <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto no-scrollbar px-4 snap-x"
            >
                {products.map((product) => (
                    <Link key={product.id} href={`/products/${product.id}`}>
                        <div className="snap-center w-[320px] bg-white rounded-lg shadow-md hover:shadow-xl transition">
                            <div className="relative aspect-square">
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="p-4 space-y-3">
                                <h4 className="font-bold truncate">{product.name}</h4>

                                <div className="flex justify-between items-center">
                                    <p className="text-primary font-bold flex items-center gap-1">
                                        {(product.price * rate).toFixed(2)}
                                        {currencyImageUrl && rate === 1 ? (
                                            <Image src={currencyImageUrl} alt="currency" width={14} height={14} />
                                        ) : (
                                            currencySymbol
                                        )}
                                    </p>

                                    <button
                                        onClick={(e) => handleAddToCart(e, product)}
                                        className="size-8 rounded-full border flex items-center justify-center hover:bg-primary hover:text-white"
                                    >
                                        <ShoppingBag size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

/* ---------------- Main Component ---------------- */

export function ExclusiveProductsGallery() {
    return (
        <section className="bg-background-light py-20 font-arabic" id="work">
            <div className="max-w-[1200px] mx-auto px-4 space-y-20">

                {categories.map((cat) => (
                    <ProductRow key={cat.name} category={cat} />
                ))}

                {/* الفيديو مرة واحدة فقط */}
                <div className="flex justify-center pt-10">
                    <video
                        src="/videos/video1.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full max-w-5xl rounded-xl shadow-lg object-cover"
                    />
                </div>

            </div>
        </section>
    );
}

export { ExclusiveProductsGallery as Portfolio };
