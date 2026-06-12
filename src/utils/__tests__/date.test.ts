// @ts-nocheck
import {
  toDateKey,
  getTodayDateString,
  fromDateKey,
  addDays,
  isToday,
  isFuture,
  formatDayLabel,
  formatMonthYear,
  getMonthGrid,
  getWeekDayLabels,
} from '../date';

describe('toDateKey', () => {
  it('returns YYYY-MM-DD from local Date', () => {
    const d = new Date(2026, 5, 12); // June 12, 2026
    expect(toDateKey(d)).toBe('2026-06-12');
  });

  it('pads single-digit months and days', () => {
    const d = new Date(2026, 0, 3); // Jan 3
    expect(toDateKey(d)).toBe('2026-01-03');
  });

  it('handles end of month', () => {
    const d = new Date(2026, 11, 31); // Dec 31
    expect(toDateKey(d)).toBe('2026-12-31');
  });

  it('does not use UTC for timezone-shifted dates', () => {
    // Create a date at midnight local time
    const d = new Date(2026, 5, 15);
    // The key should match the local date, regardless of timezone
    expect(d.getDate()).toBe(15);
    expect(toDateKey(d)).toBe('2026-06-15');
  });
});

describe('getTodayDateString', () => {
  it('returns a YYYY-MM-DD string', () => {
    const result = getTodayDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches toDateKey(new Date())', () => {
    expect(getTodayDateString()).toBe(toDateKey(new Date()));
  });
});

describe('fromDateKey', () => {
  it('parses YYYY-MM-DD to local midnight Date', () => {
    const d = fromDateKey('2026-06-12');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5); // 0-indexed
    expect(d.getDate()).toBe(12);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });

  it('correctly round-trips with toDateKey', () => {
    const key = '2026-06-12';
    const d = fromDateKey(key);
    expect(toDateKey(d)).toBe(key);
  });
});

describe('addDays', () => {
  it('adds days forward', () => {
    expect(addDays('2026-06-12', 3)).toBe('2026-06-15');
  });

  it('subtracts days backward', () => {
    expect(addDays('2026-06-12', -3)).toBe('2026-06-09');
  });

  it('crosses month boundary forward', () => {
    expect(addDays('2026-06-30', 2)).toBe('2026-07-02');
  });

  it('crosses month boundary backward', () => {
    expect(addDays('2026-06-01', -2)).toBe('2026-05-30');
  });

  it('zero delta returns same date', () => {
    expect(addDays('2026-06-12', 0)).toBe('2026-06-12');
  });
});

describe('isToday', () => {
  it('returns true for today', () => {
    const today = getTodayDateString();
    expect(isToday(today)).toBe(true);
  });

  it('returns false for yesterday', () => {
    const yesterday = addDays(getTodayDateString(), -1);
    expect(isToday(yesterday)).toBe(false);
  });

  it('returns false for tomorrow', () => {
    const tomorrow = addDays(getTodayDateString(), 1);
    expect(isToday(tomorrow)).toBe(false);
  });
});

describe('isFuture', () => {
  it('returns true for tomorrow', () => {
    const tomorrow = addDays(getTodayDateString(), 1);
    expect(isFuture(tomorrow)).toBe(true);
  });

  it('returns false for today', () => {
    expect(isFuture(getTodayDateString())).toBe(false);
  });

  it('returns false for yesterday', () => {
    const yesterday = addDays(getTodayDateString(), -1);
    expect(isFuture(yesterday)).toBe(false);
  });

  it('returns false for dates far in the past', () => {
    expect(isFuture('2020-01-01')).toBe(false);
  });
});

describe('formatDayLabel', () => {
  it('returns "Today" for today', () => {
    expect(formatDayLabel(getTodayDateString())).toBe('Today');
  });

  it('returns "Yesterday" for yesterday', () => {
    const yesterday = addDays(getTodayDateString(), -1);
    expect(formatDayLabel(yesterday)).toBe('Yesterday');
  });

  it('returns formatted date for other dates', () => {
    const label = formatDayLabel('2026-06-09');
    // Should include abbreviated weekday, day, and month
    expect(label).toMatch(/^\w{3}, \d{1,2} \w+/);
    expect(label).not.toBe('Today');
    expect(label).not.toBe('Yesterday');
  });
});

describe('formatMonthYear', () => {
  it('returns "long month year" format', () => {
    expect(formatMonthYear('2026-06-12')).toBe('June 2026');
  });

  it('returns correct month for January', () => {
    expect(formatMonthYear('2026-01-15')).toBe('January 2026');
  });

  it('returns correct month for December', () => {
    expect(formatMonthYear('2026-12-01')).toBe('December 2026');
  });
});

describe('getMonthGrid', () => {
  it('returns exactly 42 entries (6 weeks × 7 days)', () => {
    const grid = getMonthGrid('2026-06-12');
    expect(grid).toHaveLength(42);
  });

  it('starts on a Monday', () => {
    const grid = getMonthGrid('2026-06-12');
    const firstDate = fromDateKey(grid[0].dateKey);
    expect(firstDate.getDay()).toBe(1); // Monday
  });

  it('contains dates from the correct month', () => {
    const grid = getMonthGrid('2026-06-12');
    const juneDates = grid.filter((entry) => entry.isCurrentMonth);
    expect(juneDates.length).toBe(30); // June has 30 days
  });

  it('every dateKey is valid YYYY-MM-DD', () => {
    const grid = getMonthGrid('2026-06-12');
    for (const entry of grid) {
      expect(entry.dateKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('cells are in sequential order', () => {
    const grid = getMonthGrid('2026-06-12');
    for (let i = 1; i < grid.length; i++) {
      const prev = grid[i - 1].dateKey;
      const curr = grid[i].dateKey;
      expect(addDays(prev, 1)).toBe(curr);
    }
  });

  it('works for months where 1st is Sunday', () => {
    // June 2025: June 1 is Sunday
    const grid = getMonthGrid('2025-06-15');
    const firstDate = fromDateKey(grid[0].dateKey);
    expect(firstDate.getDay()).toBe(1); // Monday start
    // The first day should be May 26 (the Monday before June 1, which is Sunday)
    expect(grid[0].dateKey).toBe('2025-05-26');
  });

  it('works for months where 1st is Monday', () => {
    // June 2026: June 1 is Monday
    const grid = getMonthGrid('2026-06-12');
    // The first cell should be June 1 itself
    expect(grid[0].dateKey).toBe('2026-06-01');
    expect(grid[0].isCurrentMonth).toBe(true);
  });
});

describe('getWeekDayLabels', () => {
  it('returns 7 labels Monday through Sunday', () => {
    const labels = getWeekDayLabels();
    expect(labels).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
  });
});
