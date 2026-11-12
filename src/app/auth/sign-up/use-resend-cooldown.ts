import { useEffect, useState } from 'react';

const RESEND_INTERVAL_IN_SECONDS = 60;
const MILLISECONDS_PER_SECOND = 1000;

export function useResendCooldown(codeSentAt: number | null): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), MILLISECONDS_PER_SECOND);

    return () => window.clearInterval(intervalId);
  }, []);

  if (codeSentAt === null) {
    return 0;
  }

  const resendAt = codeSentAt + RESEND_INTERVAL_IN_SECONDS * MILLISECONDS_PER_SECOND;
  const secondsLeft = Math.ceil((resendAt - now) / MILLISECONDS_PER_SECOND);

  return Math.min(RESEND_INTERVAL_IN_SECONDS, Math.max(0, secondsLeft));
}
