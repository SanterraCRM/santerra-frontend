'use client';

import { ImagePlus, ImageUp, Trash2 } from 'lucide-react';
import { type ChangeEvent, useEffect, useId, useRef, useState } from 'react';

import { CompanyLogo } from '@/components/layout/company-logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import {
  COMPANY_LOGO_ACCEPT,
  COMPANY_LOGO_HINT,
  getCompanyLogoValidationError,
} from '@/lib/company-logo';

type LogoPreview = {
  file: File;
  url: string;
};

type CompanyLogoInputProps = {
  id?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
};

export function CompanyLogoInput({ id, value, onChange, disabled }: CompanyLogoInputProps) {
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<LogoPreview | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const previewUrl = value && preview?.file === value ? preview.url : null;

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    },
    [],
  );

  function replacePreview(next: LogoPreview | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    previewUrlRef.current = next?.url ?? null;
    setPreview(next);
  }

  function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    const [file] = event.target.files ?? [];
    event.target.value = '';

    if (!file) {
      return;
    }

    const validationError = getCompanyLogoValidationError(file);
    setErrorMessage(validationError);

    if (validationError) {
      return;
    }

    replacePreview({ file, url: URL.createObjectURL(file) });
    onChange(file);
  }

  function handleRemove() {
    replacePreview(null);
    setErrorMessage(null);
    onChange(null);
  }

  return (
    <div className='flex flex-wrap items-center gap-4'>
      {value && previewUrl ? (
        <CompanyLogo company={{ id: '', name: value.name, logo: null }} src={previewUrl} size='xl' />
      ) : (
        <span
          aria-hidden='true'
          className='flex size-16 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-input bg-muted/40 text-muted-foreground'
        >
          <ImagePlus className='size-6' />
        </span>
      )}

      <div className='flex min-w-0 flex-1 flex-col gap-2'>
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
            id={id}
            type='button'
            variant='outline'
            disabled={disabled}
            aria-describedby={hintId}
            onClick={() => inputRef.current?.click()}
          >
            <ImageUp />
            {value ? 'Trocar logo' : 'Escolher logo'}
          </Button>
          {value && (
            <Button type='button' variant='ghost' disabled={disabled} onClick={handleRemove}>
              <Trash2 />
              Remover
            </Button>
          )}
        </div>
        <p
          id={hintId}
          role={errorMessage ? 'alert' : undefined}
          className={cn('text-sm', errorMessage ? 'text-destructive' : 'text-muted-foreground')}
        >
          {errorMessage ?? COMPANY_LOGO_HINT}
        </p>
      </div>
    </div>
  );
}
