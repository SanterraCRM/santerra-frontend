import { cn } from '@/lib/cn';
import { MIN_PASSWORD_LENGTH } from '@/lib/password';

const STRENGTH_LEVELS = [
  { label: 'Fraca', barClassName: 'bg-red-500', textClassName: 'text-red-600' },
  { label: 'Razoável', barClassName: 'bg-amber-500', textClassName: 'text-amber-600' },
  { label: 'Boa', barClassName: 'bg-brand-500', textClassName: 'text-brand-600' },
  { label: 'Forte', barClassName: 'bg-emerald-500', textClassName: 'text-emerald-600' },
];

function getPasswordScore(password: string): number {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return 1;
  }

  const checks = [
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
    password.length >= 12,
  ];

  return Math.min(STRENGTH_LEVELS.length, 1 + checks.filter(Boolean).length);
}

type PasswordStrengthProps = {
  password: string;
};

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) {
    return null;
  }

  const score = getPasswordScore(password);
  const level = STRENGTH_LEVELS[score - 1];

  return (
    <div className='-mt-2 flex items-center gap-3' aria-live='polite'>
      <div className='grid flex-1 grid-cols-4 gap-1.5'>
        {STRENGTH_LEVELS.map((strengthLevel, index) => (
          <span
            key={strengthLevel.label}
            className={cn(
              'h-1.5 rounded-full transition-colors duration-300',
              index < score ? level.barClassName : 'bg-slate-200',
            )}
          />
        ))}
      </div>
      <span className={cn('w-16 text-right text-xs font-semibold', level.textClassName)}>
        {level.label}
      </span>
    </div>
  );
}
