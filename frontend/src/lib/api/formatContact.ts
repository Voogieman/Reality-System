import type { ApiResponse } from './types';

export function formatContactResponse(response: ApiResponse, fallback: string): string {
  const lines: string[] = [];
  const msg = typeof response.message === 'string' ? response.message : fallback;
  lines.push(msg);

  const data = response.data as Record<string, unknown> | undefined;
  const oracle = data?.oracle as { prophecy?: string } | null | undefined;

  if (oracle?.prophecy) {
    lines.push('');
    lines.push('— Пророчество —');
    lines.push(oracle.prophecy);
  } else if (typeof response.guidance === 'string' && response.guidance.length > 20) {
    lines.push('');
    lines.push(response.guidance);
  }

  return lines.join('\n');
}
