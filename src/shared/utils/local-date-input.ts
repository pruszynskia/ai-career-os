// `<input type="date">` reads/writes a bare 'YYYY-MM-DD'. `new Date('YYYY-MM-DD')`
// parses that as UTC midnight, which shifts a day for anyone not at UTC+0
// once rendered/compared in local time (PIPE-2/POST-2) - these two keep the
// input's value and a real Date in sync at local midnight instead.
export function parseLocalDateInput(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toDateInputValue(date: Date | null): string {
  if (!date) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// For a date input's `min`, so today stays selectable while anything
// earlier is blocked in the native picker.
export function todayDateInputValue(): string {
  return toDateInputValue(new Date());
}
