import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// tailwind-merge's default `text-color` group is a catch-all, so the v4
// @theme font-size tokens in globals.css (text-body-sm, text-h1, ...) are
// classified as colors and silently dropped whenever a real color class is
// present in the same cn() call. Register them as font-size instead.
//
// This list is hand-mirrored from the --text-* tokens in
// src/app/globals.css (@theme inline block). Adding a new token there
// without adding it here reintroduces the bug silently.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'label',
            'body-sm',
            'body',
            'body-lg',
            'h3',
            'h2',
            'h1',
            'display',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
