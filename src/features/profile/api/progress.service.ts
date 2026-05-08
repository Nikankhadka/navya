import type { WeightLog, WeightProgressSummary } from '@/types/app';
import type { Database } from '@/types/database';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { mapWeightLogRow } from '@/lib/supabase/mappers';
import { MOCK_PROFILE, MOCK_WEIGHT_LOGS } from '@/features/demo/mockData';

function shouldUseDemoProgress(userId: string): boolean {
  return userId === MOCK_PROFILE.id || !isSupabaseConfigured;
}

function buildWeightProgress(
  currentWeightKg: number | null,
  weightLogs: WeightLog[],
): WeightProgressSummary {
  const recentLogs = [...weightLogs]
    .sort(
      (left, right) =>
        new Date(right.logged_at).getTime() - new Date(left.logged_at).getTime(),
    )
    .slice(0, 6);
  const oldestLog =
    recentLogs.length > 1 ? recentLogs[recentLogs.length - 1] : null;
  const latestLog = recentLogs[0] ?? null;
  const startOfMonth = new Date();

  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return {
    current_weight_kg: currentWeightKg ?? latestLog?.weight_kg ?? null,
    change_kg_14d:
      latestLog && oldestLog && latestLog.id !== oldestLog.id
        ? Number((latestLog.weight_kg - oldestLog.weight_kg).toFixed(1))
        : null,
    last_logged_at: latestLog?.logged_at ?? null,
    recent_logs: recentLogs,
    check_ins_this_month: weightLogs.filter(
      (entry) => new Date(entry.logged_at).getTime() >= startOfMonth.getTime(),
    ).length,
  };
}

type ProfileWeightRow = Pick<Database['public']['Tables']['user_profiles']['Row'], 'weight_kg'>;

export const progressService = {
  async getWeightProgress(userId: string): Promise<WeightProgressSummary> {
    if (shouldUseDemoProgress(userId)) {
      return buildWeightProgress(MOCK_PROFILE.weight_kg, MOCK_WEIGHT_LOGS);
    }

    const [{ data: profileDataRaw, error: profileError }, { data: weightData, error: weightError }] =
      await Promise.all([
        supabase.from('user_profiles').select('weight_kg').eq('id', userId).maybeSingle(),
        supabase
          .from('weight_logs')
          .select('*')
          .eq('user_id', userId)
          .order('logged_at', { ascending: false })
          .limit(12),
      ]);

    if (profileError) {
      console.error('Error fetching current weight:', profileError);
    }

    if (weightError) {
      console.error('Error fetching weight history:', weightError);
    }

    return buildWeightProgress(
      (profileDataRaw as ProfileWeightRow | null)?.weight_kg ?? null,
      (weightData ?? []).map(mapWeightLogRow),
    );
  },

  async logWeight(userId: string, weightKg: number): Promise<WeightLog> {
    const payload: WeightLog = {
      id: `weight-${Date.now()}`,
      user_id: userId,
      weight_kg: weightKg,
      logged_at: new Date().toISOString(),
    };

    if (shouldUseDemoProgress(userId)) {
      return payload;
    }

    const { data, error } = await supabase
      .from('weight_logs')
      .insert({
        user_id: userId,
        weight_kg: weightKg,
      } as never)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating weight log:', error);
      return payload;
    }

    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        weight_kg: weightKg,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating current profile weight:', profileError);
    }

    return mapWeightLogRow(data);
  },
};
