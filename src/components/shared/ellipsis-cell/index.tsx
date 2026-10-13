'use client';

import { useEffect, useRef, useState, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface EllipsisCellProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  maxLines?: number;
  className?: string;
}

/**
 * EllipsisCell
 * Standard residency-frontend cell component with automatic overflow detection.
 * Renders tooltip on hover only when text is clipped, avoiding mid-word cutting.
 */
export function EllipsisCell({
  value,
  maxLines = 1,
  className,
  ...props
}: EllipsisCellProps) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const checkOverflow = () => {
      setIsOverflowing(
        element.scrollWidth > element.clientWidth ||
          element.scrollHeight > element.clientHeight,
      );
    };

    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div
      ref={textRef}
      title={isOverflowing ? value : undefined}
      className={cn(
        'overflow-hidden',
        maxLines === 1 ? 'truncate whitespace-nowrap' : 'line-clamp-2 break-words',
        className,
      )}
      {...props}
    >
      {value}
    </div>
  );
}
