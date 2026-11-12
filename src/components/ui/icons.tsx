import type { ComponentProps } from 'react';

type IconProps = ComponentProps<'svg'>;

function Icon({ children, className = 'size-5', ...props }: IconProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.8}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x='3' y='5' width='18' height='14' rx='2.5' />
      <path d='m4 7 8 6 8-6' />
    </Icon>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx='12' cy='8' r='4' />
      <path d='M4.5 20.5a7.5 7.5 0 0 1 15 0' />
    </Icon>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x='4.5' y='10.5' width='15' height='10' rx='2.5' />
      <path d='M8 10.5V7.5a4 4 0 0 1 8 0v3' />
    </Icon>
  );
}

export function KeyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx='8' cy='15' r='4' />
      <path d='m10.85 12.15 8.65-8.65M16.5 6.5l2.5 2.5M14 9l2 2' />
    </Icon>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d='M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z' />
      <circle cx='12' cy='12' r='3' />
    </Icon>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d='M10.6 5.6A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M6.5 6.9C3.9 8.6 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.8 0 3.3-.5 4.6-1.3' />
      <path d='M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18' />
    </Icon>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d='M19 12H5m6-6-6 6 6 6' />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d='m9 6 6 6-6 6' />
    </Icon>
  );
}

export function BuildingIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d='M4 20.5V5.5A1.5 1.5 0 0 1 5.5 4h8A1.5 1.5 0 0 1 15 5.5v15M15 10h3.5a1.5 1.5 0 0 1 1.5 1.5v9M2.5 20.5h19' />
      <path d='M8 8h3M8 12h3M8 16h3' />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d='m5 12.5 4.5 4.5L19 7.5' />
    </Icon>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx='12' cy='12' r='9' />
      <path d='m8.5 12.5 2.5 2.5 4.5-5' />
    </Icon>
  );
}

export function AlertCircleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx='12' cy='12' r='9' />
      <path d='M12 7.5v5.5m0 3.5h.01' />
    </Icon>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx='12' cy='12' r='9' />
      <path d='M12 11v5.5m0-9h.01' />
    </Icon>
  );
}
