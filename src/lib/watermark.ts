import logoUrl from '@/assets/watermark-center.png';

// Ajustes finos da marca d'água — fácil de calibrar depois.
const WATERMARK_OPACITY = 0.16;      // entre 0.12 e 0.20
const WATERMARK_WIDTH_RATIO = 0.26;  // entre 0.22 e 0.30 da largura da foto
const SMALL_IMAGE_THRESHOLD = 600;   // px — abaixo disso, marca proporcionalmente menor
const SMALL_IMAGE_RATIO = 0.40;      // ocupa 40% da menor dimensão em fotos pequenas

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
 * Aplica a marca d'água da imobiliária centralizada na imagem
 * (branca, translúcida, ~26% da largura). Retorna um novo File JPEG q=0.9.
 * Em caso de falha, devolve o arquivo original.
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

    // Calcula tamanho proporcional, com fallback para imagens pequenas.
    const logoRatio = logo.naturalHeight / logo.naturalWidth;
    const minSide = Math.min(canvas.width, canvas.height);

    let targetW: number;
    if (canvas.width < SMALL_IMAGE_THRESHOLD) {
      targetW = minSide * SMALL_IMAGE_RATIO;
    } else {
      targetW = canvas.width * WATERMARK_WIDTH_RATIO;
    }
    const targetH = targetW * logoRatio;

    // Centraliza horizontal e verticalmente.
    const x = (canvas.width - targetW) / 2;
    const y = (canvas.height - targetH) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.globalAlpha = WATERMARK_OPACITY;
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
