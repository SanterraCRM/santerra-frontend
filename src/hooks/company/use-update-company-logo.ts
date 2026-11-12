import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { ApiError, apiRequest } from '@/lib/api';
import { getCompanyLogoValidationError } from '@/lib/company-logo';
import type { Company } from '@/types/company';

export function useUpdateCompanyLogo() {
  const { data: session } = useSession();

  return useMutation(async (file: File) => {
    const validationError = getCompanyLogoValidationError(file);

    if (validationError) {
      throw new ApiError(validationError, 400, 'VALIDATION_ERROR');
    }

    const body = new FormData();
    body.append('file', file);

    return apiRequest<Company>('/companies/current/logo', {
      method: 'PUT',
      body,
      token: session?.accessToken,
    });
  });
}
