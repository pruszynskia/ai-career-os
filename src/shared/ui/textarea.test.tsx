import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Textarea } from './textarea';

describe('Textarea', () => {
  it('renders a plain control when no maxLength is set', () => {
    const html = renderToStaticMarkup(<Textarea defaultValue="hello" />);
    expect(html.startsWith('<textarea')).toBe(true);
    expect(html.endsWith('</textarea>')).toBe(true);
  });

  it('shows a character count when maxLength is set', () => {
    const html = renderToStaticMarkup(
      <Textarea defaultValue="hello" maxLength={100} />,
    );
    expect(html).toContain('5/100');
  });
});
