import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../../src/lib/theme';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { Card, Badge, Divider } from '../../src/components/ui';
import { goalLabel } from '../../src/utils/helpers';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuthStore();

  if (!user) return null;

  const stats = [
    { label: 'Workouts', value: '24', suffix: 'this month' },
    { label: 'Streak', value: '7', suffix: 'days' },
    { label: 'Cal Burned', value: '~18k', suffix: 'kcal' },
    { label: 'Avg Protein', value: '142g', suffix: 'per day' },
  ];

  const setupRows = [
    { icon: '🎯', label: 'Goal', value: goalLabel(user.goal) },
    { icon: '⚡', label: 'Activity Level', value: user.activity_level.replace('_', ' ') },
    { icon: '🏋️', label: 'Equipment', value: user.equipment.slice(0, 2).join(', ') + (user.equipment.length > 2 ? ' +more' : '') },
    { icon: '📅', label: 'Workouts / week', value: `${user.workouts_per_week}x` },
    { icon: '🥗', label: 'Diet Preference', value: user.diet_preference.replace('_', ' ') },
    { icon: '📍', label: 'Country', value: user.country === 'AU' ? 'Australia 🇦🇺' : user.country === 'NP' ? 'Nepal 🇳🇵' : 'Other' },
  ];

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
        <Text style={styles.fullName}>{user.full_name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.badgeRow}>
          <Badge label={goalLabel(user.goal)} color={Colors.accent} />
          <Badge label={user.experience_level} color={Colors.green} />
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
              {user.weight_kg ?? '—'}
              <Text style={styles.metricUnit}> kg</Text>
            </Text>
            <Text style={styles.metricLabel}>Weight</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={styles.metricVal}>
              {user.height_cm ?? '—'}
              <Text style={styles.metricUnit}> cm</Text>
            </Text>
            <Text style={styles.metricLabel}>Height</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={styles.metricVal}>
              {user.weight_kg && user.height_cm
                ? (user.weight_kg / Math.pow(user.height_cm / 100, 2)).toFixed(1)
                : '—'}
            </Text>
            <Text style={styles.metricLabel}>BMI</Text>
          </View>
        </View>
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
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>✏️  Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>🔔  Notification Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>🤖  Regenerate Workout Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.signOutBtn]}
          onPress={signOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
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
