import { useState } from 'react';

export function useMutation<TArgs extends unknown[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>,
) {
  const [isPending, setIsPending] = useState(false);

  async function mutate(...args: TArgs): Promise<TResult> {
    setIsPending(true);

    try {
      return await mutationFn(...args);
    } finally {
      setIsPending(false);
    }
  }

  return { mutate, isPending };
}
