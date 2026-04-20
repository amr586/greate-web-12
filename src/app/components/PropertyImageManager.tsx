import { useState, useEffect, useRef } from 'react';
import { Trash2, Star, Upload, Loader2, ImagePlus } from 'lucide-react';
import { api } from '../lib/api';
import { getApiBaseUrl } from '../lib/getApiUrl';
import { compressImage } from '../lib/imageUtils';

interface PropertyImage {
  id: number;
  url: string;
  is_primary: boolean;
  order_index: number;
}

interface Props {
  propertyId: number;
}

export default function PropertyImageManager({ propertyId }: Props) {
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadImages = async () => {
    try {
      const data = await api.getPropertyImages(propertyId);
      if (Array.isArray(data)) setImages(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadImages(); }, [propertyId]);

  const handleDelete = async (imgId: number) => {
    if (!confirm('هل تريد حذف هذه الصورة؟')) return;
    try {
      await api.deletePropertyImage(propertyId, imgId);
      setImages(prev => prev.filter(i => i.id !== imgId));
    } catch { alert('خطأ في حذف الصورة'); }
  };

  const handleSetPrimary = async (imgId: number) => {
    try {
      await api.setPropertyImagePrimary(propertyId, imgId);
      setImages(prev => prev.map(i => ({ ...i, is_primary: i.id === imgId })));
    } catch { alert('خطأ'); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      await Promise.all(Array.from(files).map(async (file, idx) => {
        const compressed = await compressImage(file);
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(compressed);
        });
        const resp = await fetch(`${getApiBaseUrl()}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ image: base64, filename: file.name }),
        });
        const result = await resp.json();
        if (result.url) {
          const newImg = await api.addPropertyImage(propertyId, result.url, images.length === 0 && idx === 0);
          if (newImg) setImages(prev => [...prev, newImg as PropertyImage]);
        }
      }));
    } catch { alert('خطأ في رفع الصور'); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  if (loading) return (
    <div className="flex items-center justify-center py-4">
      <Loader2 size={18} className="animate-spin text-[#005a7d]" />
    </div>
  );

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-xs font-semibold text-gray-600">صور العقار ({images.length})</label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 bg-[#005a7d] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#007a9a] disabled:opacity-60 transition-colors"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />}
          إضافة صور
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
      </div>

      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 text-gray-400 hover:border-[#005a7d] hover:text-[#005a7d] transition-colors"
        >
          <Upload size={24} />
          <span className="text-sm">اضغط لرفع صور العقار</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map(img => (
            <div key={img.id} className="relative rounded-xl overflow-hidden border-2 border-gray-100 group aspect-video">
              <img
                src={img.url?.startsWith('http') ? img.url : `${getApiBaseUrl()}${img.url}`}
                alt=""
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&h=150&fit=crop'; }}
              />
              {img.is_primary && (
                <div className="absolute top-1 right-1 bg-yellow-400 rounded-md p-0.5">
                  <Star size={10} className="text-yellow-900" fill="currentColor" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.is_primary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img.id)}
                    title="تعيين كصورة رئيسية"
                    className="w-7 h-7 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-lg flex items-center justify-center"
                  >
                    <Star size={12} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  title="حذف الصورة"
                  className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="aspect-video rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[#005a7d] hover:text-[#005a7d] transition-colors"
          >
            <Upload size={16} />
            <span className="text-xs">إضافة</span>
          </button>
        </div>
      )}
    </div>
  );
}
