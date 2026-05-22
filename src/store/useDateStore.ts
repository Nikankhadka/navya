import { create } from 'zustand';
import { getTodayDateString } from '@/utils/date';

interface DateState {
  selectedDate: string;
  setSelectedDate: (dateKey: string) => void;
  resetToToday: () => void;
}

export const useDateStore = create<DateState>((set) => ({
  selectedDate: getTodayDateString(),
  setSelectedDate: (dateKey: string) => set({ selectedDate: dateKey }),
  resetToToday: () => set({ selectedDate: getTodayDateString() }),
}));

export function isDateToday(): boolean {
  return useDateStore.getState().selectedDate === getTodayDateString();
}
