'use client';

import Image from "next/image";

const steps = [
    {
        title: 'تأكد من نظافة يديك لتجنب أي عدوى',
        description: ''
    },
    {
        title: 'جهز العدسة',
        description: 'امسك العدسة بطرف اصبعك'
    },
    {
        title: 'ضع العدسة على عينك',
        description: 'ثبت جفنك، ارفع عينك للأعلى، وضع العدسة بحذر'
    },
    {
        title: 'غمض عينك وثبت العدسة',
        description: 'غمض عينك لتثبيت العدسة في مكانها واستمتع برؤية واضحة'
    }
];


export function HowToWear() {
    return (
        <div className="bg-background-light w-full py-16" dir="rtl">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-right">
                        <h2 className="text-3xl font-bold text-brand-dark mb-2">طريقة لبس العدسات</h2>
                        <p className="text-gray-500 mb-8 flex items-center gap-2">
                            للوضوح اللي يرضيك
                            <span className="material-symbols-outlined text-lg text-yellow-400">emoji_objects</span>
                        </p>

                        <div className="space-y-4 w-full max-w-md">
                            {steps.map((step, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex items-center gap-4 text-right">
                                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                                            <video
                                                src="https://cdn-icons-mp4.flaticon.com/512/19009/19009726.mp4"
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="w-8 h-8"
                                            />
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-brand-dark">{step.title}</h3>
                                            {step.description && <p className="text-sm text-gray-500">{step.description}</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full flex justify-center px-4">
                        <div className="relative aspect-[9/16] w-full max-w-sm rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                            <video
                                src="/videos/video2.mp4"
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
