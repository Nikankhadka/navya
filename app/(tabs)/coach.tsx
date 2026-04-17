import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Card, QuickActionChip } from '../../src/components/ui';
import { Colors, Radius, Spacing, Typography, withAlpha } from '../../src/constants/theme';
import { COACH_QUICK_REPLIES } from '../../src/mocks/mockData';
import { formatTimeAgo } from '../../src/utils/helpers';
import type { CoachMessage } from '../../src/types/app';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useCoachMessages } from '../../src/hooks/useCoachMessages';
import { useFeatureFlags } from '../../src/hooks/useFeatureFlags';
import { useCoachActions } from '../../src/hooks/useCoachActions';
import { useDailyNutrition } from '../../src/hooks/useDailyNutrition';
import { useHabitStreak } from '../../src/hooks/useHabitStreak';
import { useWeeklyCoachSummary } from '../../src/hooks/useWeeklyCoachSummary';

const METRIC_TONE_STYLES = {
  accent: {
    backgroundColor: withAlpha(Colors.accent, 0.12),
    borderColor: withAlpha(Colors.accent, 0.28),
    valueColor: Colors.accent,
  },
  success: {
    backgroundColor: withAlpha(Colors.green, 0.12),
    borderColor: withAlpha(Colors.green, 0.24),
    valueColor: Colors.green,
  },
  warning: {
    backgroundColor: withAlpha(Colors.orange, 0.12),
    borderColor: withAlpha(Colors.orange, 0.26),
    valueColor: Colors.orange,
  },
  neutral: {
    backgroundColor: withAlpha(Colors.surface, 0.84),
    borderColor: withAlpha(Colors.border, 0.95),
    valueColor: Colors.text,
  },
} as const;

