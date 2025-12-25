
'use client';
import { cn } from "@/lib/utils";

const faqData = [
    {
        title: "هل العدسات اللاصقة آمنة للعيون؟",
        content: "نعم، جميع عدساتنا مصنوعة من مواد عالية الجودة ومعتمدة طبيًا لضمان أقصى درجات الأمان والراحة لعينيك. نوصي دائمًا باتباع إرشادات الاستخدام والنظافة."
    },
    {
        title: "كم من الوقت يمكنني ارتداء العدسات؟",
        content: "تختلف مدة الاستخدام حسب نوع العدسة (يومية، شهرية). يرجى مراجعة تفاصيل المنتج لمعرفة المدة الموصى بها لكل نوع لضمان صحة عينيك."
    },
    {
        title: "كيف أختار اللون المناسب لي؟",
        content: "نقدم مجموعة واسعة من الألوان الطبيعية والجريئة. يمكنك تجربة ألوان مختلفة بناءً on لون بشرتك أو مظهرك المرغوب. قسم المعرض يعرض صورًا حقيقية لمساعدتك."
    },
     {
        title: "هل تتوفر عدسات طبية ملونة؟",
        content: "بالتأكيد! نوفر مجموعة من العدسات الملونة التي تأتي مع قياسات طبية لتصحيح النظر. يمكنك تحديد قياس النظر عند طلب المنتج."
    }
];


export function Faq() {
  return (
    <div className="w-full bg-background-light py-20 relative">
       <div className="container mx-auto px-4 flex flex-col items-center">
         <h2 className="text-3xl md:text-4xl font-bold text-brand-dark text-center leading-tight mb-12">
            أسئلة شائعة
        </h2>
        <div className="relative w-full max-w-4xl">
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                <AdvancedGradiant className="opacity-20" />
            </div>
            <div className="space-y-3 relative z-10">
                {faqData.map((item, index) => (
                    <FaqItem key={index} title={item.title} content={item.content} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

const FaqItem = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => {
  return (
    <div className="bg-white/50 hover:bg-white/80 border border-gray-200/80 transition-all rounded-3xl overflow-hidden relative backdrop-blur-md">
      <details className="peer group max-h-96 overflow-hidden transition-all w-full transform-gpu">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 pr-6 group-open:pt-6 group-open:pl-8 duration-300 transition-all transform-gpu text-right">
          <h6 className="text-base tracking-tight text-brand-dark font-medium">
            {title}
          </h6>
          <ToogleIcon />
        </summary>
      </details>

      <div className="peer-open:max-h-40 max-h-0 overflow-hidden transition-all duration-500 text-neutral-800 font-medium transform-gpu">
        <p className="p-8 pt-4 m-2 bg-gray-50/50 rounded-2xl text-right text-sm leading-relaxed text-gray-600">{content}</p>
      </div>
    </div>
  );
};

const AdvancedGradiant = ({ className }: { className?: string }) => {
  return (
    <>
      <style>
        {`
          @keyframes size-bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(0.8); }
          }
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
          @keyframes spin-left {
            100% { transform: rotate(-360deg); }
          }
        `}
      </style>
      <div
        className={cn(
          "size-[400px] relative transition-all transform-gpu",
          className,
        )}
      >
        <div className="absolute top-0 left-0 grid place-items-center w-full h-full transform-gpu">
          <div
            className={cn(
              "w-full h-full blur-3xl opacity-80 rounded-full transform-gpu",
            )}
            style={{
              background:
                "conic-gradient(from 180deg at 50% 50%, #b2fce2, #a6d9f7, #b2fce2, #a6e8f7, #d0f9ea, #b2fce2)",
              animation: "spin 15s linear infinite",
            }}
          />
        </div>
        <div
          className="absolute top-0 left-0 grid place-items-center w-full h-full transform-gpu"
          style={{
            animation: "size-bounce 20s linear infinite",
          }}
        >
          <div
            className={cn(
              "size-[300px] absolute blur-2xl rounded-full transform-gpu",
            )}
            style={{
              background: "conic-gradient(#FFFFFF, #d4fcf1, #c5ebf7)",
              animation: "spin 10s linear infinite",
            }}
          />
        </div>
        <div
          className="absolute top-0 left-0 grid place-items-center w-full h-full transform-gpu"
          style={{
            animation: "size-bounce 10s linear infinite",
          }}
        >
          <div
            className={cn(
              "size-[300px] absolute blur-2xl rounded-full opacity-80 transform-gpu",
            )}
            style={{
              background: "conic-gradient(#e0f2fe, #dcfce7, #f3e8ff)",
              animation: "spin-left 15s linear infinite",
            }}
          />
        </div>
      </div>
    </>
  );
};

const ToogleIcon = () => {
  return (
    <button
      aria-label="Toggle menu"
      className="relative size-5 text-neutral-600"
      type="button"
    >
      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-in-out transform-gpu group-open:rotate-180">
        <div className="w-3 h-0.5 bg-current transition duration-500 translate-y-0.5 ease-in-out transform-gpu group-open:rotate-45" />
        <div className="w-3 h-0.5 bg-current transition -translate-y-0.5 duration-500 ease-in-out transform-gpu group-open:-rotate-45" />
      </div>
    </button>
  );
};
