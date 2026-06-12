import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Spacing, Radius, Typography, useAppTheme } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, Divider, ThemeModeToggle } from '@/components/ui';
import { WeightTrendCard } from '@/components/shared/WeightTrendCard';
import { formatDuration, goalLabel } from '@/utils/helpers';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useWeightActions } from '@/features/profile/hooks/useWeightActions';
import { useWeightProgress } from '@/features/profile/hooks/useWeightProgress';
import { useHabitStreak } from '@/features/home/hooks/useHabitStreak';
import { useWorkoutHistory } from '@/features/workout/hooks/useWorkoutHistory';
import { profileService } from '@/features/profile/api/profile.service';
import {
  ProfileHeader,
  ProfileStatsSection,
  EditProfileModal,
  WeightCheckInModal,
  type EditProfileModalProps,
} from '@/features/profile/components';
import type { UserProfile } from '@/types/app';
import { crossAlert } from '@/utils/crossAlert';
import { isVisualTestScenario } from '@/utils/visualTest';

type EditProfileForm = EditProfileModalProps['form'];

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const styles = {
    screen: { flex: 1, backgroundColor: colors.background },
    content: { paddingBottom: 40 },

    metricsCard: { marginHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
    sectionTitle: {
      color: colors.text,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      paddingHorizontal: Spacing.xl,
      marginBottom: Spacing.md,
    },
    sectionTitleInline: {
      color: colors.text,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: Spacing.md,
      marginBottom: Spacing.md,
    },
    progressSubtext: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      marginTop: 4,
    },
    inlineActionBtn: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      backgroundColor: colors.accentMuted,
      borderWidth: 1,
      borderColor: `${colors.accent}55`,
    },
    inlineActionText: {
      color: colors.accent,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
    },
    progressHighlights: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    progressHighlight: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressHighlightLabel: {
      color: colors.muted,
      fontSize: Typography.size.xs,
      marginBottom: 4,
    },
    progressHighlightValue: {
      color: colors.text,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
    },
    progressHighlightValueSmall: {
      color: colors.text,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
    },
    progressHistoryList: { gap: Spacing.sm },
    progressHistoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    progressHistoryWeight: {
      color: colors.text,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.bold,
    },
    progressHistoryDate: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      marginTop: 2,
    },
    progressHistoryTag: {
      color: colors.accent,
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.semibold,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    progressEmptyText: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      lineHeight: 20,
    },

    setupList: {
      marginHorizontal: Spacing.xl,
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xxl,
    },
    setupRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.md,
    },
    setupLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    setupIcon: { fontSize: 18 },
    setupLabel: { color: colors.muted, fontSize: Typography.size.md },
    setupValue: {
      color: colors.text,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semibold,
      textTransform: 'capitalize',
    },
    rowDivider: { marginVertical: 0 },

    actions: {
      paddingHorizontal: Spacing.xl,
      gap: Spacing.sm,
    },
    appearanceFooterCard: {
      marginHorizontal: Spacing.xl,
      marginTop: Spacing.xxl,
    },
    appearanceFooterText: {
      color: colors.textSecondary,
      fontSize: Typography.size.sm,
      lineHeight: 20,
      marginTop: Spacing.xs,
      marginBottom: Spacing.lg,
    },
    appearanceFooterToggle: {
      alignSelf: 'flex-start',
    },
    actionBtn: {
      backgroundColor: colors.card,
      borderRadius: Radius.lg,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionBtnText: {
      color: colors.text,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.medium,
    },
    signOutBtn: {
      borderColor: `${colors.red}44`,
      backgroundColor: colors.redMuted,
      marginTop: Spacing.sm,
    },
    signOutText: {
      color: colors.red,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semibold,
      textAlign: 'center',
    },
  } as const;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { user, signOut, isDemoSession, setProfile } = useAuthStore();
  const { data: profile } = useProfile(user?.id);
  const { data: weightProgress } = useWeightProgress(user?.id);
  const goalWeight = user?.goal_weight ?? null;
  const { data: habitStreak } = useHabitStreak(user?.id);
  const workoutTarget = user?.workouts_per_week ?? profile?.workouts_per_week ?? 3;
  const { data: workoutHistory } = useWorkoutHistory(user?.id, workoutTarget);
  const { logWeight } = useWeightActions(user?.id);
  const activeUser = profile ?? user;
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [checkInWeight, setCheckInWeight] = useState('');
  const [form, setForm] = useState<EditProfileForm>({
    full_name: '',
    weight_kg: '',
    height_cm: '',
    goal: 'general_fitness',
    workouts_per_week: '3',
  });

  useEffect(() => {
    if (!activeUser) {
      return;
    }

    setForm({
      full_name: activeUser.full_name ?? '',
      weight_kg: activeUser.weight_kg != null ? String(activeUser.weight_kg) : '',
      height_cm: activeUser.height_cm != null ? String(activeUser.height_cm) : '',
      goal: activeUser.goal ?? 'general_fitness',
      workouts_per_week:
        activeUser.workouts_per_week != null ? String(activeUser.workouts_per_week) : '3',
    });
    setCheckInWeight(activeUser.weight_kg != null ? String(activeUser.weight_kg) : '');
  }, [
    activeUser?.full_name,
    activeUser?.weight_kg,
    activeUser?.height_cm,
    activeUser?.goal,
    activeUser?.workouts_per_week,
  ]);

  useEffect(() => {
    if (isVisualTestScenario('profile-edit-modal')) {
      setShowEditModal(true);
    }
  }, []);

  if (!activeUser) return null;

  const showComingSoon = (title: string, message: string) => {
    crossAlert(title, message);
  };

  const handleSaveProfile = async () => {
    if (!user?.id || !form.full_name.trim()) {
      return;
    }

    const workoutsPerWeek = Math.min(7, Math.max(1, Number(form.workouts_per_week) || 3));
    const payload: Partial<UserProfile> = {
      full_name: form.full_name.trim(),
      goal: form.goal,
      workouts_per_week: workoutsPerWeek,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
    };

    setIsSaving(true);

    try {
      await profileService.upsertProfile(user.id, payload);
      setProfile(payload);
      await queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to save profile updates:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogWeight = async () => {
    const weightKg = Number(checkInWeight);

    if (!user?.id || !Number.isFinite(weightKg) || weightKg <= 0) {
      return;
    }

    try {
      await logWeight.mutateAsync(weightKg);
      setShowWeightModal(false);
    } catch (error) {
      console.error('Failed to log weight check-in:', error);
    }
  };

  const stats = [
    {
      label: 'Sessions',
      value: String(workoutHistory?.total_completed_sessions ?? 0),
      suffix: 'completed',
    },
    {
      label: 'Streak',
      value: String(habitStreak?.current_streak_days ?? 0),
      suffix: 'days active',
    },
    {
      label: 'Adherence',
      value: `${workoutHistory?.adherence_pct ?? 0}%`,
      suffix: `${workoutHistory?.completed_this_week ?? 0}/${workoutHistory?.weekly_target ?? workoutTarget} this week`,
    },
    {
      label: 'Avg Session',
      value:
        workoutHistory?.average_duration_seconds != null
          ? formatDuration(workoutHistory.average_duration_seconds)
          : '—',
      suffix: 'recent average',
    },
  ];

  const setupRows = [
    { icon: '🎯', label: 'Goal', value: activeUser.goal ? goalLabel(activeUser.goal) : 'Not set' },
    {
      icon: '⚡',
      label: 'Activity Level',
      value: activeUser.activity_level?.replace('_', ' ') || 'Not set',
    },
    {
      icon: '🏋️',
      label: 'Equipment',
      value: activeUser.equipment
        ? activeUser.equipment.slice(0, 2).join(', ') +
          (activeUser.equipment.length > 2 ? ' +more' : '')
        : 'Not set',
    },
    { icon: '📅', label: 'Workouts / week', value: `${activeUser.workouts_per_week ?? 0}x` },
    {
      icon: '🥗',
      label: 'Diet Preference',
      value: activeUser.diet_preference?.replace('_', ' ') || 'Not set',
    },
    {
      icon: '📍',
      label: 'Country',
      value:
        activeUser.country === 'AU'
          ? 'Australia 🇦🇺'
          : activeUser.country === 'NP'
            ? 'Nepal 🇳🇵'
            : 'Other',
    },
  ];

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ProfileHeader
        fullName={activeUser.full_name}
        email={activeUser.email}
        goal={activeUser.goal}
        experienceLevel={activeUser.experience_level}
        isDemoSession={isDemoSession}
      />

      <ProfileStatsSection
        stats={stats}
        weightKg={activeUser.weight_kg ?? null}
        heightCm={activeUser.height_cm ?? null}
      />

      <Card style={styles.metricsCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.sectionTitleInline}>Progress Check-ins</Text>
            <Text style={styles.progressSubtext}>
              {weightProgress?.check_ins_this_month ?? 0} check-ins this month
            </Text>
          </View>
          <TouchableOpacity style={styles.inlineActionBtn} onPress={() => setShowWeightModal(true)}>
            <Text style={styles.inlineActionText}>Log Weight</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressHighlights}>
          <View style={styles.progressHighlight}>
            <Text style={styles.progressHighlightLabel}>Current</Text>
            <Text style={styles.progressHighlightValue}>
              {weightProgress?.current_weight_kg != null
                ? `${weightProgress.current_weight_kg.toFixed(1)}kg`
                : '—'}
            </Text>
          </View>
          <View style={styles.progressHighlight}>
            <Text style={styles.progressHighlightLabel}>Trend</Text>
            <Text style={styles.progressHighlightValue}>
              {weightProgress?.change_kg_14d == null
                ? '—'
                : `${weightProgress.change_kg_14d > 0 ? '+' : ''}${weightProgress.change_kg_14d.toFixed(1)}kg`}
            </Text>
          </View>
          <View style={styles.progressHighlight}>
            <Text style={styles.progressHighlightLabel}>Last check-in</Text>
            <Text style={styles.progressHighlightValueSmall}>
              {weightProgress?.last_logged_at
                ? new Date(weightProgress.last_logged_at).toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'short',
                  })
                : '—'}
            </Text>
          </View>
        </View>

        <View style={styles.progressHistoryList}>
          {weightProgress?.recent_logs.length ? (
            weightProgress.recent_logs.map((entry) => (
              <View key={entry.id} style={styles.progressHistoryRow}>
                <View>
                  <Text style={styles.progressHistoryWeight}>{entry.weight_kg.toFixed(1)}kg</Text>
                  <Text style={styles.progressHistoryDate}>
                    {new Date(entry.logged_at).toLocaleDateString('en-AU', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
                <Text style={styles.progressHistoryTag}>Check-in</Text>
              </View>
            ))
          ) : (
            <Text style={styles.progressEmptyText}>
              Your recent weight check-ins will appear here.
            </Text>
          )}
        </View>
      </Card>

      <WeightTrendCard
        colors={colors}
        weightProgress={weightProgress ?? null}
        goalWeight={goalWeight}
      />

      <View style={{ height: Spacing.xl }} />

      <Text style={styles.sectionTitle}>My Setup</Text>
      <View style={styles.setupList}>
        {setupRows.map((row, i) => (
          <View key={row.label}>
            <View style={styles.setupRow}>
              <View style={styles.setupLeft}>
                <Text style={styles.setupIcon}>{row.icon}</Text>
                <Text style={styles.setupLabel}>{row.label}</Text>
              </View>
              <Text style={styles.setupValue}>{row.value}</Text>
            </View>
            {i < setupRows.length - 1 && <Divider style={styles.rowDivider} />}
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setShowEditModal(true)}
          testID="profile-edit-button"
        >
          <Text style={styles.actionBtnText}>✏️ Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowWeightModal(true)}>
          <Text style={styles.actionBtnText}>📈 Log Weight Check-in</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            showComingSoon(
              'Notification settings are not wired yet',
              'This action is intentionally parked for the MVP so testers are not left with a dead tap.',
            )
          }
        >
          <Text style={styles.actionBtnText}>🔔 Notification Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            showComingSoon(
              'Workout regeneration is coming soon',
              'For the MVP, plan refresh still needs backend planning logic. Testers should use the existing workout plan flow instead.',
            )
          }
        >
          <Text style={styles.actionBtnText}>🤖 Regenerate Workout Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.signOutBtn]} onPress={signOut}>
          <Text style={styles.signOutText}>{isDemoSession ? 'Exit Demo' : 'Sign Out'}</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.appearanceFooterCard}>
        <Text style={styles.sectionTitleInline}>Appearance</Text>
        <Text style={styles.appearanceFooterText}>
          Switch between light and dark mode from the bottom of your profile.
        </Text>
        <ThemeModeToggle
          style={styles.appearanceFooterToggle}
          testIDPrefix="profile-theme-toggle"
        />
      </Card>

      <View style={{ height: 40 }} />

      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProfile}
        form={form}
        onFormChange={setForm}
        isSaving={isSaving}
        isDemoSession={isDemoSession}
      />

      <WeightCheckInModal
        visible={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        onLog={handleLogWeight}
        weight={checkInWeight}
        onWeightChange={setCheckInWeight}
        isPending={logWeight.isPending}
      />
    </ScrollView>
  );
}