export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { data: initialMessages } = useCoachMessages(user?.id);
  const { data: featureFlags } = useFeatureFlags();
  const { requestQuickReply } = useCoachActions(user?.id);
  const { data: nutrition } = useDailyNutrition(user?.id);
  const { data: streak } = useHabitStreak(user?.id);
  const weeklySummaryEnabled = featureFlags?.weekly_summary_enabled !== false;
  const {
    data: weeklySummary,
    isLoading: weeklySummaryLoading,
  } = useWeeklyCoachSummary(user?.id, weeklySummaryEnabled);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }, [messages, isTyping]);

  const contextChips = useMemo(
    () => [
      `🔥 ${streak?.current_streak_days ?? 0} day streak`,
      `🥗 ${nutrition?.total_calories ?? 0} kcal`,
      `💧 ${nutrition?.water_total_ml ?? 0} ml`,
    ],
    [nutrition?.total_calories, nutrition?.water_total_ml, streak?.current_streak_days],
  );

  const handleSend = async (text?: string) => {
    const content = text ?? inputText.trim();
    if (!content || !user?.id || featureFlags?.ai_enabled === false) {
      return;
    }

    const userMsg: CoachMessage = {
      id: `msg-${Date.now()}`,
      user_id: user.id,
      action_type: 'quick_reply',
      role: 'user',
      text: content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const coachMsg = await requestQuickReply.mutateAsync(content);
    setMessages((prev) => [...prev, coachMsg]);
    setIsTyping(false);
  };

  const coachActive = featureFlags?.ai_enabled !== false;

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Coach</Text>
          <View style={[styles.statusBadge, coachActive ? styles.statusBadgeActive : styles.statusBadgeMuted]}>
            <Text style={[styles.statusBadgeText, coachActive ? styles.statusBadgeTextActive : null]}>
              {coachActive ? 'Active' : 'Offline'}
            </Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: 152 + Math.max(insets.bottom, 0) }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Card variant="hero" style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>Weekly recap + quick coaching</Text>
            <Text style={styles.heroTitle}>A calm room for your next best move</Text>
            <Text style={styles.heroText}>
              Check the week in one glance, then use quick coaching to stay close to the plan you
              already started.
            </Text>
            <View style={styles.contextRow}>
              {contextChips.map((chip) => (
                <QuickActionChip key={chip} label={chip} tone="accent" />
              ))}
            </View>
          </Card>

          {weeklySummaryEnabled ? (
            <Card style={styles.summaryCard}>
              {weeklySummaryLoading ? (
                <View style={styles.summaryLoadingRow}>
                  <ActivityIndicator size="small" color={Colors.accent} />
                  <Text style={styles.summaryLoadingText}>Preparing this week’s check-in...</Text>
                </View>
              ) : weeklySummary ? (
                <>
                  <View style={styles.summaryHeader}>
                    <View style={styles.summaryHeaderText}>
                      <Text style={styles.summaryEyebrow}>{weeklySummary.focus_label}</Text>
                      <Text style={styles.summaryTitle}>{weeklySummary.title}</Text>
                    </View>
                    {weeklySummary.is_demo ? (
                      <Badge label="Demo Summary" color={Colors.orange} />
                    ) : null}
                  </View>
                  <Text style={styles.summaryTimeframe}>{weeklySummary.timeframe_label}</Text>
                  <Text style={styles.summaryText}>{weeklySummary.body}</Text>

                  <View style={styles.summaryMetricsRow}>
                    {weeklySummary.metrics.map((metric) => {
                      const toneStyle = METRIC_TONE_STYLES[metric.tone];
                      return (
                        <View
                          key={metric.label}
                          style={[
                            styles.summaryMetricCard,
                            {
                              backgroundColor: toneStyle.backgroundColor,
                              borderColor: toneStyle.borderColor,
                            },
                          ]}
                        >
                          <Text style={styles.summaryMetricLabel}>{metric.label}</Text>
                          <Text
                            style={[
                              styles.summaryMetricValue,
                              { color: toneStyle.valueColor },
                            ]}
                          >
                            {metric.value}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.summaryNextStepBlock}>
                    <Text style={styles.summaryNextStepLabel}>What to do next</Text>
                    <Text style={styles.summaryNextStepText}>{weeklySummary.next_step}</Text>
                  </View>
                  <Text style={styles.summarySourceText}>{weeklySummary.source_label}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.summaryEyebrow}>Weekly check-in</Text>
                  <Text style={styles.summaryTitle}>No weekly summary yet</Text>
                  <Text style={styles.summaryText}>
                    Log one workout and one meal to unlock your first check-in and give the coach
                    a real pattern to read.
                  </Text>
                </>
              )}
            </Card>
          ) : null}

          {!coachActive ? (
            <Card style={styles.offlineCard}>
              <Text style={styles.offlineTitle}>Coach is currently offline</Text>
              <Text style={styles.offlineText}>
                Quick replies are disabled until the AI feature flag is enabled again.
              </Text>
            </Card>
          ) : null}

          <View style={styles.messageList}>
            {messages.map((msg, index) => {
              const isCoach = msg.role === 'coach';
              const showTime =
                index === 0 ||
                new Date(msg.created_at).getTime() -
                  new Date(messages[index - 1].created_at).getTime() >
                  300_000;

              return (
                <View key={msg.id}>
                  {showTime ? <Text style={styles.timeLabel}>{formatTimeAgo(msg.created_at)}</Text> : null}
                  <View style={[styles.bubbleRow, !isCoach ? styles.bubbleRowUser : null]}>
                    {isCoach ? (
                      <View style={styles.coachAvatar}>
                        <Text style={styles.coachAvatarEmoji}>🧠</Text>
                      </View>
                    ) : null}
                    <View
                      style={[
                        styles.bubble,
                        isCoach ? styles.bubbleCoach : styles.bubbleUser,
                      ]}
                    >
                      <Text style={[styles.bubbleText, !isCoach ? styles.bubbleTextUser : null]}>
                        {msg.text}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}

            {isTyping ? (
              <View style={styles.bubbleRow}>
                <View style={styles.coachAvatar}>
                  <Text style={styles.coachAvatarEmoji}>🧠</Text>
                </View>
                <View style={[styles.bubble, styles.bubbleCoach, styles.typingBubble]}>
                  <ActivityIndicator size="small" color={Colors.accent} />
                </View>
              </View>
            ) : null}
          </View>

          <View style={styles.quickReplies}>
            {COACH_QUICK_REPLIES.map((reply) => (
              <QuickActionChip
                key={reply}
                label={reply}
                tone="neutral"
                onPress={() => handleSend(reply)}
              />
            ))}
          </View>
        </ScrollView>

        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
          <TextInput
            style={styles.input}
            placeholder="Ask your coach something useful..."
            placeholderTextColor={Colors.dim}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={300}
            editable={coachActive}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              inputText.trim() && coachActive ? styles.sendBtnActive : styles.sendBtnInactive,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isTyping || !coachActive}
            activeOpacity={0.84}
          >
            <Text
              style={[
                styles.sendBtnText,
                !(inputText.trim() && coachActive) ? styles.sendBtnTextInactive : null,
              ]}
            >
              ↑
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenTitle: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extrabold,
    fontFamily: Typography.fontDisplay,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  statusBadgeActive: {
    backgroundColor: withAlpha(Colors.accent, 0.12),
    borderColor: withAlpha(Colors.accent, 0.28),
  },
  statusBadgeMuted: {
    backgroundColor: withAlpha(Colors.red, 0.1),
    borderColor: withAlpha(Colors.red, 0.28),
  },
  statusBadgeText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusBadgeTextActive: {
    color: Colors.accent,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  heroCard: {
    marginBottom: Spacing.lg,
  },
  heroEyebrow: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  heroTitle: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    fontFamily: Typography.fontDisplay,
    marginBottom: Spacing.sm,
  },
  heroText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  contextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
    alignItems: 'flex-start',
  },
  summaryHeaderText: {
    flex: 1,
  },
  summaryEyebrow: {
    color: Colors.orange,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  summaryTitle: {
    color: Colors.text,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.sm,
  },
  summaryText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  summaryTimeframe: {
    color: Colors.dim,
    fontSize: Typography.size.xs,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryMetricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  summaryMetricCard: {
    minWidth: 92,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  summaryMetricLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  summaryMetricValue: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  summaryNextStepBlock: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: withAlpha(Colors.border, 0.85),
  },
  summaryNextStepLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  summaryNextStepText: {
    color: Colors.text,
    fontSize: Typography.size.md,
    lineHeight: 22,
    fontWeight: Typography.weight.medium,
  },
  summarySourceText: {
    color: Colors.dim,
    fontSize: Typography.size.xs,
    lineHeight: 18,
    marginTop: Spacing.md,
  },
  summaryLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  summaryLoadingText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
  },
  offlineCard: {
    marginBottom: Spacing.lg,
    backgroundColor: withAlpha(Colors.red, 0.08),
    borderColor: withAlpha(Colors.red, 0.22),
  },
  offlineTitle: {
    color: Colors.red,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
  },
  offlineText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  messageList: {
    gap: Spacing.md,
  },
  timeLabel: {
    textAlign: 'center',
    color: Colors.dim,
    fontSize: Typography.size.xs,
    marginVertical: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  bubbleRowUser: {
    flexDirection: 'row-reverse',
  },
  coachAvatar: {
    width: 34,
    height: 34,
    borderRadius: Radius.lg,
    backgroundColor: withAlpha(Colors.accent, 0.12),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  coachAvatarEmoji: {
    fontSize: 15,
  },
  bubble: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: Radius.xl,
  },
  bubbleCoach: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: Radius.sm,
  },
  bubbleUser: {
    backgroundColor: withAlpha(Colors.orange, 0.18),
    borderWidth: 1,
    borderColor: withAlpha(Colors.orange, 0.34),
    borderBottomRightRadius: Radius.sm,
  },
  bubbleText: {
    color: Colors.text,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: Colors.text,
  },
  typingBubble: {
    paddingHorizontal: Spacing.xl,
  },
  quickReplies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  inputBar: {
    position: 'absolute',
    left: Spacing.xl,
    right: Spacing.xl,
    bottom: 0,
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-end',
    paddingTop: Spacing.md,
    backgroundColor: Colors.bg,
  },
  input: {
    flex: 1,
    minHeight: 54,
    maxHeight: 120,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingTop: 16,
    paddingBottom: 16,
    fontSize: Typography.size.md,
  },
  sendBtn: {
    width: 54,
    height: 54,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendBtnActive: {
    backgroundColor: Colors.orange,
  },
  sendBtnInactive: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtnText: {
    color: Colors.canopyBlack,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  sendBtnTextInactive: {
    color: Colors.textSecondary,
  },
});
