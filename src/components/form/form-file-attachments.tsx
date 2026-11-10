'use client';

import type { ReactNode } from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { FileAttachments } from '@/components/files/file-attachments';
import { FieldDescription, FieldError, FieldLegend, FieldSet } from '@/components/ui/field';
import type { AttachmentPermissions } from '@/lib/permissions';
import type { StoredFile } from '@/types/file';

type FormFileAttachmentsProps<TValues extends FieldValues, TContext, TTransformed> = {
  control: Control<TValues, TContext, TTransformed>;
  name: FieldPath<TValues>;
  label: string;
  permissions: AttachmentPermissions;
  description?: ReactNode;
  hideLabel?: boolean;
  onUploadingChange?: (isUploading: boolean) => void;
  className?: string;
};

export function FormFileAttachments<TValues extends FieldValues, TContext, TTransformed>({
  control,
  name,
  label,
  permissions,
  description,
  hideLabel = false,
  onUploadingChange,
  className,
}: FormFileAttachmentsProps<TValues, TContext, TTransformed>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FieldSet className={className} data-invalid={fieldState.invalid}>
          <FieldLegend variant='label' className={hideLabel ? 'sr-only' : undefined}>
            {label}
          </FieldLegend>
          {description && <FieldDescription>{description}</FieldDescription>}
          <FileAttachments
            files={(field.value as StoredFile[] | undefined) ?? []}
            onChange={field.onChange}
            canUpload={permissions.canUpload}
            canRemove={permissions.canRemove}
            onUploadingChange={onUploadingChange}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </FieldSet>
      )}
    />
  );
}
