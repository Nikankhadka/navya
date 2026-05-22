export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(dateKey: string, delta: number): string {
  const date = fromDateKey(dateKey);
  date.setDate(date.getDate() + delta);
  return toDateKey(date);
}

export function isToday(dateKey: string): boolean {
  return dateKey === getTodayDateString();
}

export function isFuture(dateKey: string): boolean {
  return dateKey > getTodayDateString();
}

export function formatDayLabel(dateKey: string): string {
  const date = fromDateKey(dateKey);
  const today = getTodayDateString();
  const yesterday = addDays(today, -1);

  if (dateKey === today) return 'Today';
  if (dateKey === yesterday) return 'Yesterday';

  return date.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatMonthYear(dateKey: string): string {
  const date = fromDateKey(dateKey);
  return date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
}

export function getWeekKeys(dateKey: string): string[] {
  const date = fromDateKey(dateKey);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(date.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const entry = new Date(monday);
    entry.setDate(monday.getDate() + i);
    return toDateKey(entry);
  });
}

export function getMonthGrid(dateKey: string): { dateKey: string; isCurrentMonth: boolean }[] {
  const date = fromDateKey(dateKey);
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay();
  const startDate = new Date(firstOfMonth);
  startDate.setDate(startDate.getDate() - (startDay === 0 ? 6 : startDay - 1));

  const result: { dateKey: string; isCurrentMonth: boolean }[] = [];

  for (let i = 0; i < 42; i++) {
    const entry = new Date(startDate);
    entry.setDate(startDate.getDate() + i);
    const key = toDateKey(entry);
    const isCurrentMonth = entry.getMonth() === month;

    result.push({ dateKey: key, isCurrentMonth });

    if (result.length >= 42) break;
  }

  return result;
}

export function getWeekDayLabels(): string[] {
  return ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
}
