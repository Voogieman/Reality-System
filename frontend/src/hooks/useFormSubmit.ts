import { useCallback, useState } from 'react';
import { getResponseMessage } from '../lib/api/client';
import type { ApiResponse, FormResult } from '../lib/api/types';

type SubmitOptions = {
  successFallback: string;
  errorFallback?: string;
};

export function useFormSubmit() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FormResult | null>(null);

  const submit = useCallback(
    async (
      action: () => Promise<ApiResponse>,
      { successFallback, errorFallback = 'Ошибка связи с сервером. Запусти backend: npm run start:dev' }: SubmitOptions,
    ) => {
      setLoading(true);
      setResult(null);

      try {
        const response = await action();
        const text =
          typeof response.message === 'string' && response.message.length > 0
            ? response.message
            : getResponseMessage(response, successFallback);
        setResult({
          type: 'success',
          text,
        });
        return true;
      } catch (err) {
        setResult({
          type: 'error',
          text: err instanceof Error ? err.message : errorFallback,
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { loading, result, submit, setResult };
}
