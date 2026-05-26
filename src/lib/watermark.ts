import logoUrl from '@/assets/logo-transparent.png';

let cachedLogo: HTMLImageElement | null = null;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function getLogo(): Promise<HTMLImageElement> {
  if (cachedLogo) return cachedLogo;
  cachedLogo = await loadImage(logoUrl);
  return cachedLogo;
}

/**
 * Applies an agency logo watermark (bottom-right, ~20% width, 60% opacity)
 * to an image file using the Canvas API. Returns a new File (JPEG, q=0.9).
 * If the source is not an image or processing fails, returns the original file.
 */
export async function applyWatermark(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  try {
    const src = URL.createObjectURL(file);
    let baseImg: HTMLImageElement;
    try {
      baseImg = await loadImage(src);
    } finally {
      URL.revokeObjectURL(src);
    }

    const logo = await getLogo();

    const canvas = document.createElement('canvas');
    canvas.width = baseImg.naturalWidth;
    canvas.height = baseImg.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.drawImage(baseImg, 0, 0);

    const targetW = canvas.width * 0.2;
    const ratio = logo.naturalHeight / logo.naturalWidth;
    const targetH = targetW * ratio;
    const padding = Math.max(16, canvas.width * 0.015);
    const x = canvas.width - targetW - padding;
    const y = canvas.height - targetH - padding;

    ctx.globalAlpha = 0.6;
    ctx.drawImage(logo, x, y, targetW, targetH);
    ctx.globalAlpha = 1;

    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob(res, 'image/jpeg', 0.9)
    );
    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn('Watermark failed, uploading original', err);
    return file;
  }
}
