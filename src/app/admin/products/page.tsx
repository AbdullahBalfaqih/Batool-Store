
'use client';
import { useState, useEffect, useMemo } from 'react';
import { MoreHorizontal, PlusCircle, Check, ChevronsUpDown, ListFilter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useSupabase } from '@/lib/supabase/provider';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type Product = {
  id: string;
  name: string;
  status: 'نشط' | 'مسودة' | 'غير نشط';
  price: number;
  originalPrice?: number;
  total_sales: number;
  created_at: string;
  image_url: string;
  lens_image_url?: string;
  category: 'عدسات تجميلية' | 'عدسات طبيه' | 'نظارات شمسية' | 'محاليل';
  measurements?: string[];
  usage?: string;
  brand?: string;
  diameter?: number;
  baseCurve?: number;
  type?: string;
  description?: string;
};

const PRODUCT_CATEGORIES: Product['category'][] = ['عدسات تجميلية', 'عدسات طبيه', 'نظارات شمسية', 'محاليل'];
const PRODUCT_STATUSES: Product['status'][] = ['نشط', 'مسودة', 'غير نشط'];

const createSafeFileName = (file: File) => {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `products/${timestamp}-${randomString}.${fileExtension}`;
};

const generateMeasurementOptions = () => {
    const options = [];
    for (let i = 0; i <= 10; i += 0.25) {
        options.push(i.toFixed(2));
    }
    for (let i = 11; i <= 20; i++) {
        options.push(i.toFixed(2));
    }
    return options;
};


