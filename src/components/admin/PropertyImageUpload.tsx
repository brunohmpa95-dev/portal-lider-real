import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImagePlus, X, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  propertyCode: string;
}

export default function PropertyImageUpload({ images, onChange, propertyCode }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const path = `${propertyCode || 'temp'}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage.from('property-images').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
        continue;
      }

      const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
    }

    onChange([...images, ...newUrls]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  function remove(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    const arr = [...images];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    onChange(arr);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Fotos do Imóvel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((url, i) => (
              <div key={i} className="relative group rounded-md overflow-hidden border border-border aspect-square">
                <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-white" onClick={() => move(i, -1)} disabled={i === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-white" onClick={() => move(i, 1)} disabled={i === images.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-white" onClick={() => remove(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {i === 0 && (
                  <span className="absolute top-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Capa</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {uploading ? 'Enviando...' : 'Adicionar fotos'}
          </Button>
          <p className="text-xs text-muted-foreground mt-1.5">Formatos aceitos: JPG, PNG, WebP. A primeira foto será a capa.</p>
        </div>
      </CardContent>
    </Card>
  );
}
