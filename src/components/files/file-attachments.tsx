'use client';

import { Download, Eye, File as FileIcon, FileSpreadsheet, FileText, Paperclip, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { type ChangeEvent, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { useUploadFile } from '@/hooks/files/use-upload-file';
import { getApiErrorMessage } from '@/lib/api';
import {
  ACCEPTED_FILES,
  ACCEPTED_FILES_HINT,
  getFileUrl,
  isImageFile,
  isSpreadsheetFile,
} from '@/lib/files';
import { formatFileSize } from '@/lib/format';
import type { StoredFile } from '@/types/file';

type PendingUpload = {
  key: string;
  name: string;
};

type UploadError = PendingUpload & {
  message: string;
};

type FileAttachmentsProps = {
  files: StoredFile[];
  onChange?: (files: StoredFile[]) => void;
  canUpload?: boolean;
  canRemove?: boolean;
  onUploadingChange?: (isUploading: boolean) => void;
};

function getFileName(file: StoredFile): string {
  return file.originalName ?? 'Arquivo sem nome';
}

function toPendingUpload(file: File, index: number): PendingUpload {
  return { key: `${file.name}-${file.size}-${file.lastModified}-${index}`, name: file.name };
}

function FileThumbnail({ file }: { file: StoredFile }) {
  if (isImageFile(file.mimeType)) {
    return (
      <Image
        src={getFileUrl(file.id)}
        alt=''
        width={40}
        height={40}
        unoptimized
        className='size-10 shrink-0 rounded-md border object-cover'
      />
    );
  }

  const Icon = isSpreadsheetFile(file.mimeType)
    ? FileSpreadsheet
    : file.mimeType.includes('presentation') || file.mimeType.includes('powerpoint')
      ? FileIcon
      : FileText;

  return (
    <span className='flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground'>
      <Icon className='size-5' />
    </span>
  );
}

export function FileAttachments({
  files,
  onChange,
  canUpload = false,
  canRemove = false,
  onUploadingChange,
}: FileAttachmentsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadFile } = useUploadFile();
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [errors, setErrors] = useState<UploadError[]>([]);
  const [preview, setPreview] = useState<StoredFile | null>(null);
  const isUploading = pending.length > 0;

  async function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    const selected = [...(event.target.files ?? [])];
    event.target.value = '';

    if (selected.length === 0 || !onChange) {
      return;
    }

    const uploads = selected.map(toPendingUpload);
    const uploaded: StoredFile[] = [];
    const failures: UploadError[] = [];

    setErrors([]);
    setPending(uploads);
    onUploadingChange?.(true);

    for (const [index, file] of selected.entries()) {
      try {
        uploaded.push(await uploadFile(file));
      } catch (error) {
        failures.push({
          ...uploads[index],
          message: getApiErrorMessage(error, 'Não foi possível enviar o arquivo. Tente novamente.'),
        });
      }

      setPending((current) => current.slice(1));
    }

    setErrors(failures);
    onUploadingChange?.(false);

    if (uploaded.length > 0) {
      onChange([...files, ...uploaded]);
    }
  }

  return (
    <div className='flex flex-col gap-3'>
      {files.length === 0 && !isUploading ? (
        <p className='text-sm font-normal text-muted-foreground'>Nenhum anexo.</p>
      ) : (
        <ul className='flex flex-col divide-y rounded-lg border'>
          {files.map((file) => {
            const name = getFileName(file);

            return (
              <li key={file.id} className='flex items-center gap-3 px-3 py-2'>
                <FileThumbnail file={file} />
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium text-foreground'>{name}</p>
                  <p className='text-xs font-normal text-muted-foreground'>
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <div className='flex shrink-0 items-center gap-1'>
                  {isImageFile(file.mimeType) && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon-sm'
                      aria-label={`Visualizar ${name}`}
                      className='text-muted-foreground'
                      onClick={() => setPreview(file)}
                    >
                      <Eye />
                    </Button>
                  )}
                  <Button asChild variant='ghost' size='icon-sm' className='text-muted-foreground'>
                    <a href={getFileUrl(file.id)} download={name} aria-label={`Baixar ${name}`}>
                      <Download />
                    </a>
                  </Button>
                  {onChange && canRemove && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon-sm'
                      aria-label={`Remover ${name}`}
                      disabled={isUploading}
                      className='text-muted-foreground hover:text-destructive'
                      onClick={() => onChange(files.filter(({ id }) => id !== file.id))}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
          {pending.map((upload) => (
            <li
              key={upload.key}
              className='flex items-center gap-3 px-3 py-2 text-sm font-normal text-muted-foreground'
            >
              <span className='flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted'>
                <Spinner />
              </span>
              <span className='truncate'>Enviando {upload.name}…</span>
            </li>
          ))}
        </ul>
      )}

      {errors.length > 0 && (
        <ul role='alert' className='flex flex-col gap-1 text-sm font-normal text-destructive'>
          {errors.map((error) => (
            <li key={error.key}>
              <span className='font-medium'>{error.name}</span>: {error.message}
            </li>
          ))}
        </ul>
      )}

      {onChange && canUpload && (
        <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
          <input
            ref={inputRef}
            type='file'
            multiple
            accept={ACCEPTED_FILES}
            tabIndex={-1}
            aria-hidden='true'
            className='sr-only'
            onChange={handleSelect}
          />
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            <Paperclip />
            Anexar arquivos
          </Button>
          <span className='text-xs font-normal text-muted-foreground'>{ACCEPTED_FILES_HINT}</span>
        </div>
      )}

      <Modal
        open={preview !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreview(null);
          }
        }}
        title={preview ? getFileName(preview) : ''}
        size='wide'
        cancelLabel='Fechar'
        actions={
          preview && (
            <Button asChild>
              <a href={getFileUrl(preview.id)} download={getFileName(preview)}>
                <Download />
                Baixar
              </a>
            </Button>
          )
        }
      >
        {preview && (
          <Image
            src={getFileUrl(preview.id)}
            alt={getFileName(preview)}
            width={1200}
            height={900}
            unoptimized
            className='h-auto max-h-[70vh] w-full rounded-md object-contain'
          />
        )}
      </Modal>
    </div>
  );
}
