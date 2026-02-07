"use client";

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useFormPersist } from '@/hooks/use-form-persist';
import { Image as ImageIcon } from 'lucide-react';

const assetSchema = z.object({
  name: z.string().min(1, 'Nama aset wajib diisi'),
  category: z.string().min(1, 'Kategori wajib diisi'),
  spec: z.string().optional(),
  brand: z.string().optional(),
  purchaseDate: z.string().min(1, 'Tanggal wajib diisi'),
  purchaseYear: z.string().optional(), // "UNKNOWN" or year number
  price: z.string().optional(),
  origin: z.string().optional(), // BOS/Komite/Hibah/Inv. Lama
  condition: z.enum(['GOOD', 'BROKEN_LIGHT', 'BROKEN_HEAVY']),
  assetStatus: z.string().optional(), // Baru/Bekas/Hasil Pemutihan
  notes: z.string().optional(),
  roomId: z.string().optional(),
  imageUrl: z.string().optional(),
});

interface AssetFormProps {
  initialData?: any;
}

export function AssetForm({ initialData }: AssetFormProps) {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [yearUnknown, setYearUnknown] = useState(false);

  const form = useForm({
    resolver: zodResolver(assetSchema),
    defaultValues: initialData ? {
      name: initialData.name || '',
      category: initialData.category || '',
      spec: initialData.spec || '',
      brand: initialData.brand || '',
      purchaseDate: initialData.purchaseDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      purchaseYear: initialData.purchaseYear?.toString() || new Date().getFullYear().toString(),
      price: initialData.price?.toString() || '',
      origin: initialData.origin || '',
      condition: initialData.condition || 'GOOD',
      assetStatus: initialData.assetStatus || 'Baru',
      notes: initialData.notes || '',
      roomId: initialData.roomId || '',
      imageUrl: initialData.imageUrl || '',
    } : {
      name: '',
      category: '',
      spec: '',
      brand: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseYear: new Date().getFullYear().toString(),
      price: '',
      origin: '',
      condition: 'GOOD',
      assetStatus: 'Baru',
      notes: '',
      roomId: '',
      imageUrl: '',
    },
  });

  const { clearStorage } = useFormPersist("asset-form-draft", form);

  // Clear localStorage when creating new asset (not editing)
  useEffect(() => {
    if (!initialData) {
      clearStorage();
    }
  }, [initialData, clearStorage]);

  // Watch for year unknown checkbox
  const purchaseYear = useWatch({ control: form.control, name: 'purchaseYear' });

  useEffect(() => {
    // Load rooms for dropdown
    api.get('/rooms').then(res => setRooms(res.data)).catch(console.error);

    if (initialData) {
      const date = initialData.purchaseDate?.split('T')[0];
      form.setValue('purchaseDate', date);
      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }
      if (!initialData.purchaseYear) {
        setYearUnknown(true);
        form.setValue('purchaseYear', 'UNKNOWN');
      }
    }
  }, [initialData, form]);

  // Auto-fill notes when year is unknown
  useEffect(() => {
    if (yearUnknown) {
      form.setValue('purchaseYear', 'UNKNOWN');
      form.setValue('notes', 'Hasil Pemutihan');
      form.setValue('assetStatus', 'Hasil Pemutihan');
    }
  }, [yearUnknown, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        form.setValue('imageUrl', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof assetSchema>) {
    // Note: react-hook-form handles isSubmitting, we don't need to return early here
    // as it prevents the first submission attempt.

    try {
      // Convert values for API
      const payload = {
        ...values,
        purchaseYear: values.purchaseYear === 'UNKNOWN' ? null : parseInt(values.purchaseYear || '0'),
        price: values.price ? parseFloat(values.price) : null,
      };

      console.log('[AssetForm] Sending payload:', payload);

      if (initialData) {
        await api.patch(`/assets/${initialData.id}`, payload);
        toast.success('Asset updated');
      } else {
        await api.post('/assets', payload);
        toast.success('Aset berhasil disimpan');
        clearStorage();
      }
      router.push('/dashboard/assets');
    } catch (error: any) {
      console.error('Asset submission error:', error);
      const msg = error.response?.data?.message || 'Gagal menyimpan aset';
      toast.error(typeof msg === 'string' ? msg : 'Gagal menyimpan aset');
    }
  }

  // Debug: log form errors and state if any
  useEffect(() => {
    console.log('--- AssetForm Debug ---');
    console.log('Is Submitting:', form.formState.isSubmitting);
    console.log('IsValid:', form.formState.isValid);
    console.log('Dirty Fields:', form.formState.dirtyFields);
    console.log('Form Values:', form.getValues());
    if (Object.keys(form.formState.errors).length > 0) {
      console.log('Form validation errors:', form.formState.errors);
    }
    console.log('-----------------------');
  }, [form.formState.errors, form.formState.isSubmitting, form.formState.isValid]);

  // Generate year options (last 30 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error('Validation errors:', errors);
          toast.error('Harap periksa kembali form. Ada data yang belum valid atau kosong.');
        })}
        className="space-y-6 max-w-3xl"
      >
        {/* Row 1: Nama & Merk/Spesifikasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Barang *</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Meja Kerja" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="spec"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Merk / Spesifikasi</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Lunar LMK 1260" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: Kategori & Brand */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori *</FormLabel>
                <FormControl>
                  <Input placeholder="ELEKTRONIK / FURNITURE" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Merk</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Panasonic" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 3: Tahun Perolehan & Asal Barang */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchaseYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tahun Perolehan</FormLabel>
                <div className="space-y-2">
                  <Select
                    onValueChange={field.onChange}
                    value={yearUnknown ? 'UNKNOWN' : field.value}
                    disabled={yearUnknown}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tahun" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {yearOptions.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="yearUnknown"
                      checked={yearUnknown}
                      onCheckedChange={(checked: boolean | 'indeterminate') => setYearUnknown(!!checked)}
                    />
                    <label htmlFor="yearUnknown" className="text-sm text-muted-foreground cursor-pointer">
                      Tidak Diketahui (Hasil Pemutihan)
                    </label>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asal Barang</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih asal barang" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BOS">BOS</SelectItem>
                    <SelectItem value="Komite">Komite</SelectItem>
                    <SelectItem value="Hibah">Hibah</SelectItem>
                    <SelectItem value="Inv. Lama">Inv. Lama</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 4: Keadaan & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keadaan (B/RR/RB)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih keadaan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GOOD">B (Baik)</SelectItem>
                    <SelectItem value="BROKEN_LIGHT">RR (Rusak Ringan)</SelectItem>
                    <SelectItem value="BROKEN_HEAVY">RB (Rusak Berat)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assetStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status Barang</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Baru">Baru</SelectItem>
                    <SelectItem value="Bekas">Bekas</SelectItem>
                    <SelectItem value="Hasil Pemutihan">Hasil Pemutihan</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 5: Tanggal Pembukuan, Harga, Lokasi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Pembukuan *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga (Rp)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="560000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="roomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lokasi (Ruangan)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih ruangan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 6: Keterangan */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keterangan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Hasil Pemutihan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Foto Aset (Opsional)</Label>
          <div className="flex items-start gap-4">
            <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: JPG, PNG. Maksimal 10MB.
              </p>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto">
          {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Aset'}
        </Button>
      </form>
    </Form>
  );
}


