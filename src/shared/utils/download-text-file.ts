export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  // Revoke on the next tick (MISC-6) - revoking synchronously can abort the
  // download in some browsers before it has started reading the blob.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
