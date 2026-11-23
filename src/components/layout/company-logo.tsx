import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';
import { getCompanyLogoUrl } from '@/lib/company-logo';
import { getInitials } from '@/lib/initials';

const SIZES = {
  sm: { root: 'size-5 rounded-md after:rounded-md', text: 'text-[9px]' },
  md: { root: 'size-9 rounded-lg after:rounded-lg', text: 'text-xs' },
  lg: { root: 'size-12 rounded-xl after:rounded-xl', text: 'text-base' },
  xl: { root: 'size-16 rounded-2xl after:rounded-2xl', text: 'text-lg' },
};

type CompanyLogoProps = {
  company: {
    id: string;
    name: string;
    logo: string | null;
  };
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
};

export function CompanyLogo({ company, src, size = 'md', className }: CompanyLogoProps) {
  const imageSrc = src === undefined ? getCompanyLogoUrl(company) : src;

  return (
    <Avatar className={cn(SIZES[size].root, className)}>
      {imageSrc && (
        <AvatarImage
          src={imageSrc}
          alt=''
          className='rounded-[inherit] bg-white object-contain'
        />
      )}
      <AvatarFallback
        className={cn(
          'rounded-[inherit] bg-linear-to-br from-brand-400 to-brand-600 font-bold text-white',
          SIZES[size].text,
        )}
      >
        {getInitials(company.name)}
      </AvatarFallback>
    </Avatar>
  );
}
