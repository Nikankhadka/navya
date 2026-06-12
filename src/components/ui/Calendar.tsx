import React from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Colors, Spacing, Radius, Typography, type ThemeColors } from '@/theme';
import { getMonthGrid, formatMonthYear, isToday, isFuture, addDays } from '@/utils/date';

interface CalendarProps {
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  activityDates?: Set<string>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  colors: ThemeColors;
}

export function Calendar({
  selectedDate,
  onSelectDate,
  activityDates = new Set(),
  onPrevMonth,
  onNextMonth,
  onToday,
  colors,
}: CalendarProps) {
  const grid = getMonthGrid(selectedDate);
  const monthLabel = formatMonthYear(selectedDate);

  const weekLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const rows: (typeof grid)[] = [];
  for (let i = 0; i < grid.length; i += 7) {
    rows.push(grid.slice(i, i + 7));
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onPrevMonth} style={styles.navButton}>
          <Text style={[styles.navButtonText, { color: colors.text }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.monthLabel, { color: colors.text }]}>{monthLabel}</Text>
        <TouchableOpacity
          onPress={onNextMonth}
          style={[styles.navButton, isFuture(selectedDate) && styles.navButtonDisabled]}
          disabled={isFuture(addDays(selectedDate, 1))}
        >
          <Text
            style={[
              styles.navButtonText,
              { color: isFuture(addDays(selectedDate, 1)) ? colors.dim : colors.text },
            ]}
          >
            ›
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekDayRow}>
        {weekLabels.map((label) => (
          <View key={label} style={styles.weekDayCell}>
            <Text style={[styles.weekDayLabel, { color: colors.muted }]}>{label}</Text>
          </View>
        ))}
      </View>

      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.weekRow}>
          {row.map(({ dateKey, isCurrentMonth }) => {
            const isSelected = dateKey === selectedDate;
            const isTodayDate = isToday(dateKey);
            const hasActivity = activityDates.has(dateKey);
            const isFutureDate = isFuture(dateKey);

            return (
              <Pressable
                key={dateKey}
                onPress={() => !isFutureDate && onSelectDate(dateKey)}
                disabled={isFutureDate}
                style={({ hovered }) => [
                  styles.dayCell,
                  !isCurrentMonth && styles.dayCellOtherMonth,
                  isSelected && styles.dayCellSelected,
                  isFutureDate && styles.dayCellDisabled,
                  hovered && { backgroundColor: colors.cardHover },
                ]}
              >
                <View style={styles.dayContent}>
                  <Text
                    style={[
                      styles.dayNumber,
                      {
                        color: isSelected
                          ? colors.accent
                          : isCurrentMonth
                            ? colors.textStrong
                            : colors.dim,
                      },
                      isTodayDate && styles.dayNumberToday,
                    ]}
                  >
                    {parseInt(dateKey.split('-')[2], 10)}
                  </Text>
                  {hasActivity && !isSelected && (
                    <View style={[styles.activityDot, { backgroundColor: colors.green }]} />
                  )}
                </View>
                {isTodayDate && <View style={[styles.todayRing, { borderColor: colors.accent }]} />}
              </Pressable>
            );
          })}
        </View>
      ))}

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={onToday}
          style={[styles.todayButton, { backgroundColor: colors.accent }]}
        >
          <Text style={[styles.todayButtonText, { color: Colors.white }]}>Today</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = {
  container: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    lineHeight: 40,
  },
  monthLabel: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  weekDayRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    position: 'relative',
  },
  dayCellOtherMonth: {
    opacity: 0.3,
  },
  dayCellSelected: {
    borderRadius: Radius.md,
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayContent: {
    alignItems: 'center',
    gap: 2,
  },
  dayNumber: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.medium,
    textAlign: 'center',
    lineHeight: 28,
  },
  dayNumberToday: {
    fontWeight: Typography.weight.extrabold,
  },
  activityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  todayRing: {
    position: 'absolute',
    inset: 2,
    borderWidth: 1.5,
    borderRadius: Radius.md,
  },
  footer: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  todayButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  todayButtonText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
} as const;
