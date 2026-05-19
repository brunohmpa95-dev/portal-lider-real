import { useState } from 'react';
import { Share2, Copy, Check, MessageCircle, Mail, Facebook, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  label?: string;
}

const ShareButton = ({
  url,
  title,
  description = '',
  className,
  variant = 'outline',
  size = 'sm',
  label = 'Compartilhar',
}: ShareButtonProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = description ? `${title} — ${description}` : title;

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, text: shareText, url });
        return true;
      } catch {
        // user cancelled or not allowed; fall back to popover
      }
    }
    return false;
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shared = await handleNativeShare();
    if (!shared) setOpen(true);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: 'Link copiado', description: 'Cole onde quiser para compartilhar.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Erro ao copiar', description: 'Tente novamente.', variant: 'destructive' });
    }
  };

  const enc = encodeURIComponent;
  const links = {
    whatsapp: `https://wa.me/?text=${enc(`${shareText}\n${url}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    telegram: `https://t.me/share/url?url=${enc(url)}&text=${enc(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(shareText)}`,
    email: `mailto:?subject=${enc(title)}&body=${enc(`${shareText}\n\n${url}`)}`,
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          className={className}
          onClick={handleClick}
          aria-label={label}
        >
          <Share2 className="h-4 w-4" />
          {size !== 'icon' && <span className="ml-1.5">{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1.5" align="end">
        <button
          onClick={copyLink}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm hover:bg-secondary transition-colors text-left"
        >
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copiado!' : 'Copiar link'}
        </button>
        <a
          href={links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm hover:bg-secondary transition-colors"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <a
          href={links.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm hover:bg-secondary transition-colors"
        >
          <Facebook className="h-4 w-4" /> Facebook
        </a>
        <a
          href={links.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm hover:bg-secondary transition-colors"
        >
          <Send className="h-4 w-4" /> Telegram
        </a>
        <a
          href={links.email}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm hover:bg-secondary transition-colors"
        >
          <Mail className="h-4 w-4" /> E-mail
        </a>
      </PopoverContent>
    </Popover>
  );
};

export default ShareButton;
