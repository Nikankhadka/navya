import type { CoachMessage } from '@/types/app';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { MOCK_COACH_MESSAGES, DEMO_COACH_RESPONSES, MOCK_PROFILE } from '@/features/demo/mockData';
import { mapCoachMessageRow } from '@/lib/supabase/mappers';

function buildCoachUnavailableMessage(userId: string): CoachMessage {
  return {
    id: `coach-fallback-${Date.now()}`,
    user_id: userId,
    action_type: 'quick_reply',
    role: 'coach',
    text: 'Coach is temporarily unavailable. Please try again shortly.',
    created_at: new Date().toISOString(),
  };
}

function shouldUseDemoCoach(userId: string): boolean {
  return userId === MOCK_PROFILE.id || !isSupabaseConfigured;
}

export const coachService = {
  async getMessages(userId: string): Promise<CoachMessage[]> {
    if (shouldUseDemoCoach(userId)) {
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

    return (data ?? []).map(mapCoachMessageRow);
  },

  async requestQuickReply(userId: string, text: string): Promise<CoachMessage> {
    const userMessage: CoachMessage = {
      id: `coach-user-${Date.now()}`,
      user_id: userId,
      action_type: 'quick_reply',
      role: 'user',
      text,
      created_at: new Date().toISOString(),
    };

    if (shouldUseDemoCoach(userId)) {
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

    await supabase.from('coach_messages').insert({
      user_id: userId,
      action_type: userMessage.action_type,
      role: userMessage.role,
      text: userMessage.text,
    } as never);

    const { data, error } = await supabase.functions.invoke('coach-action', {
      body: { text, userId },
    });

    if (error) {
      console.error('Error requesting coach response:', error);
      return buildCoachUnavailableMessage(userId);
    }

    const responseMessage: CoachMessage =
      data && typeof data === 'object' && !Array.isArray(data)
        ? {
            id: typeof data.id === 'string' ? data.id : `coach-server-${Date.now()}`,
            user_id: userId,
            action_type: 'quick_reply',
            role: 'coach',
            text:
              typeof data.text === 'string' && data.text.trim().length > 0
                ? data.text
                : 'Coach is temporarily unavailable. Please try again shortly.',
            created_at:
              typeof data.created_at === 'string' ? data.created_at : new Date().toISOString(),
          }
        : buildCoachUnavailableMessage(userId);

    const { data: insertedReply, error: insertError } = await supabase
      .from('coach_messages')
      .insert({
        user_id: userId,
        action_type: responseMessage.action_type,
        role: responseMessage.role,
        text: responseMessage.text,
      } as never)
      .select('*')
      .single();

    if (insertError) {
      console.error('Error storing coach reply:', insertError);
      return responseMessage;
    }

    return mapCoachMessageRow(insertedReply);
  },
};
