import type { CoachMessage } from '../types/app';
import { supabase, isSupabaseConfigured } from './supabase';
import { MOCK_COACH_MESSAGES, DEMO_COACH_RESPONSES } from '../mocks/mockData';

export const coachService = {
  async getMessages(userId: string): Promise<CoachMessage[]> {
    if (!isSupabaseConfigured) {
      return MOCK_COACH_MESSAGES;
    }

    const { data, error } = await supabase
      .from('coach_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching coach messages:', error);
      return MOCK_COACH_MESSAGES;
    }

    return (data as unknown as CoachMessage[]) ?? [];
  },

  async requestQuickReply(userId: string, text: string): Promise<CoachMessage> {
    if (!isSupabaseConfigured) {
      const reply =
        DEMO_COACH_RESPONSES[Math.floor(Math.random() * DEMO_COACH_RESPONSES.length)];

      return {
        id: `coach-local-${Date.now()}`,
        user_id: userId,
        action_type: 'quick_reply',
        role: 'coach',
        text: reply,
        created_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase.functions.invoke('coach-action', {
      body: { text },
    });

    if (error) {
      console.error('Error requesting coach response:', error);
      return {
        id: `coach-fallback-${Date.now()}`,
        user_id: userId,
        action_type: 'quick_reply',
        role: 'coach',
        text: 'Coach is temporarily unavailable. Please try again shortly.',
        created_at: new Date().toISOString(),
      };
    }

    return (data as CoachMessage) ?? {
      id: `coach-fallback-${Date.now()}`,
      user_id: userId,
      action_type: 'quick_reply',
      role: 'coach',
      text: 'Coach is temporarily unavailable. Please try again shortly.',
      created_at: new Date().toISOString(),
    };
  },
};
