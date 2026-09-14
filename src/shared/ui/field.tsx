import * as React from 'react';

import { Label } from '@/shared/ui/primitives';
import { cn } from '@/shared/ui/utils';

interface FieldControlProps {
  id?: string;
  'aria-invalid'?: boolean | React.AriaAttributes['aria-invalid'];
  'aria-describedby'?: string;
}

interface RequiredFieldControlProps {
  id: string;
  'aria-invalid': boolean | React.AriaAttributes['aria-invalid'];
  'aria-describedby': string | undefined;
}

interface FieldProps {
  id: string;
  label: React.ReactNode;
  help?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
  /**
   * The control. Accepts either the control element directly (its props are
   * merged in via `cloneElement`), or a render function - used when the
   * actual control is nested inside something like `Controller`, so the
   * field props can be threaded through by hand instead of landing on the
   * wrapper and being discarded.
   */
  children:
    | React.ReactElement<FieldControlProps>
    | ((controlProps: RequiredFieldControlProps) => React.ReactElement);
}

function Field({ id, label, help, error, className, children }: FieldProps) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

  const control =
    typeof children === 'function'
      ? children({
          id,
          'aria-invalid': !!error,
          'aria-describedby': describedBy,
        })
      : React.cloneElement(children, {
          id,
          'aria-invalid': !!error || children.props['aria-invalid'],
          'aria-describedby':
            [describedBy, children.props['aria-describedby']]
              .filter(Boolean)
              .join(' ') || undefined,
        });

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      {control}
      {help && (
        <p id={helpId} className="text-sm text-muted-foreground">
          {help}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export { Field };
export type { FieldProps };
