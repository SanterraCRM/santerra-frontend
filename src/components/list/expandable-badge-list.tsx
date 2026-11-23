'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';

import { BADGE_LIST_ITEM_CLASS } from './badge-list';

const DEFAULT_LIMIT = 5;

type ExpandableBadgeListProps = {
  labels: string[];
  limit?: number;
};

export function ExpandableBadgeList({ labels, limit = DEFAULT_LIMIT }: ExpandableBadgeListProps) {
  const [expanded, setExpanded] = useState(false);

  if (labels.length === 0) {
    return '—';
  }

  const hiddenCount = labels.length - limit;
  const visible = expanded || hiddenCount <= 0 ? labels : labels.slice(0, limit);

  return (
    <span className='flex flex-wrap gap-1'>
      {visible.map((label) => (
        <Badge key={label} variant='outline' className={BADGE_LIST_ITEM_CLASS}>
          {label}
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <Badge asChild variant='outline'>
          <button
            type='button'
            aria-expanded={expanded}
            aria-label={expanded ? 'Mostrar menos' : `Mostrar mais ${hiddenCount}`}
            onClick={() => setExpanded((current) => !current)}
            className='cursor-pointer border-dashed text-muted-foreground hover:bg-muted hover:text-foreground'
          >
            {expanded ? 'Mostrar menos' : `+${hiddenCount}`}
          </button>
        </Badge>
      )}
    </span>
  );
}
