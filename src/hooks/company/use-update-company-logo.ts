import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { ApiError, apiRequest } from '@/lib/api';
import { getCompanyLogoValidationError, toCompanyLogoFormData } from '@/lib/company-logo';
import type { Company } from '@/types/company';

export function useUpdateCompanyLogo() {
  const { data: session } = useSession();

  return useMutation(async (file: File) => {
    const validationError = getCompanyLogoValidationError(file);

    if (validationError) {
      throw new ApiError(validationError, 400, 'VALIDATION_ERROR');
    }

    return apiRequest<Company>('/companies/current/logo', {
      method: 'PUT',
      body: toCompanyLogoFormData(file),
      token: session?.accessToken,
    });
  });
}
