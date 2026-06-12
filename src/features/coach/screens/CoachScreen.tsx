import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography, useAppTheme, type ThemeColors } from '@/theme';
import { isCoachEnabled } from '@/config/env';
import { COACH_QUICK_REPLIES } from '@/features/demo/mockData';
import type { CoachMessage } from '@/types/app';
import { useAuthStore } from '@/store/useAuthStore';
import { useCoachMessages } from '@/features/coach/hooks/useCoachMessages';
import { useFeatureFlags } from '@/features/coach/hooks/useFeatureFlags';
import { useCoachActions } from '@/features/coach/hooks/useCoachActions';
import { ChatBubble, QuickReplies, ChatInput } from '@/features/coach/components';

export default function CoachScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!isCoachEnabled) {
      router.replace('/(tabs)/(home)');
    }
  }, [router]);
  const { data: initialMessages } = useCoachMessages(user?.id);
  const { data: featureFlags } = useFeatureFlags();
  const { requestQuickReply } = useCoachActions(user?.id);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const content = text ?? inputText.trim();
    if (!content || !user?.id || featureFlags?.ai_enabled === false) return;

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

  /** Compute whether to show a time label for a message at index `i` */
  const shouldShowTime = (i: number): boolean => {
    if (i === 0) return true;
    const current = new Date(messages[i].created_at).getTime();
    const previous = new Date(messages[i - 1].created_at).getTime();
    return current - previous > 300_000;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.coachInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>🤖</Text>
            </View>
            <View>
              <Text style={styles.coachName}>AI Coach</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>
                  {featureFlags?.ai_enabled === false ? 'Offline' : 'Active'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.limitBadge}>
            <Text style={styles.limitText}>
              {featureFlags?.ai_enabled === false ? 'AI disabled' : 'Limited AI'}
            </Text>
          </View>
        </View>

        {/* ── Messages ───────────────────────────────────────────── */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, i) => (
            <ChatBubble key={msg.id} message={msg} showTime={shouldShowTime(i)} colors={colors} />
          ))}

          {isTyping && <ChatBubble isTyping colors={colors} />}
        </ScrollView>

        {/* ── Quick Replies ──────────────────────────────────────── */}
        <QuickReplies
          replies={COACH_QUICK_REPLIES}
          onSelect={(reply) => handleSend(reply)}
          colors={colors}
        />

        {/* ── Input ──────────────────────────────────────────────── */}
        <ChatInput
          value={inputText}
          onChangeText={setInputText}
          onSend={() => handleSend()}
          disabled={featureFlags?.ai_enabled === false}
          bottomInset={insets.bottom}
          colors={colors}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) =>
  ({
    screen: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    coachInfo: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: Spacing.md },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: Radius.lg,
      backgroundColor: colors.accent,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    avatarEmoji: { fontSize: 22, color: Colors.white },
    coachName: {
      color: colors.text,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
    },
    onlineRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 5,
      marginTop: 2,
    },
    onlineDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.green,
    },
    onlineText: { color: colors.green, fontSize: Typography.size.xs },
    limitBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 4,
      borderRadius: Radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    limitText: { color: colors.dim, fontSize: Typography.size.xs },

    messageList: { flex: 1 },
    messageContent: { padding: Spacing.xl, paddingBottom: Spacing.md, gap: Spacing.md },
  }) as const;