export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currencyImageUrl, setCurrencyImageUrl] = useState<string>('');
  
  const [filterCategory, setFilterCategory] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'نشط' | 'مسودة' | 'غير نشط'>('مسودة');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [lensImageFile, setLensImageFile] = useState<File | null>(null);
  const [category, setCategory] = useState<Product['category']>('عدسات تجميلية');
  const [measurements, setMeasurements] = useState<string[]>([]);
  const [usage, setUsage] = useState('');
  const [brand, setBrand] = useState('');
  const [diameter, setDiameter] = useState('');
  const [baseCurve, setBaseCurve] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');

  const measurementOptions = generateMeasurementOptions();
  const { toast } = useToast();
  const { supabase } = useSupabase();

   const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const categoryMatch = filterCategory.length === 0 || filterCategory.includes(product.category);
      const statusMatch = filterStatus.length === 0 || filterStatus.includes(product.status);
      return categoryMatch && statusMatch;
    });
  }, [products, filterCategory, filterStatus]);

  const handleFilterChange = (value: string, type: 'category' | 'status') => {
    const setter = type === 'category' ? setFilterCategory : setFilterStatus;
    setter(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value) 
        : [...prev, value]
    );
  };


   const CurrencyDisplay = ({imageUrl, className}: {imageUrl: string, className?: string}) => {
        if (imageUrl) {
            return <Image src={imageUrl} alt="currency" width={16} height={16} className={cn("inline-block", className)} />;
        }
        return <span className={cn(className)}>ر.س</span>;
    }

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      toast({
        variant: 'destructive',
        title: 'فشل جلب المنتجات',
        description: error.message,
      });
    } else {
      setProducts(data as Product[]);
    }
    
    const { data: settingsData, error: settingsError } = await supabase.from('site').select('settings').single();
      if (settingsError && settingsError.code !== 'PGRST116') {
            toast({ variant: 'destructive', title: 'فشل جلب الإعدادات', description: settingsError.message });
      } else if (settingsData) {
          setCurrencyImageUrl((settingsData.settings as any)?.currencyImageUrl || '');
      }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setName('');
    setStatus('مسودة');
    setPrice('');
    setOriginalPrice('');
    setImageFile(null);
    setLensImageFile(null);
    setCategory('عدسات تجميلية');
    setMeasurements([]);
    setUsage('');
    setBrand('');
    setDiameter('');
    setBaseCurve('');
    setType('');
    setDescription('');
  }

  const handleOpenDialog = (product: Product | null = null) => {
    setEditingProduct(product);
    if (product) {
      setName(product.name);
      setStatus(product.status);
      setPrice(String(product.price));
      setOriginalPrice(String(product.originalPrice || ''));
      setCategory(product.category);
      setMeasurements(product.measurements || []);
      setUsage(product.usage || '');
      setBrand(product.brand || '');
      setDiameter(String(product.diameter || ''));
      setBaseCurve(String(product.baseCurve || ''));
      setType(product.type || '');
      setDescription(product.description || '');
    } else {
      resetForm();
    }
    setImageFile(null);
    setLensImageFile(null);
    setIsDialogOpen(true);
  };
  
  const handleMeasurementChange = (measurement: string) => {
    setMeasurements(prev => 
      prev.includes(measurement) 
        ? prev.filter(m => m !== measurement) 
        : [...prev, measurement]
    );
  };

  const handleDeleteProduct = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'فشل الحذف',
        description: error.message,
      });
    } else {
      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف المنتج من قاعدة البيانات.',
      });
      fetchProducts(); // Refresh list
    }
  };
  
  const uploadFile = async (file: File): Promise<string> => {
      const safeFileName = createSafeFileName(file);
      const { data, error } = await supabase.storage.from('product-images').upload(safeFileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path);
      return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let newImageUrl = editingProduct?.image_url || '';
    let newLensImageUrl = editingProduct?.lens_image_url || '';

    try {
      if (imageFile) {
        newImageUrl = await uploadFile(imageFile);
      }
      if (lensImageFile) {
        newLensImageUrl = await uploadFile(lensImageFile);
      }
      
      const commonData = {
        name: name,
        status: status,
        price: parseFloat(price) || 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        image_url: newImageUrl,
        lens_image_url: newLensImageUrl,
        category: category,
        measurements: measurements,
        usage: usage,
        brand: brand,
        diameter: diameter ? parseFloat(diameter) : undefined,
        baseCurve: baseCurve ? parseFloat(baseCurve) : undefined,
        type: type,
        description: description,
      };
      
      let error;

      if (editingProduct) {
        const { data, error: updateError } = await supabase.from('products').update(commonData).eq('id', editingProduct.id);
        error = updateError;
      } else {
        const insertData = {
            ...commonData,
            total_sales: 0,
            created_at: new Date().toISOString(),
        }
        const { data, error: insertError } = await supabase.from('products').insert(insertData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: 'تم الحفظ بنجاح!',
        description: `تم ${editingProduct ? 'تحديث' : 'إضافة'} المنتج بنجاح.`,
      });

      setIsDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: error.message,
      });
    }
  };


  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl text-primary">المنتجات</h1>
        <div className="mr-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 bg-surface-dark border-border-dark text-gray-300 hover:text-primary">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    فلتر
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background-dark text-white border-border-dark">
                <DropdownMenuLabel>فلترة حسب</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>الفئة</DropdownMenuLabel>
                 {PRODUCT_CATEGORIES.map(cat => (
                  <DropdownMenuCheckboxItem
                    key={cat}
                    checked={filterCategory.includes(cat)}
                    onCheckedChange={() => handleFilterChange(cat, 'category')}
                  >
                    {cat}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>الحالة</DropdownMenuLabel>
                {PRODUCT_STATUSES.map(stat => (
                  <DropdownMenuCheckboxItem
                    key={stat}
                    checked={filterStatus.includes(stat)}
                    onCheckedChange={() => handleFilterChange(stat, 'status')}
                  >
                    {stat}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

          <Button size="sm" className="h-8 gap-1" onClick={() => handleOpenDialog()}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              إضافة منتج
            </span>
          </Button>
        </div>
      </div>
      <Card className="bg-surface-dark border-border-dark text-white">
        <CardHeader>
          <CardTitle>قائمة المنتجات</CardTitle>
          <CardDescription>
            إدارة منتجاتك وإعداداتها.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border-dark bg-blue-900/20">
                <TableHead className="hidden w-[100px] sm:table-cell text-blue-300">
                  صورة
                </TableHead>
                <TableHead className="text-blue-300">الاسم</TableHead>
                <TableHead className="text-blue-300">الحالة</TableHead>
                <TableHead className="hidden md:table-cell text-blue-300">
                  الصنف
                </TableHead>
                <TableHead className="hidden md:table-cell text-blue-300">
                  تاريخ الإنشاء
                </TableHead>
                <TableHead className="text-left text-blue-300">السعر</TableHead>
                <TableHead>
                  <span className="sr-only">الإجراءات</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-border-dark/50">
                    <TableCell className="hidden sm:table-cell">
                      <div className="h-16 w-16 bg-gray-700 rounded-md animate-pulse" />
                    </TableCell>
                    <TableCell><div className="h-4 w-32 bg-gray-700 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-6 w-20 bg-gray-700 rounded-full animate-pulse" /></TableCell>
                    <TableCell className="hidden md:table-cell"><div className="h-4 w-24 bg-gray-700 rounded animate-pulse" /></TableCell>
                    <TableCell className="hidden md:table-cell"><div className="h-4 w-24 bg-gray-700 rounded animate-pulse" /></TableCell>
                    <TableCell className="text-left"><div className="h-4 w-16 bg-gray-700 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-8 w-8 bg-gray-700 rounded-md animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="border-border-dark/50">
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={product.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={product.image_url || '/placeholder.svg'}
                        width="64"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'نشط' ? 'default' : 'secondary'} className={cn({
                        'bg-green-500/10 text-green-400 border-green-500/20': product.status === 'نشط',
                         'bg-yellow-500/10 text-yellow-400 border-yellow-500/20': product.status === 'مسودة',
                         'bg-red-500/10 text-red-400 border-red-500/20': product.status === 'غير نشط',
                      })}>
                        {product.status}
                      </Badge>
                    </TableCell>
                     <TableCell className="hidden md:table-cell">
                      {product.category}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(product.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-1">
                          {product.price.toFixed(2)} <CurrencyDisplay imageUrl={currencyImageUrl} />
                        </div>
                    </TableCell>
                    <TableCell className="text-left">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost" className="hover:bg-surface-dark/50">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background-dark text-white border-border-dark">
                          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleOpenDialog(product)}>
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 focus:bg-red-500/20 focus:text-red-400" onClick={() => handleDeleteProduct(product.id)}>
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-gray-400">
                        لا توجد منتجات تطابق الفلتر المحدد.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-gray-400">
            عرض <strong>1-{filteredProducts.length}</strong> من <strong>{filteredProducts.length}</strong> منتج
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl bg-surface-dark border-border-dark text-white">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-primary">
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'قم بتحديث تفاصيل المنتج.' : 'أدخل تفاصيل المنتج الجديد.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-2 md:grid-cols-2">
                {/* Right Column */}
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">الاسم</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-background-dark border-border-dark" required/>
                    </div>
                    <div>
                        <Label htmlFor="description">الوصف</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-background-dark border-border-dark" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="price">السعر</Label>
                            <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-background-dark border-border-dark" required/>
                        </div>
                        <div>
                            <Label htmlFor="originalPrice">السعر الأصلي</Label>
                            <Input id="originalPrice" type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="bg-background-dark border-border-dark" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="status">الحالة</Label>
                            <Select value={status} onValueChange={(value: 'نشط' | 'مسودة' | 'غير نشط') => setStatus(value)}>
                                <SelectTrigger className="bg-background-dark border-border-dark">
                                    <SelectValue placeholder="اختر الحالة" />
                                </SelectTrigger>
                                <SelectContent className="bg-background-dark text-white border-border-dark">
                                    {PRODUCT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="category">الصنف</Label>
                            <Select value={category} onValueChange={(value: Product['category']) => setCategory(value)}>
                                <SelectTrigger className="bg-background-dark border-border-dark">
                                    <SelectValue placeholder="اختر الصنف" />
                                </SelectTrigger>
                                <SelectContent className="bg-background-dark text-white border-border-dark">
                                    {PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="image">الصورة الرئيسية</Label>
                        <Input id="image" type="file" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="bg-background-dark border-border-dark file:text-gray-400" />
                    </div>
                     <div>
                        <Label htmlFor="lens_image">صورة العدسة فقط</Label>
                        <Input id="lens_image" type="file" onChange={(e) => setLensImageFile(e.target.files ? e.target.files[0] : null)} className="bg-background-dark border-border-dark file:text-gray-400" />
                    </div>
                </div>

                {/* Left Column */}
                <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="brand">الماركة</Label>
                            <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="bg-background-dark border-border-dark" />
                        </div>
                        <div>
                            <Label htmlFor="type">النوع</Label>
                            <Input id="type" value={type} onChange={(e) => setType(e.target.value)} className="bg-background-dark border-border-dark" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="usage">الاستخدام</Label>
                        <Input id="usage" value={usage} onChange={(e) => setUsage(e.target.value)} className="bg-background-dark border-border-dark" placeholder="شهري، يومي..." />
                    </div>
                     <div>
                        <Label>القياسات</Label>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between bg-background-dark border-border-dark hover:bg-surface-dark">
                                    <span className="truncate">
                                        {measurements.length > 0 ? `${measurements.length} قياسات محددة` : "اختر القياسات"}
                                    </span>
                                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] bg-background-dark text-white border-border-dark">
                                <ScrollArea className="h-60">
                                    {measurementOptions.map(option => (
                                        <DropdownMenuCheckboxItem
                                            key={option}
                                            checked={measurements.includes(option)}
                                            onSelect={(e) => e.preventDefault()} // Prevent closing on select
                                            onCheckedChange={() => handleMeasurementChange(option)}
                                        >
                                            {option}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </ScrollArea>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-xs text-gray-400 mt-2 p-2 bg-black rounded-md">
                           القياسات المحددة: {measurements.join(', ')}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="diameter">قطر العدسة (mm)</Label>
                            <Input id="diameter" type="number" value={diameter} onChange={(e) => setDiameter(e.target.value)} className="bg-background-dark border-border-dark" />
                        </div>
                        <div>
                            <Label htmlFor="baseCurve">انحناء العدسة (mm)</Label>
                            <Input id="baseCurve" type="number" value={baseCurve} onChange={(e) => setBaseCurve(e.target.value)} className="bg-background-dark border-border-dark" />
                        </div>
                    </div>
                </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" className="hover:bg-surface-dark/50">
                  إلغاء
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">حفظ</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
