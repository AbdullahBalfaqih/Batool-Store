'use client';
import React, { useState, useEffect } from 'react';
import { LENS_COLORS } from '@/lib/constants';
import type { MousePosition, LensColor } from '@/lib/types';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { Users } from "lucide-react";
import Image from 'next/image';

const rotatingWords = [
    "الطبـــيعي", "الفـــطري", "الحـــقيقي", "الأصـــيل", "العـــفوي", "النـــقي", "البـــسيط", "الربـــاني", "الصـــافي", "الفـــريد", "المـــتفرّد", "الهـــادئ", "غير المتكلف", "على سجيّتك",
];

const Hero: React.FC = () => {
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });
  const [activeLens, setActiveLens] = useState<LensColor>(LENS_COLORS[0]);
  const [scrollY, setScrollY] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prevIndex) => (prevIndex + 1) % rotatingWords.length);
    }, 2500); // Change word every 2.5 seconds
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      setMousePos({ x, y });
    };
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const contentParallax = `translate3d(0, ${-scrollY * 0.12}px, 0)`;
  const eyeMoveX = mousePos.x * 18;
  const eyeMoveY = mousePos.y * 10;
  const irisMoveX = mousePos.x * 22;
  const irisMoveY = mousePos.y * 14;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-20">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-50 rounded-full blur-[180px]" style={{ transform: `translate(${-mousePos.x * 60}px, ${-mousePos.y * 60}px)` }} />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[180px]" style={{ transform: `translate(${mousePos.x * 60}px, ${mousePos.y * 60}px)` }} />
      </div>

      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">
        
        <div className="space-y-12 animate-fade-in text-right" style={{ transform: contentParallax }}>
                  <div className="space-y-6">
                      <br />
                      <h2 className="text-primary font-bold text-lg mb-2">عدسات بتول • رؤية جديدة</h2>
            <h1 className="text-6xl md:text-[5.5rem] text-[#1A1A1A] palestine-font leading-[1.1]">
              جـــمـالــك
              <br /> 
              <AnimatePresence mode="wait">
                <motion.span
                    key={wordIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-primary inline-block"
                >
                    {rotatingWords[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </h1>
            <p className="text-[#555] text-xl max-w-lg leading-relaxed almarai-regular">
             اكتشفي تشكيلتنا الواسعة من العدسات اللاصقة المصممة لتعزيز جمالك الطبيعي. جودة عالية، راحة تدوم، وألوان ساحرة تناسب كل إطلالة.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href="/products" passHref>
                <button className="px-10 py-4 bg-[#1A1A1A] text-white rounded-full almarai-bold hover:bg-primary transition-all duration-500 shadow-xl text-md">
                تسوقي الآن
                </button>
            </Link>
          </div>
          
          <div className="flex items-center space-x-reverse space-x-4 opacity-70">
                      <div className="flex">
                          <div className="w-11 h-11   border-2 border-white  flex items-center justify-center shadow-sm">
                              <Image
                                  src="/yemen.png" // الرابط من مجلد public
                                  alt="Yemen"
                                  width={96}      // حجم الصورة داخل الدائرة
                                  height={96}
                                   
                              />
                          </div>
                      </div>
            <p className="text-sm almarai-bold">يثق بنا أكثر من ٥,٠٠٠ عميلة حول الجمهورية اليمنية</p>
          </div>
        </div>

        <div className="relative flex flex-col justify-center items-center gap-8">
                  <div className="relative w-full max-w-sm md:max-w-[620px] aspect-[1.8/1]">
            <div className="absolute inset-0 bg-[#fffdfa] rounded-[55%_45%_55%_45%_/_50%_50%_50%_50%] eye-shadow-inner overflow-hidden border-[12px] border-white/75 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-red-100/10 via-transparent to-red-100/10 pointer-events-none" />
              <div className="absolute inset-0 transition-transform duration-[400ms] ease-out" style={{ transform: `translate(${eyeMoveX}px, ${eyeMoveY}px)` }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-[800ms] ease-out" style={{ transform: `translate(calc(-50% + ${irisMoveX}px), calc(-50% + ${irisMoveY}px))` }}>
                  <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-[inset_0_0_60px_rgba(0,0,0,0.5)]" style={{ backgroundColor: activeLens.color }}>
                    <div className="absolute inset-0 border-[12px] border-black/20 rounded-full blur-[2px]" />
                    <div className="absolute inset-0 iris-texture mix-blend-overlay opacity-60 scale-110" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 md:w-20 md:h-20 bg-[#020202] rounded-full shadow-2xl">
                       <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-white/10 rounded-full blur-[1px]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none z-10">
                 <div className="absolute top-[28%] left-[32%] w-10 h-6 bg-white/40 rounded-full blur-[3px] rotate-[-25deg]" />
                 <div className="absolute bottom-[20%] right-[30%] w-24 h-12 bg-white/10 rounded-full blur-xl rotate-[15deg]" />
              </div>
              
              <div className="absolute inset-0 pointer-events-none z-20">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-[#fffdfa] lid-top transform -translate-y-full border-b border-black/5 shadow-sm animate-blink-top"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#fffdfa] lid-bottom transform translate-y-full border-t border-black/5 shadow-sm animate-blink-bottom"></div>
              </div>
            </div>

                      <div className="absolute -top-10 -left-4 md:-left-10 bg-white/95 backdrop-blur-md p-3 rounded-3xl shadow-2xl border border-white/50 flex items-center space-x-reverse space-x-3 animate-fade-in z-30">
                     
                          <div>
                              <p className="text-sm almarai-bold text-[#1A1A1A]">ترطيب وتنظيف وحماية</p>
                          </div>
                         
                          <video
                              src="https://cdn-icons-mp4.flaticon.com/512/10606/10606632.mp4"
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-16 h-16"
                          />
                          
                      </div>
          </div>
          <div className="w-full bg-white/80 backdrop-blur-xl px-4 sm:px-6 py-4 rounded-full shadow-lg border border-white/60 flex items-center justify-center space-x-reverse space-x-4 sm:space-x-6 z-40 max-w-sm sm:max-w-md mt-8">
            <span className="hidden sm:inline text-xs almarai-extrabold uppercase tracking-[0.2em] text-gray-400">لون العدسة</span>
            <div className="flex space-x-reverse space-x-3 sm:space-x-4">
              {LENS_COLORS.map((lens) => (
                <button key={lens.id} onClick={() => setActiveLens(lens)} className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-500 p-0.5 border-2 ${activeLens.id === lens.id ? 'border-primary scale-125' : 'border-transparent hover:scale-115'}`}>
                  <div className="w-full h-full rounded-full shadow-inner overflow-hidden" style={{ backgroundColor: lens.color }}>
                      <div className="absolute inset-0 bg-white/20 iris-texture opacity-30" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
export { Hero };
