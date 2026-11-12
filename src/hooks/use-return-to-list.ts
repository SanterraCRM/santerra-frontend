import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useReturnToList(listHref: string) {
  const router = useRouter();

  return function returnToList(successMessage: string) {
    toast.success(successMessage);
    router.push(listHref);
  };
}
