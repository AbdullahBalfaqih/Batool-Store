
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useSupabase } from '@/lib/supabase/provider';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Product = {
  id: string;
  name: string;
};

const createSafeFileName = (file: File, folder: 'logos' | 'gallery' | 'currency' | 'banks' | 'footer' | 'barcode' | 'marketing' | 'solution') => {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `${folder}/${timestamp}-${randomString}.${fileExtension}`;
};

export default function AdminSettingsPage() {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currencyImageUrl, setCurrencyImageUrl] = useState<string>('');
  const [bankAccountImage1Url, setBankAccountImage1Url] = useState<string>('');
  const [bankAccountImage2Url, setBankAccountImage2Url] = useState<string>('');
  const [footerImageUrl, setFooterImageUrl] = useState<string>('');
  const [websiteBarcodeImageUrl, setWebsiteBarcodeImageUrl] = useState<string>('');
  
  const [solutionImageUrl, setSolutionImageUrl] = useState<string>('');
  const [solutionPrice, setSolutionPrice] = useState<string>('');
  const [solutionOriginalPrice, setSolutionOriginalPrice] = useState<string>('');

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
  const [currencyImageFile, setCurrencyImageFile] = useState<File | null>(null);
  const [bankAccountImage1File, setBankAccountImage1File] = useState<File | null>(null);
  const [bankAccountImage2File, setBankAccountImage2File] = useState<File | null>(null);
  const [footerImageFile, setFooterImageFile] = useState<File | null>(null);
  const [websiteBarcodeImageFile, setWebsiteBarcodeImageFile] = useState<File | null>(null);

  const [solutionImageFile, setSolutionImageFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { supabase } = useSupabase();

  const fetchSettingsAndProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: settingsData, error: settingsError } = await supabase.from('site_settings').select('*').single();
      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
      
      if (settingsData) {
        setLogoUrl(settingsData.logo_url || '');
        setGalleryImages(settingsData.gallery_images || []);
        setCurrencyImageUrl(settingsData.currency_image_url || '');
        setBankAccountImage1Url(settingsData.bank_account_image1_url || '');
        setBankAccountImage2Url(settingsData.bank_account_image2_url || '');
        setFooterImageUrl(settingsData.footer_image_url || '');
        setWebsiteBarcodeImageUrl(settingsData.website_barcode_image_url || '');
        setSolutionImageUrl(settingsData.solution_image_url || '');
        setSolutionPrice(String(settingsData.solution_price || ''));
        setSolutionOriginalPrice(String(settingsData.solution_original_price || ''));
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'فشل جلب البيانات',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    fetchSettingsAndProducts();
  }, [fetchSettingsAndProducts]);
  
  const uploadFile = async (file: File, folder: 'logos' | 'gallery' | 'currency' | 'banks' | 'footer' | 'barcode' | 'marketing' | 'solution'): Promise<string> => {
      const fileName = createSafeFileName(file, folder);
      const { data, error } = await supabase.storage.from('site-assets').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(data.path);
      return publicUrl;
  };

  const handleSave = async () => {
    setIsLoading(true);
    let newLogoUrl = logoUrl;
    let newGalleryUrls = [...galleryImages];
    let newCurrencyImageUrl = currencyImageUrl;
    let newBankAccountImage1Url = bankAccountImage1Url;
    let newBankAccountImage2Url = bankAccountImage2Url;
    let newFooterImageUrl = footerImageUrl;
    let newWebsiteBarcodeImageUrl = websiteBarcodeImageUrl;
    let newSolutionImageUrl = solutionImageUrl;

    try {
      if (logoFile) newLogoUrl = await uploadFile(logoFile, 'logos');
      if (currencyImageFile) newCurrencyImageUrl = await uploadFile(currencyImageFile, 'currency');
      if (bankAccountImage1File) newBankAccountImage1Url = await uploadFile(bankAccountImage1File, 'banks');
      if (bankAccountImage2File) newBankAccountImage2Url = await uploadFile(bankAccountImage2File, 'banks');
      if (footerImageFile) newFooterImageUrl = await uploadFile(footerImageFile, 'footer');
      if (websiteBarcodeImageFile) newWebsiteBarcodeImageUrl = await uploadFile(websiteBarcodeImageFile, 'barcode');
      
      if (solutionImageFile) newSolutionImageUrl = await uploadFile(solutionImageFile, 'solution');

      if (galleryFiles) {
        const uploadPromises = Array.from(galleryFiles).map(file => uploadFile(file, 'gallery'));
        const uploadedUrls = await Promise.all(uploadPromises);
        newGalleryUrls.push(...uploadedUrls);
      }
      
      const settingsData = {
          logo_url: newLogoUrl,
          gallery_images: newGalleryUrls,
          currency_image_url: newCurrencyImageUrl,
          bank_account_image1_url: newBankAccountImage1Url,
          bank_account_image2_url: newBankAccountImage2Url,
          footer_image_url: newFooterImageUrl,
          website_barcode_image_url: newWebsiteBarcodeImageUrl,
          solution_image_url: newSolutionImageUrl,
          solution_price: parseFloat(solutionPrice) || null,
          solution_original_price: parseFloat(solutionOriginalPrice) || null,
      };
      
      const { error } = await supabase
        .from('site_settings')
        .upsert({ id: 1, ...settingsData }, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: 'تم الحفظ بنجاح',
        description: 'تم تحديث إعدادات الموقع.',
      });
      fetchSettingsAndProducts();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
      setLogoFile(null);
      setGalleryFiles(null);
      setCurrencyImageFile(null);
      setBankAccountImage1File(null);
      setBankAccountImage2File(null);
      setFooterImageFile(null);
      setWebsiteBarcodeImageFile(null);
      setSolutionImageFile(null);
    }
  };
  
   const removeGalleryImage = (indexToRemove: number) => {
    setGalleryImages(currentImages => currentImages.filter((_, index) => index !== indexToRemove));
  };


  return (
    <div className="grid gap-6">
      <Card className="bg-surface-dark border-border-dark text-white">
        <CardHeader>
          <CardTitle className="text-primary">إعدادات الموقع العامة</CardTitle>
          <CardDescription>
            إدارة شعار الموقع، معرض الصور، ورمز العملة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div>
              <Label htmlFor="logo" className="text-gray-300">شعار الموقع</Label>
              <div className="mt-2 flex items-center gap-4">
                {logoUrl && (
                  <Image
                    src={logoUrl}
                    alt="Logo preview"
                    width={64}
                    height={64}
                    className="rounded-md object-cover bg-gray-700"
                  />
                )}
                <Input
                  id="logo"
                  type="file"
                  onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
                  className="flex-1 bg-background-dark border-border-dark file:text-gray-400"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="currencyImage" className="text-gray-300">صورة رمز العملة</Label>
              <div className="mt-2 flex items-center gap-4">
                {currencyImageUrl && (
                  <Image
                    src={currencyImageUrl}
                    alt="Currency symbol preview"
                    width={40}
                    height={40}
                    className="rounded-md object-contain bg-gray-700 p-1"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                )}
                <Input
                  id="currencyImage"
                  type="file"
                  onChange={(e) => setCurrencyImageFile(e.target.files ? e.target.files[0] : null)}
                  className="flex-1 bg-background-dark border-border-dark file:text-gray-400"
                />
              </div>
            </div>

             <div>
                <Label className="text-gray-300">صور الحسابات البنكية</Label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="bankAccount1" className="text-sm text-gray-400">الحساب البنكي 1</Label>
                         <div className="mt-1 flex items-center gap-4">
                            {bankAccountImage1Url && <Image src={bankAccountImage1Url} alt="Bank 1" width={100} height={100} className="rounded-md object-contain bg-gray-700 p-1" />}
                            <Input id="bankAccount1" type="file" onChange={(e) => setBankAccountImage1File(e.target.files ? e.target.files[0] : null)} className="flex-1 bg-background-dark border-border-dark file:text-gray-400" />
                         </div>
                    </div>
                     <div>
                        <Label htmlFor="bankAccount2" className="text-sm text-gray-400">الحساب البنكي 2</Label>
                         <div className="mt-1 flex items-center gap-4">
                            {bankAccountImage2Url && <Image src={bankAccountImage2Url} alt="Bank 2" width={100} height={100} className="rounded-md object-contain bg-gray-700 p-1" />}
                            <Input id="bankAccount2" type="file" onChange={(e) => setBankAccountImage2File(e.target.files ? e.target.files[0] : null)} className="flex-1 bg-background-dark border-border-dark file:text-gray-400" />
                         </div>
                    </div>
                </div>
            </div>
            
            <div>
              <Label htmlFor="websiteBarcodeImage" className="text-gray-300">صورة باركود الموقع</Label>
              <div className="mt-2 flex items-center gap-4">
                {websiteBarcodeImageUrl && (
                  <Image
                    src={websiteBarcodeImageUrl}
                    alt="Website barcode preview"
                    width={100}
                    height={100}
                    className="rounded-md object-contain bg-gray-700 p-1"
                  />
                )}
                <Input
                  id="websiteBarcodeImage"
                  type="file"
                  onChange={(e) => setWebsiteBarcodeImageFile(e.target.files ? e.target.files[0] : null)}
                  className="flex-1 bg-background-dark border-border-dark file:text-gray-400"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="footerImage" className="text-gray-300">صورة التذييل (Footer)</Label>
              <div className="mt-2 flex items-center gap-4">
                {footerImageUrl && (
                  <Image
                    src={footerImageUrl}
                    alt="Footer preview"
                    width={128}
                    height={64}
                    className="rounded-md object-contain bg-gray-700"
                  />
                )}
                <Input
                  id="footerImage"
                  type="file"
                  onChange={(e) => setFooterImageFile(e.target.files ? e.target.files[0] : null)}
                  className="flex-1 bg-background-dark border-border-dark file:text-gray-400"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="gallery" className="text-gray-300">معرض الصور</Label>
               <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={url}
                      alt={`Gallery image ${index + 1}`}
                      width={200}
                      height={200}
                      className="rounded-md object-cover aspect-square"
                    />
                     <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeGalleryImage(index)}
                      >
                       <span className="material-symbols-outlined text-sm">delete</span>
                    </Button>
                  </div>
                ))}
              </div>
              <Input
                id="gallery"
                type="file"
                multiple
                onChange={(e) => setGalleryFiles(e.target.files)}
                className="mt-4 bg-background-dark border-border-dark file:text-gray-400"
              />
            </div>
            
            <Separator className="my-8 bg-border-dark" />
            <div>
              <CardTitle className="text-primary mb-4">قسم محلول بتول</CardTitle>
              <CardDescription className="mb-6">
                إدارة محتوى قسم "محلول بتول" في الصفحة الرئيسية.
              </CardDescription>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="solutionImage" className="text-gray-300">صورة محلول العدسات</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {solutionImageUrl && <Image src={solutionImageUrl} alt="Solution preview" width={100} height={100} className="rounded-md object-contain bg-gray-700 p-1" />}
                    <Input id="solutionImage" type="file" onChange={(e) => setSolutionImageFile(e.target.files ? e.target.files[0] : null)} className="flex-1 bg-background-dark border-border-dark file:text-gray-400" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="solutionPrice">سعر المحلول</Label>
                    <Input id="solutionPrice" type="number" value={solutionPrice} onChange={(e) => setSolutionPrice(e.target.value)} className="bg-background-dark border-border-dark" />
                  </div>
                  <div>
                    <Label htmlFor="solutionOriginalPrice">السعر الأصلي للمحلول</Label>
                    <Input id="solutionOriginalPrice" type="number" value={solutionOriginalPrice} onChange={(e) => setSolutionOriginalPrice(e.target.value)} className="bg-background-dark border-border-dark" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white">
          {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>
    </div>
  );
}
