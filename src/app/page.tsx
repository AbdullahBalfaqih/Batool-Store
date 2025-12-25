'use client';

import { Hero } from '@/components/sections/hero';
 import { ExclusiveProductsGallery as Portfolio } from '@/components/sections/portfolio';
import { WhyChooseUs } from '@/components/sections/why-choose-us';
import { Faq } from '@/components/sections/faq';
import { BatoolSolution } from '@/components/sections/batool-solution';

export default function Home() {
  return (
    <>
        <Hero />
         <Portfolio />
        <BatoolSolution />
        <WhyChooseUs />
        <Faq />
    </>
  );
}
