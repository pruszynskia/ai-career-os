import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import { extractCvText, UnsupportedFileTypeError } from './extract-cv-text';

describe('extractCvText input guards', () => {
  it('rejects a file whose bytes do not match its extension', async () => {
    await expect(
      extractCvText(Buffer.from('<html>not a pdf</html>'), 'cv.pdf'),
    ).rejects.toBeInstanceOf(UnsupportedFileTypeError);
    await expect(
      extractCvText(Buffer.from('%PDF-1.7'), 'cv.docx'),
    ).rejects.toBeInstanceOf(UnsupportedFileTypeError);
  });

  it('rejects a file over 4 MB', async () => {
    const big = Buffer.alloc(4 * 1024 * 1024 + 1);
    big.write('%PDF-');
    await expect(extractCvText(big, 'cv.pdf')).rejects.toThrow(/too large/);
  });

  it('rejects a DOCX zip bomb without inflating it', async () => {
    const zip = new JSZip();
    zip.file('word/document.xml', Buffer.alloc(60 * 1024 * 1024));
    const bomb = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
    expect(bomb.length).toBeLessThan(4 * 1024 * 1024);
    await expect(extractCvText(bomb, 'cv.docx')).rejects.toThrow(
      /unreasonable size/,
    );
  });
});
