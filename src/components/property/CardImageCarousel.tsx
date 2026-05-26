import { useRef, useState, type ReactNode, type TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  imgClassName?: string;
  children?: ReactNode;
  arrowSize?: 'sm' | 'md';
  showIndicators?: boolean;
}

const CardImageCarousel = ({
  images,
  alt,
  className,
  imgClassName,
  children,
  arrowSize = 'sm',
  showIndicators = true,
}: CardImageCarouselProps) => {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipedRef = useRef(false);

  const safeImages = images && images.length > 0 ? images : ['/placeholder.svg'];
  const hasMany = safeImages.length > 1;

  const goTo = (next: number) => {
    const total = safeImages.length;
    setIndex(((next % total) + total) % total);
  };

  const handleNav = (e: React.MouseEvent, dir: 1 | -1) => {
    e.preventDefault();
    e.stopPropagation();
    goTo(index + dir);
  };

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swipedRef.current = false;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      // horizontal gesture — prevent card link
      swipedRef.current = true;
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) > 40 && hasMany) {
      e.stopPropagation();
      goTo(index + (dx < 0 ? 1 : -1));
    }
  };

  const onClickCapture = (e: React.MouseEvent) => {
    // If a swipe just happened, block the upcoming click from triggering the card link
    if (swipedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      swipedRef.current = false;
    }
  };

  const btnSize = arrowSize === 'md' ? 'h-9 w-9' : 'h-8 w-8';
  const iconSize = arrowSize === 'md' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <div
      className={cn('group/carousel relative overflow-hidden', className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClickCapture={onClickCapture}
    >
      <img
        src={safeImages[index]}
        alt={alt}
        loading="lazy"
        className={cn('w-full h-full object-cover transition-opacity duration-200', imgClassName)}
        key={index}
      />

      {children}

      {hasMany && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={(e) => handleNav(e, -1)}
            className={cn(
              'absolute left-2 top-1/2 -translate-y-1/2 z-20',
              btnSize,
              'rounded-full flex items-center justify-center',
              'bg-white/15 backdrop-blur-md border border-white/25 text-white',
              'shadow-sm transition-all duration-200',
              'opacity-70 md:opacity-0 md:group-hover/carousel:opacity-100 hover:bg-white/25 hover:opacity-100',
              'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
            )}
          >
            <ChevronLeft className={iconSize} />
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={(e) => handleNav(e, 1)}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 z-20',
              btnSize,
              'rounded-full flex items-center justify-center',
              'bg-white/15 backdrop-blur-md border border-white/25 text-white',
              'shadow-sm transition-all duration-200',
              'opacity-70 md:opacity-0 md:group-hover/carousel:opacity-100 hover:bg-white/25 hover:opacity-100',
              'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
            )}
          >
            <ChevronRight className={iconSize} />
          </button>

          {showIndicators && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              {safeImages.length <= 6 ? (
                <div className="flex items-center gap-1">
                  {safeImages.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'h-1.5 w-1.5 rounded-full transition-all',
                        i === index ? 'bg-white w-3' : 'bg-white/50',
                      )}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-[10px] font-mono text-white bg-black/30 backdrop-blur-sm rounded px-1.5 py-0.5">
                  {index + 1} / {safeImages.length}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CardImageCarousel;
