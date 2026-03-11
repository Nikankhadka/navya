import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../../src/lib/theme';
import { MOCK_COACH_MESSAGES, DEMO_COACH_RESPONSES, COACH_QUICK_REPLIES } from '../../src/lib/mockData';
import { formatTimeAgo } from '../../src/utils/helpers';
import type { CoachMessage } from '../../src/types/app';

export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<CoachMessage[]>(MOCK_COACH_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const content = text ?? inputText.trim();
    if (!content) return;

    const userMsg: CoachMessage = {
      id: `msg-${Date.now()}`,
      user_id: 'mock-user-1',
      action_type: 'quick_reply',
      role: 'user',
      text: content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(
      () => {
        const reply = DEMO_COACH_RESPONSES[
          Math.floor(Math.random() * DEMO_COACH_RESPONSES.length)
        ];
        const coachMsg: CoachMessage = {
          id: `msg-${Date.now() + 1}`,
          user_id: 'mock-user-1',
          action_type: 'quick_reply',
          role: 'coach',
          text: reply,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, coachMsg]);
        setIsTyping(false);
      },
      900 + Math.random() * 700
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.coachInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>🤖</Text>
            </View>
            <View>
              <Text style={styles.coachName}>AI Coach</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Active · Knows your plan</Text>
              </View>
            </View>
          </View>
          <View style={styles.limitBadge}>
            <Text style={styles.limitText}>8/10 today</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, i) => {
            const isCoach = msg.role === 'coach';
            const showTime =
              i === 0 ||
              new Date(msg.created_at).getTime() -
                new Date(messages[i - 1].created_at).getTime() >
                300_000;

            return (
              <View key={msg.id}>
                {showTime && (
                  <Text style={styles.timeLabel}>
                    {formatTimeAgo(msg.created_at)}
                  </Text>
                )}
                <View
                  style={[
                    styles.bubbleRow,
                    !isCoach && styles.bubbleRowUser,
                  ]}
                >
                  {isCoach && (
                    <View style={styles.coachAvatar}>
                      <Text style={{ fontSize: 14 }}>🤖</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      isCoach ? styles.bubbleCoach : styles.bubbleUser,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        !isCoach && styles.bubbleTextUser,
                      ]}
                    >
                      {msg.text}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <View style={[styles.bubbleRow]}>
              <View style={styles.coachAvatar}>
                <Text style={{ fontSize: 14 }}>🤖</Text>
              </View>
              <View style={[styles.bubble, styles.bubbleCoach, styles.typingBubble]}>
                <ActivityIndicator size="small" color={Colors.accent} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick replies */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickReplies}
          style={styles.quickReplyScroll}
          keyboardShouldPersistTaps="handled"
        >
          {COACH_QUICK_REPLIES.map((qr, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickReply}
              onPress={() => handleSend(qr)}
              activeOpacity={0.8}
            >
              <Text style={styles.quickReplyText}>{qr}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input bar */}
        <View
          style={[
            styles.inputBar,
            { paddingBottom: Math.max(insets.bottom, Spacing.md) },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Ask your coach anything..."
            placeholderTextColor={Colors.dim}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={300}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              inputText.trim() ? styles.sendBtnActive : styles.sendBtnInactive,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            activeOpacity={0.85}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  coachInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 22 },
  coachName: {
    color: Colors.text,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: {
    width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.green,
  },
  onlineText: { color: Colors.green, fontSize: Typography.size.xs },
  limitBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  limitText: { color: Colors.dim, fontSize: Typography.size.xs },

  messageList: { flex: 1 },
  messageContent: { padding: Spacing.xl, paddingBottom: Spacing.md, gap: Spacing.md },

  timeLabel: {
    textAlign: 'center',
    color: Colors.dim,
    fontSize: Typography.size.xs,
    marginVertical: Spacing.sm,
  },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  bubbleRowUser: { flexDirection: 'row-reverse' },
  coachAvatar: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    backgroundColor: Colors.accentMuted,
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
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: Radius.sm,
  },
  bubbleUser: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: Radius.sm,
  },
  typingBubble: { paddingHorizontal: Spacing.xl },
  bubbleText: {
    color: Colors.text,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  bubbleTextUser: { color: '#fff' },

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
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  quickReplyText: { color: Colors.muted, fontSize: Typography.size.sm },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: Typography.size.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnActive: { backgroundColor: Colors.accent },
  sendBtnInactive: { backgroundColor: Colors.border },
  sendBtnText: { color: '#fff', fontSize: Typography.size.lg, fontWeight: Typography.weight.bold },
});
