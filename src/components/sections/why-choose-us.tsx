
'use client';
import { ScrollAnimationWrapper } from "../ui/scroll-animation-wrapper";
import MagicBento from '../ui/MagicBento';

export function WhyChooseUs() {
  return (
    <div className="w-full bg-background-light py-20" id="services">
      <div className="w-full max-w-[1200px] mx-auto px-4 flex flex-col items-center">
        <ScrollAnimationWrapper className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark leading-tight">لماذا يختار كبار المؤثرين عدسات بتول.</h2>
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper>
           <MagicBento 
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={12}
            glowColor="165, 82%, 53%"
          />
        </ScrollAnimationWrapper>
      </div>
    </div>
  );
}
