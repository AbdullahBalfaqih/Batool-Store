'use client';

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image_url: string;
  category: 'عدسات تجميلية' | 'عدسات طبيه' | 'نظارات شمسية';
  measurements?: string[];
  usage?: string;
  brand?: string;
  diameter?: number;
  baseCurve?: number;
  type?: string;
  description?: string;
};

const DetailItem = ({ label, value }: { label: string; value: string | number | undefined }) => {
  if (!value) return null;

  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-semibold text-brand-dark">{value}</dd>
    </div>
  );
};

export function ProductDetails({ product }: { product: Product }) {

  const details = [
    { label: 'النوع', value: product.type },
    { label: 'الماركة', value: product.brand },
    { label: 'استخدام العدسات', value: product.usage },
    { label: 'حجم العبوة', value: 'عبوة من عدستين' },
    { label: 'قطر العدسة', value: product.diameter ? `${product.diameter} mm` : undefined },
    { label: 'انحناء قاعدة العدسة', value: product.baseCurve ? `${product.baseCurve} mm` : undefined },
  ];

  return (
    <div className="py-12 bg-background-light" dir="rtl">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-brand-dark">تفاصيل المنتج</h2>
        <div className="max-w-lg mx-auto bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
            <dl className="divide-y divide-gray-200">
                {details.map(detail => (
                  <DetailItem key={detail.label} label={detail.label} value={detail.value} />
                ))}
            </dl>
        </div>
      </div>
    </div>
  );
}
