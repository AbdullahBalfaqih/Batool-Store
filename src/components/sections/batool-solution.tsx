
'use client';

import Image from 'next/image';
import { Button } from '../ui/button';
import { ScrollAnimationWrapper } from '../ui/scroll-animation-wrapper';
import Link from 'next/link';
import { useSupabase } from '@/lib/supabase/provider';
import { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '../ui/skeleton';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Droplets, ShieldCheck, Eye } from 'lucide-react';

const features = [
    {
        name: 'تنظيف عميق',
        description: 'يزيل البروتينات والترسبات بفعالية.',
        icon: (
            <video
                src="https://cdn-icons-mp4.flaticon.com/512/16678/16678435.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-16 h-16"
            />
        )
    },
    {
        name: 'ترطيب فائق',
        description: 'يحافظ على رطوبة العدسات لراحة تدوم.',
        icon: (
            <video
                src="https://cdn-icons-mp4.flaticon.com/512/10606/10606611.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-16 h-16"
            />
        )
    },
    {
        name: 'حماية متكاملة',
        description: 'يعقم ويحمي من الجراثيم والبكتيريا.',
        icon: (
            <video
                src="https://cdn-icons-mp4.flaticon.com/512/10606/10606632.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-16 h-16"
            />
        )
    },
    {
        name: 'آمن على العيون',
        description: 'تركيبة لطيفة تناسب العيون الحساسة.',
        icon: (
            <video
                src="https://cdn-icons-mp4.flaticon.com/512/10606/10606650.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-16 h-16"
            />
        )
    }
];

const CurrencyDisplay = ({
    imageUrl,
    size = 16, // الحجم الافتراضي
}: {
    imageUrl: string;
    size?: number;
}) => {
    if (imageUrl) {
        return (
            <Image
                src={imageUrl}
                alt="currency"
                width={size}
                height={size}
                className="inline-block"
            />
        );
    }
    return <span className="text-sm">ر.س</span>;
};


export function BatoolSolution() {
    const [settings, setSettings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { supabase } = useSupabase();
    const { addItem, setIsCartOpen } = useCart();
    const { toast } = useToast();

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from('site_settings').select('solution_image_url, solution_price, solution_original_price, currency_image_url').single();
            if (error && error.code !== 'PGRST116') throw error;
            setSettings(data);
        } catch (error) {
            console.error("Failed to fetch solution settings:", error);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleAddToCart = () => {
        if (!settings || !settings.solution_price) return;

        // A "solution" product should be added to the products table for this to work properly,
        // but for now, we'll create a cart item on the fly.
        const solutionProduct = {
            id: 'solution-product-id', // Static ID for the solution
            name: 'محلول بتول للعناية الكاملة',
            price: settings.solution_price,
            originalPrice: settings.solution_original_price,
            image_url: settings.solution_image_url,
            quantity: 1,
        };

        addItem(solutionProduct);
        toast({
            title: "تمت الإضافة للسلة!",
            description: `تمت إضافة ${solutionProduct.name} إلى سلة التسوق.`,
        });
        setIsCartOpen(true);
    };

    if (isLoading) {
        return (
            <section className="w-full bg-background-light py-20 font-arabic">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <Skeleton className="w-full max-w-md aspect-square  mx-auto" />
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-5/6" />
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                <Skeleton className="h-24 w-full  " />
                                <Skeleton className="h-24 w-full rounded-lg" />
                                <Skeleton className="h-24 w-full rounded-lg" />
                                <Skeleton className="h-24 w-full rounded-lg" />
                            </div>
                            <Skeleton className="h-12 w-40 mt-4" />
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    if (!settings || !settings.solution_image_url) {
        return null; // Don't render the section if there's no data
    }
    
    const { solution_image_url, solution_price, solution_original_price, currency_image_url } = settings;

    return (
        <section className="w-full bg-background-light py-20 font-arabic">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <ScrollAnimationWrapper className="flex justify-center">
                        <div className="relative w-full max-w-2xl aspect-square overflow-visible">
                            <div className="absolute inset-8 bg-blue-100/30 rounded-full blur-3xl"></div>
                            <Image
                                src={solution_image_url}
                                alt="محلول عدسات بتول"
                                width={800}
                                height={800}
                                className="relative z-10 w-full h-full object-contain drop-shadow-xl transition-transform duration-700 ease-out transform hover:scale-110"
                                data-ai-hint="lens solution bottle"
                            />
                        </div>
                    </ScrollAnimationWrapper>

                    <ScrollAnimationWrapper className="text-right">
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-dark leading-tight mb-4">
                            محلول بتول للعناية الكاملة
                        </h2>
                        <p className="text-gray-600 text-lg mb-6 max-w-lg">
                            حافظ على عدساتك اللاصقة بأفضل حال مع محلول بتول. تركيبة متطورة توفر تنظيفًا وتعقيمًا فائقًا مع الحفاظ على أقصى درجات الراحة لعينيك.
                        </p>
                         <div className="flex items-baseline gap-4 mb-8">
                            {solution_price && (
                                <span className="text-3xl font-bold text-primary flex items-center gap-1">
                                    {Number(solution_price).toFixed(2)} <CurrencyDisplay imageUrl={currency_image_url} />
                                </span>
                            )}
                            {solution_original_price && (
                                <span className="text-xl text-gray-400 line-through flex items-center gap-1">
                                    {Number(solution_original_price).toFixed(2)} <CurrencyDisplay imageUrl={currency_image_url} />
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-white/60 border  ">
                                    <div className="flex-shrink-0  ">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-brand-dark">{feature.name}</h3>
                                        <p className="text-sm text-gray-500">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button 
                            size="lg" 
                            className="bg-primary text-white hover:bg-primary/90 transition-colors duration-300 w-full sm:w-auto text-base font-bold shadow-lg shadow-primary/20"
                            onClick={handleAddToCart}
                            disabled={!solution_price}
                        >
                            أضف للسلة
                        </Button>
                    </ScrollAnimationWrapper>
                </div>
            </div>
        </section>
    );
}
