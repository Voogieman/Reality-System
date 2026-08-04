import type { FormResult } from '../../lib/api/types';

type Props = {
  result: FormResult | null;
};

export function FormResultBox({ result }: Props) {
  if (!result) return null;
  return <div className={`result-box ${result.type}`}>{result.text}</div>;
}
