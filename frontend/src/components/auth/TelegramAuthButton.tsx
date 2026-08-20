import { useEffect, useRef, useState } from 'react';
import { realityApi } from '../../lib/api/reality.api';
import type { TelegramAuthPayload } from '../../lib/api/types';

type Props = {
  onAuth: (payload: TelegramAuthPayload) => void;
};

export function TelegramAuthButton({ onAuth }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const onAuthRef = useRef(onAuth);
  onAuthRef.current = onAuth;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await realityApi.telegramConfig();
        const username = res.data?.botUsername;
        if (cancelled) return;
        if (!username || !hostRef.current) {
          setAvailable(false);
          return;
        }
        setAvailable(true);
        (window as unknown as { onTelegramAuth?: (user: TelegramAuthPayload) => void }).onTelegramAuth = (
          user,
        ) => {
          onAuthRef.current(user);
        };
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.async = true;
        script.setAttribute('data-telegram-login', username);
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        script.setAttribute('data-request-access', 'write');
        hostRef.current.innerHTML = '';
        hostRef.current.appendChild(script);
      } catch {
        if (!cancelled) setAvailable(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="telegram-login-wrap">
      <div ref={hostRef} />
      {available === false ? (
        <p className="oracle-auth-hint">
          Вход через Telegram появится, когда бот будет указан в TELEGRAM_BOT_USERNAME.
        </p>
      ) : null}
    </div>
  );
}
