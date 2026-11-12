import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { ApiError, apiRequest } from '@/lib/api';
import { getFileValidationError } from '@/lib/files';
import type { StoredFile } from '@/types/file';

export function useUploadFile() {
  const { data: session } = useSession();

  return useMutation(async (file: File) => {
    const validationError = getFileValidationError(file);

    if (validationError) {
      throw new ApiError(validationError, 400, 'VALIDATION_ERROR');
    }

    const body = new FormData();
    body.append('file', file);

    return apiRequest<StoredFile>('/files', {
      method: 'POST',
      body,
      token: session?.accessToken,
    });
  });
}
