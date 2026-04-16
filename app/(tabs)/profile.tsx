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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../../src/constants/theme';
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
  const { data: weightHistory } = useWeightHistory(user?.id);
  const { addWeightLog } = useWeightActions(user?.id);
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
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to save profile updates:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const stats = [
    { label: 'Workouts', value: '24', suffix: 'this month' },
    { label: 'Streak', value: '7', suffix: 'days' },
    { label: 'Cal Burned', value: '~18k', suffix: 'kcal' },
    {
      label: 'Latest Weight',
      value: latestWeight != null ? `${latestWeight.toFixed(1)}kg` : '—',
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
        <Text style={styles.fullName}>{activeUser.full_name ?? 'Navya User'}</Text>
        <Text style={styles.email}>{activeUser.email}</Text>
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
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statSuffix}>{stat.suffix}</Text>
          </View>
        ))}
      </View>

      {/* Body metrics */}
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

      <Text style={styles.sectionTitle}>Progress Check-Ins</Text>
      <Card style={styles.checkInCard}>
        <View style={styles.checkInHeader}>
          <View>
            <Text style={styles.checkInValue}>
              {latestWeight != null ? `${latestWeight.toFixed(1)} kg` : 'No check-in yet'}
            </Text>
            <Text style={styles.checkInMeta}>
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
              <Text style={styles.historyValue}>{entry.weight_kg.toFixed(1)}</Text>
              <Text style={styles.historyDate}>
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
          <Text style={styles.inlineActionBtnText}>+ Log Weight Check-In</Text>
        </TouchableOpacity>
      </Card>

      {/* Setup rows */}
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

      {/* Actions */}
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
              <Text style={styles.modalTitle}>Weight Check-In</Text>
              <TouchableOpacity onPress={() => setShowWeightModal(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.weightHelper}>
              Use this for lightweight weekly progress. The latest entry also updates your profile weight.
            </Text>

            <Text style={styles.fieldLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weightInput}
              onChangeText={setWeightInput}
              placeholder="78.0"
              placeholderTextColor={Colors.dim}
              keyboardType="numeric"
            />

            <Text style={styles.fieldLabel}>Note</Text>
            <TextInput
              style={[styles.input, styles.weightNotesInput]}
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
              <Text style={styles.saveBtnText}>
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
  checkInCard: { marginHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  checkInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  checkInValue: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extrabold,
    letterSpacing: -0.5,
  },
  checkInMeta: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
    marginTop: 4,
  },
  checkInDeltaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.orange + '22',
    borderColor: Colors.orange + '44',
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  checkInDeltaBadgePositive: {
    backgroundColor: Colors.greenMuted,
    borderColor: Colors.green + '44',
  },
  checkInDeltaText: {
    color: Colors.orange,
    fontSize: Typography.size.sm,
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
    backgroundColor: Colors.bg,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  historyValue: {
    color: Colors.text,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  historyDate: {
    color: Colors.dim,
    fontSize: Typography.size.xs,
    marginTop: 4,
  },
  inlineActionBtn: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.accent + '33',
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  inlineActionBtnText: {
    color: Colors.accent,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },

  sectionTitle: {
    color: Colors.text,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
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
  weightHelper: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
    lineHeight: 20,
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
    color: Colors.canopyBlack,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
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
