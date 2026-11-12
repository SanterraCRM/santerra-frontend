'use client';

import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  type Ref,
  useEffect,
  useRef,
} from 'react';

import { cn } from '@/lib/cn';
import { onlyDigits } from '@/lib/format';

type CodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  label: string;
  invalid?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  describedBy?: string;
  ref?: Ref<HTMLDivElement>;
};

export function CodeInput({
  value,
  onChange,
  onComplete,
  length = 6,
  label,
  invalid = false,
  readOnly = false,
  autoFocus = false,
  describedBy,
  ref,
}: CodeInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const valueRef = useRef(value);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  function focusInput(index: number) {
    inputsRef.current[Math.max(0, Math.min(index, length - 1))]?.focus();
  }

  function update(nextValue: string) {
    valueRef.current = nextValue;
    onChange(nextValue);
  }

  function fillFrom(index: number, typedDigits: string) {
    const nextDigits = valueRef.current.split('');

    typedDigits
      .slice(0, length - index)
      .split('')
      .forEach((digit, offset) => {
        nextDigits[index + offset] = digit;
      });

    const nextValue = nextDigits.join('');

    update(nextValue);
    focusInput(Math.min(index + typedDigits.length, length - 1));

    if (nextValue.length === length) {
      onComplete?.(nextValue);
    }
  }

  function handleChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const typedDigits = onlyDigits(event.target.value);

    if (readOnly || !typedDigits) {
      return;
    }

    fillFrom(typedDigits.length >= length ? 0 : index, typedDigits);
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();

    const pastedDigits = onlyDigits(event.clipboardData.getData('text'));

    if (readOnly || !pastedDigits) {
      return;
    }

    fillFrom(pastedDigits.length >= length ? 0 : index, pastedDigits);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (/^\d$/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();

      if (!readOnly) {
        fillFrom(index, event.key);
      }

      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusInput(Math.min(index + 1, valueRef.current.length));
      return;
    }

    if (event.key !== 'Backspace' || readOnly) {
      return;
    }

    event.preventDefault();

    const currentValue = valueRef.current;

    if (currentValue[index]) {
      update(currentValue.slice(0, index) + currentValue.slice(index + 1));
      return;
    }

    update(currentValue.slice(0, index - 1));
    focusInput(index - 1);
  }

  function handleFocus(index: number) {
    const currentLength = valueRef.current.length;

    if (index > currentLength) {
      focusInput(currentLength);
      return;
    }

    inputsRef.current[index]?.select();
  }

  return (
    <div
      ref={ref}
      role='group'
      aria-label={label}
      aria-describedby={describedBy}
      className='grid gap-2 sm:gap-3'
      style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          type='text'
          inputMode='numeric'
          pattern='[0-9]*'
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={autoFocus && index === 0}
          aria-label={`Dígito ${index + 1} de ${length}`}
          aria-invalid={invalid || undefined}
          readOnly={readOnly}
          value={digit}
          onChange={(event) => handleChange(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={() => handleFocus(index)}
          className={cn(
            'h-14 w-full rounded-xl border bg-white text-center text-2xl font-bold text-slate-900 shadow-sm shadow-slate-900/[0.03] caret-brand-600 outline-none transition focus:ring-4',
            invalid
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15'
              : digit
                ? 'border-brand-300 bg-brand-50/50 focus:border-brand-500 focus:ring-brand-500/15'
                : 'border-slate-200 hover:border-brand-300 focus:border-brand-500 focus:ring-brand-500/15',
          )}
        />
      ))}
    </div>
  );
}
