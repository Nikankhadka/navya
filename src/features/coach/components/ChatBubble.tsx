import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Spacing, Radius, Typography, type ThemeColors } from '@/theme';
import { formatTimeAgo } from '@/utils/helpers';
import type { CoachMessage } from '@/types/app';

export interface ChatBubbleProps {
  /** The message to render (ignored if isTyping is true) */
  message?: CoachMessage;
  /** Whether to show a timestamp label above the bubble */
  showTime?: boolean;
  /** Whether to render a typing indicator instead of a message */
  isTyping?: boolean;
  colors: ThemeColors;
}

export function ChatBubble({ message, showTime, isTyping, colors }: ChatBubbleProps) {
  const styles = createStyles(colors);

  // Typing indicator — renders a coach-side bubble with a spinner
  if (isTyping) {
    return (
      <View style={styles.bubbleRow}>
        <View style={styles.coachAvatar}>
          <Text style={{ fontSize: 14 }}>🤖</Text>
        </View>
        <View style={[styles.bubble, styles.bubbleCoach, styles.typingBubble]}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      </View>
    );
  }

  // Guard: nothing to render without a message
  if (!message) return null;

  const isCoach = message.role === 'coach';

  return (
    <View>
      {showTime && <Text style={styles.timeLabel}>{formatTimeAgo(message.created_at)}</Text>}
      <View style={[styles.bubbleRow, !isCoach && styles.bubbleRowUser]}>
        {isCoach && (
          <View style={styles.coachAvatar}>
            <Text style={{ fontSize: 14 }}>🤖</Text>
          </View>
        )}
        <View style={[styles.bubble, isCoach ? styles.bubbleCoach : styles.bubbleUser]}>
          <Text style={[styles.bubbleText, !isCoach && styles.bubbleTextUser]}>{message.text}</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    timeLabel: {
      textAlign: 'center',
      color: colors.dim,
      fontSize: Typography.size.xs,
      marginVertical: Spacing.sm,
    },
    bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
    bubbleRowUser: { flexDirection: 'row-reverse' },
    coachAvatar: {
      width: 30,
      height: 30,
      borderRadius: Radius.sm,
      backgroundColor: colors.accentMuted,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    bubble: {
      maxWidth: '78%',
      padding: Spacing.md,
      borderRadius: Radius.lg,
    },
    bubbleCoach: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderBottomLeftRadius: Radius.sm,
    },
    bubbleUser: {
      backgroundColor: colors.accent,
      borderBottomRightRadius: Radius.sm,
    },
    typingBubble: { paddingHorizontal: Spacing.xl },
    bubbleText: {
      color: colors.text,
      fontSize: Typography.size.sm,
      lineHeight: 20,
    },
    bubbleTextUser: { color: Colors.white },
  });
