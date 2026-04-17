import React from 'react';
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
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Colors,
  Spacing,
  Radius,
  Typography,
  getLineHeightScale,
  getTypeScale,
  withAlpha,
} from '../../src/constants/theme';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { Card, Badge, Divider } from '../../src/components/ui';
import { goalLabel } from '../../src/utils/helpers';
import { useProfile } from '../../src/hooks/useProfile';
import { useState, useEffect } from 'react';
import { profileService } from '../../src/services/profileService';
import { useQueryClient } from '@tanstack/react-query';
import type { UserProfile, GoalType } from '../../src/types/app';
import { crossAlert } from '../../src/utils/crossAlert';
import { isVisualTestScenario } from '../../src/utils/visualTest';
import { useWeightHistory } from '../../src/hooks/useWeightHistory';
import { useWeightActions } from '../../src/hooks/useWeightActions';
import { useProfileAdherence } from '../../src/hooks/useProfileAdherence';

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
  const { width } = useWindowDimensions();
  const typeScale = getTypeScale(width);
  const lineHeights = getLineHeightScale(width);
  const queryClient = useQueryClient();
  const { user, signOut, isDemoSession, setProfile } = useAuthStore();
  const { data: profile } = useProfile(user?.id);
  const { data: weightHistory } = useWeightHistory(user?.id);
  const { addWeightLog } = useWeightActions(user?.id);
  const { data: adherenceSummary } = useProfileAdherence(user?.id);
  const activeUser = profile ?? user;
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [weightNotes, setWeightNotes] = useState('');
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

  useEffect(() => {
    if (activeUser?.weight_kg != null) {
      setWeightInput(String(activeUser.weight_kg));
    }
  }, [activeUser?.weight_kg]);

  if (!activeUser) return null;

  const latestWeight = weightHistory?.[0]?.weight_kg ?? activeUser.weight_kg ?? null;
  const previousWeight = weightHistory?.[1]?.weight_kg ?? null;
  const weightDelta =
    latestWeight != null && previousWeight != null
      ? Number((latestWeight - previousWeight).toFixed(1))
      : null;

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
      await queryClient.invalidateQueries({ queryKey: ['weekly-coach-summary', user.id] });
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to save profile updates:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const stats = [
    {
      label: 'Workouts',
      value: String(adherenceSummary?.workouts_completed_30d ?? 0),
      suffix: 'last 30 days',
    },
    {
      label: 'Active Days',
      value: `${adherenceSummary?.active_days_this_week ?? 0}/7`,
      suffix: 'this week',
    },
    {
      label: 'Streak',
      value: String(adherenceSummary?.current_streak_days ?? 0),
      suffix: 'days',
    },
    {
      label: 'Latest Weight',
      value:
        adherenceSummary?.latest_weight_kg != null
          ? `${adherenceSummary.latest_weight_kg.toFixed(1)}kg`
          : latestWeight != null
            ? `${latestWeight.toFixed(1)}kg`
            : '—',
      suffix: 'latest check-in',
    },
  ];

  const setupRows = [
    { icon: '🎯', label: 'Goal', value: activeUser?.goal ? goalLabel(activeUser.goal) : 'Not set' },
    { icon: '⚡', label: 'Activity Level', value: activeUser?.activity_level?.replace('_', ' ') || 'Not set' },
    { icon: '🏋️', label: 'Equipment', value: activeUser?.equipment ? activeUser.equipment.slice(0, 2).join(', ') + (activeUser.equipment.length > 2 ? ' +more' : '') : 'Not set' },
    { icon: '📅', label: 'Workouts / week', value: `${activeUser.workouts_per_week ?? 0}x` },
    { icon: '🥗', label: 'Diet Preference', value: activeUser?.diet_preference?.replace('_', ' ') || 'Not set' },
    { icon: '📍', label: 'Country', value: activeUser.country === 'AU' ? 'Australia 🇦🇺' : activeUser.country === 'NP' ? 'Nepal 🇳🇵' : 'Other' },
  ];

  const handleSaveWeightLog = async () => {
    const parsedWeight = Number(weightInput);

    if (!user?.id || !Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      return;
    }

    await addWeightLog.mutateAsync({
      weight_kg: parsedWeight,
      notes: weightNotes.trim() ? weightNotes.trim() : null,
    });

    setProfile({ weight_kg: parsedWeight });
    setWeightNotes('');
    setShowWeightModal(false);
  };

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile hero */}
      <View style={styles.hero}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>🧑‍💪</Text>
        </View>
        <Text style={[styles.fullName, { fontSize: typeScale.xxl, lineHeight: lineHeights.xxl }]}>
          {activeUser.full_name ?? 'Navya User'}
        </Text>
        <Text style={[styles.email, { fontSize: typeScale.sm, lineHeight: lineHeights.sm }]}>
          {activeUser.email}
        </Text>
        <View style={styles.badgeRow}>
          {isDemoSession && <Badge label="Demo Session" color={Colors.orange} />}
          {activeUser?.goal && <Badge label={goalLabel(activeUser.goal)} color={Colors.accent} />}
          {activeUser?.experience_level && <Badge label={activeUser.experience_level} color={Colors.green} />}
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={[styles.statValue, { fontSize: typeScale.xxl, lineHeight: lineHeights.xxl }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { fontSize: typeScale.sm, lineHeight: lineHeights.sm }]}>
              {stat.label}
            </Text>
            <Text style={[styles.statSuffix, { fontSize: typeScale.xs, lineHeight: lineHeights.xs }]}>
              {stat.suffix}
            </Text>
          </View>
        ))}
      </View>

      {/* Body metrics */}
      <Card style={styles.metricsCard}>
        <Text style={[styles.sectionTitle, { fontSize: typeScale.lg, lineHeight: lineHeights.lg }]}>
          Body Metrics
        </Text>
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={[styles.metricVal, { fontSize: typeScale.xl, lineHeight: lineHeights.xl }]}>
              {activeUser.weight_kg ?? '—'}
              <Text style={[styles.metricUnit, { fontSize: typeScale.sm, lineHeight: lineHeights.sm }]}>
                {' '}kg
              </Text>
            </Text>
            <Text style={[styles.metricLabel, { fontSize: typeScale.sm, lineHeight: lineHeights.sm }]}>
              Weight
            </Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={[styles.metricVal, { fontSize: typeScale.xl, lineHeight: lineHeights.xl }]}>
              {activeUser.height_cm ?? '—'}
              <Text style={[styles.metricUnit, { fontSize: typeScale.sm, lineHeight: lineHeights.sm }]}>
                {' '}cm
              </Text>
            </Text>
            <Text style={[styles.metricLabel, { fontSize: typeScale.sm, lineHeight: lineHeights.sm }]}>
              Height
            </Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={[styles.metricVal, { fontSize: typeScale.xl, lineHeight: lineHeights.xl }]}>
              {activeUser.weight_kg && activeUser.height_cm
                ? (activeUser.weight_kg / Math.pow(activeUser.height_cm / 100, 2)).toFixed(1)
                : '—'}
            </Text>
            <Text style={[styles.metricLabel, { fontSize: typeScale.sm, lineHeight: lineHeights.sm }]}>
              BMI
            </Text>
          </View>
        </View>
      </Card>

      <Text style={[styles.sectionTitle, { fontSize: typeScale.lg, lineHeight: lineHeights.lg }]}>
        Progress Check-Ins
      </Text>
      <Card style={styles.checkInCard}>
        <View style={styles.checkInHeader}>
          <View>
            <Text style={[styles.checkInValue, { fontSize: typeScale.xxl, lineHeight: lineHeights.xxl }]}>
              {latestWeight != null ? `${latestWeight.toFixed(1)} kg` : 'No check-in yet'}
            </Text>
            <Text style={[styles.checkInMeta, { fontSize: typeScale.sm, lineHeight: lineHeights.sm + 2 }]}>
              {weightHistory?.[0]
                ? `Logged ${new Date(weightHistory[0].logged_at).toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}`
                : 'Start a simple weekly trend from here.'}
            </Text>
          </View>
          <View
            style={[
              styles.checkInDeltaBadge,
              weightDelta != null && weightDelta <= 0 ? styles.checkInDeltaBadgePositive : null,
            ]}
          >
            <Text
              style={[
                styles.checkInDeltaText,
                { fontSize: typeScale.sm, lineHeight: lineHeights.sm },
                weightDelta != null && weightDelta <= 0 ? styles.checkInDeltaTextPositive : null,
              ]}
            >
              {weightDelta == null ? 'New' : `${weightDelta > 0 ? '+' : ''}${weightDelta} kg`}
            </Text>
          </View>
        </View>

        <View style={styles.historyRow}>
          {(weightHistory ?? []).slice(0, 4).map((entry) => (
            <View key={entry.id} style={styles.historyItem}>
              <Text style={[styles.historyValue, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}>
                {entry.weight_kg.toFixed(1)}
              </Text>
              <Text style={[styles.historyDate, { fontSize: typeScale.xs, lineHeight: lineHeights.xs }]}>
                {new Date(entry.logged_at).toLocaleDateString('en-AU', {
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.inlineActionBtn}
          onPress={() => setShowWeightModal(true)}
        >
          <Text style={[styles.inlineActionBtnText, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}>
            + Log Weight Check-In
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Setup rows */}
      <Text style={[styles.sectionTitle, { fontSize: typeScale.lg, lineHeight: lineHeights.lg }]}>
        My Setup
      </Text>
      <View style={styles.setupList}>
        {setupRows.map((row, i) => (
          <View key={row.label}>
            <View style={styles.setupRow}>
              <View style={styles.setupLeft}>
                <Text style={styles.setupIcon}>{row.icon}</Text>
                <Text style={[styles.setupLabel, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}>
                  {row.label}
                </Text>
              </View>
              <Text style={[styles.setupValue, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}>
                {row.value}
              </Text>
            </View>
            {i < setupRows.length - 1 && <Divider style={styles.rowDivider} />}
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setShowEditModal(true)}
          testID="profile-edit-button"
        >
          <Text style={[styles.actionBtnText, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}>
            ✏️  Edit Profile
          </Text>
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
          <Text style={[styles.actionBtnText, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}>
            🔔  Notification Settings
          </Text>
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
          <Text style={[styles.actionBtnText, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}>
            🤖  Regenerate Workout Plan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.signOutBtn]}
          onPress={signOut}
        >
          <Text style={[styles.signOutText, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}>
            {isDemoSession ? 'Exit Demo' : 'Sign Out'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 132 }} />

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
              <Text style={[styles.modalTitle, { fontSize: typeScale.xxl, lineHeight: lineHeights.xxl }]}>
                Edit Profile
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={[styles.modalClose, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { fontSize: typeScale.sm, lineHeight: lineHeights.sm }]}>
              Full Name
            </Text>
            <TextInput
              style={[styles.input, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}
              value={form.full_name}
              onChangeText={(value) => setForm((current) => ({ ...current, full_name: value }))}
              placeholder="Your name"
              placeholderTextColor={Colors.dim}
              testID="profile-full-name-input"
            />

            <Text style={[styles.fieldLabel, { fontSize: typeScale.sm, lineHeight: lineHeights.sm }]}>
              Goal
            </Text>
            <View style={styles.goalGrid}>
              {GOAL_OPTIONS.map((option) => {
                const selected = form.goal === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.goalChip, selected && styles.goalChipActive]}
                    onPress={() => setForm((current) => ({ ...current, goal: option.id }))}
                  >
                    <Text
                      style={[
                        styles.goalChipText,
                        { fontSize: typeScale.sm, lineHeight: lineHeights.sm },
                        selected && styles.goalChipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputCol}>
                <Text style={[styles.fieldLabel, { fontSize: typeScale.sm, lineHeight: lineHeights.sm }]}>
                  Weight (kg)
                </Text>
                <TextInput
                  style={[styles.input, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}
                  value={form.weight_kg}
                  onChangeText={(value) => setForm((current) => ({ ...current, weight_kg: value }))}
                  placeholder="78"
                  placeholderTextColor={Colors.dim}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputCol}>
                <Text style={[styles.fieldLabel, { fontSize: typeScale.sm, lineHeight: lineHeights.sm }]}>
                  Height (cm)
                </Text>
                <TextInput
                  style={[styles.input, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}
                  value={form.height_cm}
                  onChangeText={(value) => setForm((current) => ({ ...current, height_cm: value }))}
                  placeholder="178"
                  placeholderTextColor={Colors.dim}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={[styles.fieldLabel, { fontSize: typeScale.sm, lineHeight: lineHeights.sm }]}>
              Workouts Per Week
            </Text>
            <TextInput
              style={[styles.input, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}
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
              <Text style={[styles.saveBtnText, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}>
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
              <Text style={[styles.modalTitle, { fontSize: typeScale.xxl, lineHeight: lineHeights.xxl }]}>
                Weight Check-In
              </Text>
              <TouchableOpacity onPress={() => setShowWeightModal(false)}>
                <Text style={[styles.modalClose, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.weightHelper, { fontSize: typeScale.sm, lineHeight: lineHeights.sm + 2 }]}>
              Use this for lightweight weekly progress. The latest entry also updates your profile weight.
            </Text>

            <Text style={[styles.fieldLabel, { fontSize: typeScale.sm, lineHeight: lineHeights.sm }]}>
              Weight (kg)
            </Text>
            <TextInput
              style={[styles.input, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}
              value={weightInput}
              onChangeText={setWeightInput}
              placeholder="78.0"
              placeholderTextColor={Colors.dim}
              keyboardType="numeric"
            />

            <Text style={[styles.fieldLabel, { fontSize: typeScale.sm, lineHeight: lineHeights.sm }]}>
              Note
            </Text>
            <TextInput
              style={[styles.input, styles.weightNotesInput, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}
              value={weightNotes}
              onChangeText={setWeightNotes}
              placeholder="Optional note about sleep, stress, or consistency"
              placeholderTextColor={Colors.dim}
              multiline
            />

            <TouchableOpacity
              style={[styles.saveBtn, addWeightLog.isPending && styles.saveBtnDisabled]}
              onPress={handleSaveWeightLog}
              disabled={addWeightLog.isPending || !weightInput.trim()}
            >
              <Text style={[styles.saveBtnText, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}>
                {addWeightLog.isPending ? 'Saving...' : 'Save Check-In'}
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
  content: { paddingBottom: 132 },

  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  avatarContainer: {
    width: 84,
    height: 84,
    borderRadius: Radius.xl,
    backgroundColor: withAlpha(Colors.secondaryContainer, 0.9),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: withAlpha(Colors.secondary, 0.16),
  },
  avatarEmoji: { fontSize: 40 },
  fullName: {
    color: Colors.onSurface,
    fontWeight: Typography.weight.extrabold,
    letterSpacing: -0.8,
    marginBottom: 4,
    fontFamily: Typography.fontDisplay,
  },
  email: {
    color: Colors.onSurfaceVariant,
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
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: withAlpha(Colors.outlineVariant, 0.14),
  },
  statValue: {
    color: Colors.onSurface,
    fontWeight: Typography.weight.extrabold,
    letterSpacing: -0.5,
    fontFamily: Typography.fontDisplay,
  },
  statLabel: { color: Colors.onSurfaceVariant, marginTop: 2 },
  statSuffix: { color: Colors.dim },

  metricsCard: { marginHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.md },
  metric: { alignItems: 'center' },
  metricVal: {
    color: Colors.onSurface,
    fontWeight: Typography.weight.bold,
    fontFamily: Typography.fontDisplay,
  },
  metricUnit: { color: Colors.onSurfaceVariant },
  metricLabel: { color: Colors.onSurfaceVariant, marginTop: 2 },
  metricDivider: { width: 1, backgroundColor: withAlpha(Colors.outlineVariant, 0.12) },
  checkInCard: { marginHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  checkInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  checkInValue: {
    color: Colors.onSurface,
    fontWeight: Typography.weight.extrabold,
    letterSpacing: -0.5,
    fontFamily: Typography.fontDisplay,
  },
  checkInMeta: {
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  checkInDeltaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.orangeMuted,
    borderColor: withAlpha(Colors.orange, 0.16),
    borderWidth: 1,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  checkInDeltaBadgePositive: {
    backgroundColor: Colors.greenMuted,
    borderColor: withAlpha(Colors.green, 0.16),
  },
  checkInDeltaText: {
    color: Colors.orange,
    fontWeight: Typography.weight.bold,
  },
  checkInDeltaTextPositive: {
    color: Colors.green,
  },
  historyRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  historyItem: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: withAlpha(Colors.outlineVariant, 0.14),
    alignItems: 'center',
  },
  historyValue: {
    color: Colors.onSurface,
    fontWeight: Typography.weight.bold,
  },
  historyDate: {
    color: Colors.dim,
    marginTop: 4,
  },
  inlineActionBtn: {
    backgroundColor: withAlpha(Colors.secondaryContainer, 0.38),
    borderColor: withAlpha(Colors.secondary, 0.14),
    borderWidth: 1,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  inlineActionBtnText: {
    color: Colors.onSecondaryContainer,
    fontWeight: Typography.weight.bold,
  },

  sectionTitle: {
    color: Colors.onSurface,
    fontWeight: Typography.weight.bold,
    fontFamily: Typography.fontDisplay,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },

  setupList: {
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withAlpha(Colors.outlineVariant, 0.14),
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
  setupLabel: { color: Colors.onSurfaceVariant },
  setupValue: {
    color: Colors.onSurface,
    fontWeight: Typography.weight.semibold,
    textTransform: 'capitalize',
  },
  rowDivider: { marginVertical: 0 },

  actions: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  actionBtn: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: withAlpha(Colors.outlineVariant, 0.14),
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
    color: Colors.onSurface,
    fontWeight: Typography.weight.extrabold,
    fontFamily: Typography.fontDisplay,
  },
  modalClose: {
    color: Colors.primary,
    fontWeight: Typography.weight.semibold,
  },
  fieldLabel: {
    color: Colors.onSecondaryContainer,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: withAlpha(Colors.outlineVariant, 0.14),
    borderWidth: 1,
    borderRadius: Radius.xl,
    color: Colors.onSurface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  weightHelper: {
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.md,
  },
  weightNotesInput: {
    minHeight: 96,
    textAlignVertical: 'top',
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
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withAlpha(Colors.outlineVariant, 0.14),
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  goalChipActive: {
    backgroundColor: Colors.accentMuted,
    borderColor: withAlpha(Colors.primary, 0.22),
  },
  goalChipText: {
    color: Colors.onSurfaceVariant,
    fontWeight: Typography.weight.semibold,
  },
  goalChipTextActive: {
    color: Colors.primary,
  },
  saveBtn: {
    marginTop: Spacing.xxl,
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: withAlpha(Colors.primary, 0.16),
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: Colors.onPrimary,
    fontWeight: Typography.weight.bold,
  },
  actionBtnText: {
    color: Colors.onSurface,
    fontWeight: Typography.weight.medium,
  },
  signOutBtn: {
    borderColor: withAlpha(Colors.red, 0.16),
    backgroundColor: Colors.redMuted,
    marginTop: Spacing.sm,
  },
  signOutText: {
    color: Colors.red,
    fontWeight: Typography.weight.semibold,
    textAlign: 'center',
  },
});
