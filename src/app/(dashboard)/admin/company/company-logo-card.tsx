'use client';

import { ImageUp, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { type ChangeEvent, useRef, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDeleteDialog } from '@/components/crud/confirm-delete-dialog';
import { CompanyLogo } from '@/components/layout/company-logo';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateCompanyLogo } from '@/hooks/company/use-update-company-logo';
import { getApiErrorMessage } from '@/lib/api';
import { COMPANY_LOGO_ACCEPT, COMPANY_LOGO_HINT } from '@/lib/company-logo';
import type { Company } from '@/types/company';

import { COMPANY_LOGO_REMOVE_TEXTS } from './company-config';

type CompanyLogoCardProps = {
  company: Pick<Company, 'id' | 'name' | 'logo'>;
};

export default function CompanyLogoCard({ company }: CompanyLogoCardProps) {
  const router = useRouter();
  const { update: refreshSession } = useSession();
  const { mutate: uploadLogo, isPending: isUploading } = useUpdateCompanyLogo();
  const inputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  async function refreshCompany() {
    await refreshSession();
    router.refresh();
  }

  async function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    const [file] = event.target.files ?? [];
    event.target.value = '';

    if (!file) {
      return;
    }

    setErrorMessage(null);

    try {
      await uploadLogo(file);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, 'Não foi possível enviar a logo agora. Tente novamente.'),
      );
      return;
    }

    await refreshCompany();
    toast.success('Logo atualizada.');
  }

  return (
    <Card className='animate-fade-up [animation-delay:160ms]'>
      <CardHeader>
        <CardTitle>Logo</CardTitle>
        <CardDescription>
          Aparece no topo do menu, na escolha de empresa, no menu da conta e no Início.{' '}
          {COMPANY_LOGO_HINT}
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-col gap-4'>
        {errorMessage && <Alert variant='error'>{errorMessage}</Alert>}

        <div className='flex flex-wrap items-center gap-4'>
          <CompanyLogo company={company} size='xl' />

          <div className='flex flex-wrap gap-2'>
            <input
              ref={inputRef}
              type='file'
              accept={COMPANY_LOGO_ACCEPT}
              tabIndex={-1}
              aria-hidden='true'
              className='sr-only'
              onChange={handleSelect}
            />
            <Button
              type='button'
              variant='outline'
              loading={isUploading}
              loadingText='Enviando...'
              onClick={() => inputRef.current?.click()}
            >
              <ImageUp />
              {company.logo ? 'Trocar logo' : 'Enviar logo'}
            </Button>

            {company.logo && (
              <ConfirmDeleteDialog
                {...COMPANY_LOGO_REMOVE_TEXTS}
                recordName='a logo'
                deletePath='/companies/current/logo'
                open={isRemoveOpen}
                onOpenChange={setIsRemoveOpen}
                onDeleted={refreshCompany}
              >
                <Button type='button' variant='ghost' disabled={isUploading}>
                  <Trash2 />
                  Remover
                </Button>
              </ConfirmDeleteDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
