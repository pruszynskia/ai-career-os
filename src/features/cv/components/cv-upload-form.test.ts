import { describe, expect, it } from 'vitest';

import { isSupportedCvFile } from './cv-upload-form';

describe('isSupportedCvFile', () => {
  it('accepts .pdf and .docx, case-insensitively', () => {
    expect(isSupportedCvFile('resume.pdf')).toBe(true);
    expect(isSupportedCvFile('Resume.PDF')).toBe(true);
    expect(isSupportedCvFile('resume.docx')).toBe(true);
    expect(isSupportedCvFile('Resume.DOCX')).toBe(true);
  });

  it('rejects any other extension', () => {
    expect(isSupportedCvFile('resume.pages')).toBe(false);
    expect(isSupportedCvFile('resume.doc')).toBe(false);
    expect(isSupportedCvFile('resume.txt')).toBe(false);
    expect(isSupportedCvFile('resume')).toBe(false);
  });
});
