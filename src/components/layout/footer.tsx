'use client';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useSupabase } from '@/lib/supabase/provider';

export function Footer() {
  const [footerImageUrl, setFooterImageUrl] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const { supabase } = useSupabase();


  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('footer_image_url').single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setFooterImageUrl(data.footer_image_url || '');
      }
    } catch (error) {
      console.error('Failed to fetch footer image:', error);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSettings();
    setIsMounted(true);
  }, [fetchSettings]);

  return (
    <footer 
        className="relative w-full overflow-hidden bg-background-dark" 
        dir="rtl"
    >
        {/* Glowing Line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-white/20 [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]"></div>

        {/* Background sketch image */}
        {footerImageUrl && (
            <div 
                className="absolute inset-0 pointer-events-none bg-cover bg-center"
                style={{ 
                    backgroundImage: `url(${footerImageUrl})`,
                    opacity: 0.25,
                    mixBlendMode: 'screen',
                    filter: 'grayscale(100%)'
                }}
            ></div>
        )}

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 pt-20 pb-10 flex flex-col">
            <div className='flex flex-col gap-20'>
                {/* Top section: Content and Newsletter */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    
                    {/* Info and text (7 columns) */}
                    <div className="lg:col-span-7 flex flex-col gap-16">
                        <p className="text-2xl font-light leading-snug text-white/90 max-w-2xl">
                            اكتشف مجموعتنا من العدسات اللاصقة الملونة الفاخرة، المصممة للراحة والأناقة ومنظور جديد. من العدسات اليومية إلى التصاميم الجريئة، رؤيتك هي إلهامنا.
                        </p>

                        {/* Info grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                            {/* Phone */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 text-sm tracking-wider text-white/60 uppercase">
                                    <svg className="w-4 h-4 text-[rgb(255,250,235)]" viewBox="0 0 256 256" fill="currentColor"><path d="M220.78,162.13,173.56,141A12,12,0,0,0,162.18,142a3.37,3.37,0,0,0-.38.28L137,163.42a3.93,3.93,0,0,1-3.7.21c-16.24-7.84-33.05-24.52-40.89-40.57a3.9,3.9,0,0,1,.18-3.69l21.2-25.21c.1-.12.19-.25.28-.38a12,12,0,0,0,1-11.36L93.9,35.28a12,12,0,0,0-12.48-7.19A52.25,52.25,0,0,0,36,80c0,77.2,62.8,140,140,140a52.25,52.25,0,0,0,51.91-45.42A12,12,0,0,0,220.78,162.13ZM220,173.58A44.23,44.23,0,0,1,176,212C103.22,212,44,152.78,44,80A44.23,44.23,0,0,1,82.42,36a3.87,3.87,0,0,1,.48,0,4,4,0,0,1,3.67,2.49l21.11,47.14a4,4,0,0,1-.23,3.6l-21.19,25.2c-.1.13-.2.25-.29.39a12,12,0,0,0-.78,11.75c8.69,17.79,26.61,35.58,44.6,44.27a12,12,0,0,0,11.79-.87l.37-.28,24.83-21.12a3.93,3.93,0,0,1,3.57-.27l47.21,21.16A4,4,0,0,1,220,173.58Z"></path></svg>
                                    <span>الهاتف</span>
                                </div>
                                <div className="flex flex-col gap-1 text-lg text-white">
                                    <a href="tel:+967771234567" dir="ltr">+967 770 256 068</a>
                                </div>
                            </div>
                            
                            {/* Email */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 text-sm tracking-wider text-white/60 uppercase">
                                    <svg className="w-4 h-4 text-[rgb(255,250,235)]" viewBox="0 0 256 256" fill="currentColor"><path d="M224,52H32a4,4,0,0,0-4,4V192a12,12,0,0,0,12,12H216a12,12,0,0,0,12-12V56A4,4,0,0,0,224,52Zm-96,86.57L42.28,60H213.72ZM104.63,128,36,190.91V65.09Zm5.92,5.43L125.3,147a4,4,0,0,0,5.4,0l14.75-13.52L213.72,196H42.28ZM151.37,128,220,65.09V190.91Z"></path></svg>
                                    <span>البريد الإلكتروني</span>
                                </div>
                                <a href="mailto:hello@batoollenses.com" className="text-lg text-white underline decoration-blue-400/0 hover:decoration-blue-400 transition-all">hello@batoollenses.com</a>
                            </div>

                            {/* Address */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 text-sm tracking-wider text-white/60 uppercase">
                                    <svg className="w-4 h-4 text-[rgb(255,250,235)]" viewBox="0 0 256 256" fill="currentColor"><path d="M128,68a36,36,0,1,0,36,36A36,36,0,0,0,128,68Zm0,64a28,28,0,1,1,28-28A28,28,0,0,1,128,132Zm0-112a84.09,84.09,0,0,0-84,84c0,30.42,14.17,62.79,41,93.62a250,250,0,0,0,40.73,37.66,4,4,0,0,0,4.58,0A250,250,0,0,0,171,197.62c26.81-30.83,41-63.2,41-93.62A84.09,84.09,0,0,0,128,20Zm37.1,172.23A254.62,254.62,0,0,1,128,227a254.62,254.62,0,0,1-37.1-34.81C73.15,171.8,52,139.9,52,104a76,76,0,0,1,152,0C204,139.9,182.85,171.8,165.1,192.23Z"></path></svg>
                                    <span>العنوان</span>
                                </div>
                                <a href="#" className="text-lg text-white leading-relaxed">سيــئون، حضرموت،<br/> الجمهورية اليمنية</a>
                            </div>

                            {/* Hours */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 text-sm tracking-wider text-white/60 uppercase">
                                    <svg className="w-4 h-4 text-[rgb(255,250,235)]" viewBox="0 0 256 256" fill="currentColor"><path d="M128,28A100,100,0,1,0,228,128,100.11,100.11,0,0,0,128,28Zm0,192a92,92,0,1,1,92-92A92.1,92.1,0,0,1,128,220Zm60-92a4,4,0,0,1-4,4H128a4,4,0,0,1-4-4V72a4,4,0,0,1,8,0v52h52A4,4,0,0,1,188,128Z"></path></svg>
                                    <span>أوقات العمل</span>
                                </div>
                                <div className="text-lg text-white">
                                    <p>طـــــوال ايام الاســــــبوع</p>
                                   
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Newsletter (5 columns) */}
                    <div className="lg:col-span-5 pt-2">
                        <h3 className="text-xl text-[rgb(253,252,238)] mb-6">اشترك في النشرة البريدية</h3>
                        <form suppressHydrationWarning className="flex flex-col gap-3 max-w-md">
                            <input type="email" placeholder="example@email.com" required suppressHydrationWarning
                                className="input-field w-full h-14 px-4 rounded-lg outline-none focus:ring-1 focus:ring-white/20 transition-all text-right" />
                            <button type="submit" 
                                className="relative inline-flex text-lg h-14 items-center justify-center font-bold text-white bg-gradient-to-b from-primary to-blue-700 rounded-[14px] hover:from-primary/80 hover:to-blue-700/80 shadow-md transition-all hover:scale-105 w-full">
                                اشتراك
                            </button>
                        </form>
                    </div>
                </div>

                {/* Nav Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 mt-8">
                    <div>
                        <Link href="/" className="nav-link group">
                            <span className="text-xl">الرئيسية</span>
                            <svg className="w-6 h-6 transform -scale-x-100 group-hover:translate-x-[-0.25rem] group-hover:-translate-y-1 transition-transform" viewBox="0 0 256 256" fill="currentColor"><path d="M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z"></path></svg>
                        </Link>
                        <Link href="/#services" className="nav-link group">
                            <span className="text-xl">المميزات</span>
                            <svg className="w-6 h-6 transform -scale-x-100 group-hover:translate-x-[-0.25rem] group-hover:-translate-y-1 transition-transform" viewBox="0 0 256 256" fill="currentColor"><path d="M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z"></path></svg>
                        </Link>
                        
                    </div>
                    <div>
                    <Link href="/products" className="nav-link group">
                            <span className="text-xl">المنتجات</span>
                            <svg className="w-6 h-6 transform -scale-x-100 group-hover:translate-x-[-0.25rem] group-hover:-translate-y-1 transition-transform" viewBox="0 0 256 256" fill="currentColor"><path d="M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z"></path></svg>
                        </Link>
                        <Link href="/#reviews" className="nav-link group">
                            <span className="text-xl">آراء العملاء</span>
                            <svg className="w-6 h-6 transform -scale-x-100 group-hover:translate-x-[-0.25rem] group-hover:-translate-y-1 transition-transform" viewBox="0 0 256 256" fill="currentColor"><path d="M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z"></path></svg>
                        </Link>
                    
                    </div>
                </div>

                  {/* Social Links */}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6">
                    <a href="#" className="social-link group"><svg className="w-5 h-5" viewBox="0 0 256 256"><path className="fill-transparent stroke-white stroke-2 group-hover:fill-white transition-colors" d="M216,28H40A12,12,0,0,0,28,40V216a12,12,0,0,0,12,12H216a12,12,0,0,0,12-12V40A12,12,0,0,0,216,28Zm4,188a4,4,0,0,1-4,4H40a4,4,0,0,1-4-4V40a4,4,0,0,1,4-4H216a4,4,0,0,1,4,4ZM92,112v64a4,4,0,0,1-8,0V112a4,4,0,0,1,8,0Zm88,28v36a4,4,0,0,1-8,0V140a24,24,0,0,0-48,0v36a4,4,0,0,1-8,0V112a4,4,0,0,1,8,0v6.87A32,32,0,0,1,180,140ZM96,84a8,8,0,1,1-8-8A8,8,0,0,1,96,84Z"></path></svg><span>Linkedin</span></a>
                    <a href="#" className="social-link group"><svg className="w-5 h-5" viewBox="0 0 256 256"><path className="fill-transparent stroke-white stroke-2 group-hover:fill-white transition-colors" d="M128,28A100,100,0,1,0,228,128,100.11,100.11,0,0,0,128,28Zm4,191.91V148h28a4,4,0,0,0,0-8H132V112a20,20,0,0,1,20-20h16a4,4,0,0,0,0-8H152a28,28,0,0,0-28,28v28H96a4,4,0,0,0,0,8h28v71.91a92,92,0,1,1,8,0Z"></path></svg><span>Facebook</span></a>
                    <a href="#" className="social-link group"><svg className="w-5 h-5" viewBox="0 0 256 256"><path className="fill-transparent stroke-white stroke-2 group-hover:fill-white transition-colors" d="M211.37,213.85,147.13,112.9,211,42.69A4,4,0,0,0,205,37.31L142.68,105.9,99.38,37.85A4,4,0,0,0,96,36H48a4,4,0,0,0-3.37,6.15L108.87,143.1,45,213.31A4,4,0,1,0,51,218.69l62.36-68.59,43.3,68.05A4,4,0,0,0,160,220h48a4,4,0,0,0,3.37-6.15ZM162.2,212,55.29,44H93.8L200.71,212Z"></path></svg><span>Twitter/X</span></a>
                    <a href="#" className="social-link group"><svg className="w-5 h-5" viewBox="0 0 256 256"><path className="fill-transparent stroke-white stroke-2 group-hover:fill-white transition-colors" d="M162.22,124.67l-48-32A4,4,0,0,0,108,96v64a4,4,0,0,0,2.11,3.53,4,4,0,0,0,4.11-.2l48-32a4,4,0,0,0,0-6.66ZM116,152.53V103.47L152.79,128Zm114.46-82A20,20,0,0,0,218.4,56.85C184.6,43.79,130.27,44,128,44S71.4,43.79,37.6,56.85A20,20,0,0,0,25.54,70.52C23,80.27,20,98.16,20,128s3,47.73,5.54,57.48A20,20,0,0,0,37.6,199.15C71.4,212.21,125.73,212,128,212h.71c6.89,0,57.58-.43,89.72-12.85a20,20,0,0,0,12.06-13.67C233,175.72,236,157.84,236,128S233,80.27,230.46,70.52Zm-7.74,113a12,12,0,0,1-7.21,8.22C183.14,204.19,128.57,204,128,204s-55.11.19-87.48-12.31a12,12,0,0,1-7.21-8.22C30.87,174.17,28,157,28,128s2.87-46.17,5.28-55.47a12,12,0,0,1,7.21-8.22C72.86,51.81,127.43,52,128,52s55.11-.2,87.48,12.31a12,12,0,0,1,7.21,8.22C225.13,81.83,228,99,228,128S225.13,174.17,222.72,183.47Z"></path></svg><span>Youtube</span></a>
                    <a href="#" className="social-link group"><svg className="w-5 h-5" viewBox="0 0 256 256"><path className="fill-transparent stroke-white stroke-2 group-hover:fill-white transition-colors" d="M128,84a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,84Zm0,80a36,36,0,1,1,36-36A36,36,0,0,1,128,164ZM176,28H80A52.06,52.06,0,0,0,28,80v96a52.06,52.06,0,0,0,52,52h96a52.06,52.06,0,0,0,52-52V80A52.06,52.06,0,0,0,176,28Zm44,148a44.05,44.05,0,0,1-44,44H80a44.05,44.05,0,0,1-44-44V80A44.05,44.05,0,0,1,80,36h96a44.05,44.05,0,0,1,44,44ZM188,76a8,8,0,1,1-8-8A8,8,0,0,1,188,76Z"></path></svg><span>Instagram</span></a>
                  </div>

                  <br /> 
                  {isMounted && (

                      <div className="left-0 w-full h-full flex items-end justify-center pointer-events-none -z-0 opacity-80">
                          <span className="text-architect select-none text-[160px] leading-none">
                              Batool
                          </span>
                      </div>


                  )}
                {/* Bottom section: Copyright */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-16 pt-10 border-t border-white/10 text-white/50">
                    <p>&copy; {new Date().getFullYear()} عدسات بتول. جميع الحقوق محفوظة.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition">سياسة الخصوصية</a>
                          <a href="#" className="hover:text-white transition">شروط الاستخدام</a>
                    
                      </div>

                  </div>

            </div>
        </div>
        
       
          
    </footer>
  );
}
