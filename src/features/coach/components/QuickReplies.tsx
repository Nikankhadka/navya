import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { Spacing, Radius, Typography, type ThemeColors } from '@/theme';

export interface QuickRepliesProps {
  /** The list of quick-reply strings to display as chips */
  replies: string[];
  /** Called when a chip is pressed, passing the reply text */
  onSelect: (reply: string) => void;
  colors: ThemeColors;
}

export function QuickReplies({ replies, onSelect, colors }: QuickRepliesProps) {
  const styles = createStyles(colors);

  if (!replies.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.quickReplies}
      style={styles.quickReplyScroll}
      keyboardShouldPersistTaps="handled"
    >
      {replies.map((reply, i) => (
        <TouchableOpacity
          key={i}
          style={styles.quickReply}
          onPress={() => onSelect(reply)}
          activeOpacity={0.8}
        >
          <Text style={styles.quickReplyText}>{reply}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  ({
    quickReplyScroll: { flexGrow: 0 },
    quickReplies: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.sm,
      gap: Spacing.sm,
    },
    quickReply: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    quickReplyText: { color: colors.muted, fontSize: Typography.size.sm },
  }) as const;
