import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing, Radius, Typography } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, Badge, Divider } from '@/components/ui';
import { formatDuration, goalLabel } from '@/utils/helpers';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useWeightActions } from '@/features/profile/hooks/useWeightActions';
import { useWeightProgress } from '@/features/profile/hooks/useWeightProgress';
import { useHabitStreak } from '@/features/home/hooks/useHabitStreak';
import { useWorkoutHistory } from '@/features/workout/hooks/useWorkoutHistory';
import { profileService } from '@/features/profile/api/profile.service';
import type { GoalType, UserProfile } from '@/types/app';
import { crossAlert } from '@/utils/crossAlert';
import { isVisualTestScenario } from '@/utils/visualTest';

type EditProfileForm = {
  full_name: string;
  weight_kg: string;
  height_cm: string;
  goal: GoalType;
  workouts_per_week: string;
};

const GOAL_OPTIONS: Array<{ id: GoalType; label: string }> = [
  { id: 'build_muscle', label: 'Build Muscle' },
  { id: 'lose_weight', label: 'Lose Weight' },
  { id: 'maintain', label: 'Maintain' },
  { id: 'improve_endurance', label: 'Endurance' },
  { id: 'general_fitness', label: 'General Fitness' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { user, signOut, isDemoSession, setProfile } = useAuthStore();
  const { data: profile } = useProfile(user?.id);
  const { data: weightProgress } = useWeightProgress(user?.id);
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
    setCheckInWeight(
      activeUser.weight_kg != null ? String(activeUser.weight_kg) : '',
    );
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
    { icon: '⚡', label: 'Activity Level', value: activeUser.activity_level?.replace('_', ' ') || 'Not set' },
    { icon: '🏋️', label: 'Equipment', value: activeUser.equipment ? activeUser.equipment.slice(0, 2).join(', ') + (activeUser.equipment.length > 2 ? ' +more' : '') : 'Not set' },
    { icon: '📅', label: 'Workouts / week', value: `${activeUser.workouts_per_week ?? 0}x` },
    { icon: '🥗', label: 'Diet Preference', value: activeUser.diet_preference?.replace('_', ' ') || 'Not set' },
    { icon: '📍', label: 'Country', value: activeUser.country === 'AU' ? 'Australia 🇦🇺' : activeUser.country === 'NP' ? 'Nepal 🇳🇵' : 'Other' },
  ];

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>🧑‍💪</Text>
        </View>
        <Text style={styles.fullName}>{activeUser.full_name ?? 'Navya User'}</Text>
        <Text style={styles.email}>{activeUser.email}</Text>
        <View style={styles.badgeRow}>
          {isDemoSession && <Badge label="Demo Session" color={Colors.orange} />}
          {activeUser.goal && <Badge label={goalLabel(activeUser.goal)} color={Colors.accent} />}
          {activeUser.experience_level && <Badge label={activeUser.experience_level} color={Colors.green} />}
        </View>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statSuffix}>{stat.suffix}</Text>
          </View>
        ))}
      </View>

      <Card style={styles.metricsCard}>
        <Text style={styles.sectionTitle}>Body Metrics</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricVal}>
              {activeUser.weight_kg ?? '—'}
              <Text style={styles.metricUnit}> kg</Text>
            </Text>
            <Text style={styles.metricLabel}>Weight</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={styles.metricVal}>
              {activeUser.height_cm ?? '—'}
              <Text style={styles.metricUnit}> cm</Text>
            </Text>
            <Text style={styles.metricLabel}>Height</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={styles.metricVal}>
              {activeUser.weight_kg && activeUser.height_cm
                ? (activeUser.weight_kg / Math.pow(activeUser.height_cm / 100, 2)).toFixed(1)
                : '—'}
            </Text>
            <Text style={styles.metricLabel}>BMI</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.metricsCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.sectionTitleInline}>Progress Check-ins</Text>
            <Text style={styles.progressSubtext}>
              {weightProgress?.check_ins_this_month ?? 0} check-ins this month
            </Text>
          </View>
          <TouchableOpacity
            style={styles.inlineActionBtn}
            onPress={() => setShowWeightModal(true)}
          >
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
                  <Text style={styles.progressHistoryWeight}>
                    {entry.weight_kg.toFixed(1)}kg
                  </Text>
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
          <Text style={styles.actionBtnText}>✏️  Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setShowWeightModal(true)}
        >
          <Text style={styles.actionBtnText}>📈  Log Weight Check-in</Text>
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
          <Text style={styles.actionBtnText}>🔔  Notification Settings</Text>
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
          <Text style={styles.actionBtnText}>🤖  Regenerate Workout Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.signOutBtn]}
          onPress={signOut}
        >
          <Text style={styles.signOutText}>{isDemoSession ? 'Exit Demo' : 'Sign Out'}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />

      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalScreen}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={form.full_name}
              onChangeText={(value) => setForm((current) => ({ ...current, full_name: value }))}
              placeholder="Your name"
              placeholderTextColor={Colors.dim}
              testID="profile-full-name-input"
            />

            <Text style={styles.fieldLabel}>Goal</Text>
            <View style={styles.goalGrid}>
              {GOAL_OPTIONS.map((option) => {
                const selected = form.goal === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.goalChip, selected && styles.goalChipActive]}
                    onPress={() => setForm((current) => ({ ...current, goal: option.id }))}
                  >
                    <Text style={[styles.goalChipText, selected && styles.goalChipTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputCol}>
                <Text style={styles.fieldLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={form.weight_kg}
                  onChangeText={(value) => setForm((current) => ({ ...current, weight_kg: value }))}
                  placeholder="78"
                  placeholderTextColor={Colors.dim}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputCol}>
                <Text style={styles.fieldLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={form.height_cm}
                  onChangeText={(value) => setForm((current) => ({ ...current, height_cm: value }))}
                  placeholder="178"
                  placeholderTextColor={Colors.dim}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Workouts Per Week</Text>
            <TextInput
              style={styles.input}
              value={form.workouts_per_week}
              onChangeText={(value) =>
                setForm((current) => ({ ...current, workouts_per_week: value }))
              }
              placeholder="3"
              placeholderTextColor={Colors.dim}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
              onPress={handleSaveProfile}
              disabled={isSaving || !form.full_name.trim()}
              testID="profile-save-button"
            >
              <Text style={styles.saveBtnText}>
                {isSaving ? 'Saving...' : isDemoSession ? 'Save Demo Profile' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showWeightModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWeightModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalScreen}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Weight Check-in</Text>
              <TouchableOpacity onPress={() => setShowWeightModal(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={checkInWeight}
              onChangeText={setCheckInWeight}
              placeholder="79.4"
              placeholderTextColor={Colors.dim}
              keyboardType="numeric"
            />

            <Text style={styles.progressModalHint}>
              This saves a timestamped check-in and updates your current profile weight.
            </Text>

            <TouchableOpacity
              style={[styles.saveBtn, logWeight.isPending && styles.saveBtnDisabled]}
              onPress={handleLogWeight}
              disabled={logWeight.isPending || !checkInWeight.trim()}
            >
              <Text style={styles.saveBtnText}>
                {logWeight.isPending ? 'Saving...' : 'Save Check-in'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingBottom: 40 },

  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  avatarContainer: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.accent + '55',
  },
  avatarEmoji: { fontSize: 40 },
  fullName: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extrabold,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  email: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
    marginBottom: Spacing.md,
  },
  badgeRow: { flexDirection: 'row', gap: Spacing.sm },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extrabold,
    letterSpacing: -0.5,
  },
  statLabel: { color: Colors.textSecondary, fontSize: Typography.size.sm, marginTop: 2 },
  statSuffix: { color: Colors.dim, fontSize: Typography.size.xs },

  metricsCard: { marginHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.md },
  metric: { alignItems: 'center' },
  metricVal: {
    color: Colors.text,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  metricUnit: { color: Colors.muted, fontSize: Typography.size.sm },
  metricLabel: { color: Colors.muted, fontSize: Typography.size.sm, marginTop: 2 },
  metricDivider: { width: 1, backgroundColor: Colors.border },

  sectionTitle: {
    color: Colors.text,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitleInline: {
    color: Colors.text,
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
    color: Colors.muted,
    fontSize: Typography.size.sm,
    marginTop: 4,
  },
  inlineActionBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentMuted,
    borderWidth: 1,
    borderColor: Colors.accent + '55',
  },
  inlineActionText: {
    color: Colors.accent,
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
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressHighlightLabel: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    marginBottom: 4,
  },
  progressHighlightValue: {
    color: Colors.text,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  progressHighlightValueSmall: {
    color: Colors.text,
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
    borderTopColor: Colors.border,
  },
  progressHistoryWeight: {
    color: Colors.text,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  progressHistoryDate: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
    marginTop: 2,
  },
  progressHistoryTag: {
    color: Colors.accent,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  progressEmptyText: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },

  setupList: {
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
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
  setupLabel: { color: Colors.muted, fontSize: Typography.size.md },
  setupValue: {
    color: Colors.text,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    textTransform: 'capitalize',
  },
  rowDivider: { marginVertical: 0 },

  actions: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  actionBtn: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalScreen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: 48,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extrabold,
  },
  modalClose: {
    color: Colors.accent,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.lg,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.size.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  inputCol: {
    flex: 1,
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  goalChip: {
    backgroundColor: Colors.card,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  goalChipActive: {
    backgroundColor: Colors.accentMuted,
    borderColor: Colors.accent,
  },
  goalChipText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  goalChipTextActive: {
    color: Colors.accent,
  },
  saveBtn: {
    marginTop: Spacing.xxl,
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  progressModalHint: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
    lineHeight: 20,
    marginTop: Spacing.md,
  },
  actionBtnText: {
    color: Colors.text,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.medium,
  },
  signOutBtn: {
    borderColor: Colors.red + '44',
    backgroundColor: Colors.redMuted,
    marginTop: Spacing.sm,
  },
  signOutText: {
    color: Colors.red,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    textAlign: 'center',
  },
});
