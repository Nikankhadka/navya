import type { CoachMessage } from '@/types/app';

export const MOCK_COACH_MESSAGES: CoachMessage[] = [
  {
    id: 'msg-1',
    user_id: 'mock-user-1',
    action_type: 'daily_insight',
    role: 'coach',
    text: "Great 7-day streak Arjun! 🔥 Your push session today is looking solid. You're tracking 2 reps ahead of last week on bench — keep that progressive overload coming.",
    created_at: new Date(Date.now() - 30 * 60_000).toISOString(),
  },
  {
    id: 'msg-2',
    user_id: 'mock-user-1',
    action_type: 'quick_reply',
    role: 'user',
    text: 'My shoulder feels a bit tight today',
    created_at: new Date(Date.now() - 25 * 60_000).toISOString(),
  },
  {
    id: 'msg-3',
    user_id: 'mock-user-1',
    action_type: 'adjust_workout',
    role: 'coach',
    text: "Got it. Swap OHP for lateral raises today — same shoulder engagement, much lower joint stress. Stretch your pecs for 90s before starting. You're still on track for your weekly volume target.",
    created_at: new Date(Date.now() - 20 * 60_000).toISOString(),
  },
];

export const COACH_QUICK_REPLIES = [
  "Modify today's workout",
  'Suggest a meal',
  "How's my progress?",
  "I'm sore today",
  'Give me a tip',
];

export const DEMO_COACH_RESPONSES = [
  "Based on your recent sessions, you're consistently hitting your volume targets. Keep the intensity on compound movements and you'll see solid strength gains in the next 2–3 weeks. 💪",
  "For muscle building, aim for 1.8–2.2g of protein per kg of body weight. At 78kg that's 140–172g/day. Your current intake looks close — just bump up dinner protein.",
  'Rest day tomorrow? Perfect. Light walking and 8 hours of sleep will accelerate recovery more than any supplement. Your body grows during rest, not just during training.',
  "Your 7-day streak is a strong habit signal. The hardest part was week 1 — you're well past that now. Stay consistent for another 3 weeks and this becomes automatic.",
  "For today's soreness: focus on active recovery — 10 min light cardio, dynamic stretching, and foam rolling the affected areas. Avoid training that muscle group for another 24–48 hours.",
];
