import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { adminApi } from "../../api";
import { Colors, Typography, Spacing, Radius } from "../../theme";
import { formatDuration, timeAgo } from "../../utils";

type AdminTab = "overview" | "pending" | "episodes" | "users";

export function AdminDashboardScreen() {
  const nav = useNavigation<any>();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [sRes, pRes] = await Promise.all([adminApi.stats(), adminApi.pending()]);
    if (sRes.success) setStats(sRes.data);
    if (pRes.success) setPending(pRes.data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const approve = async (id: string, featured?: boolean) => {
    const res = await adminApi.approveEpisode(id, featured);
    if (res.success) {
      setPending(p => p.filter(ep => ep._id !== id));
      Alert.alert("Approved!", "Episode is now published.");
    }
  };

  const reject = async (id: string) => {
    Alert.alert("Reject Episode", "Provide a reason (optional):", [
      { text: "Reject", style: "destructive", onPress: async () => {
        const res = await adminApi.rejectEpisode(id, "Did not meet quality standards");
        if (res.success) setPending(p => p.filter(ep => ep._id !== id));
      }},
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()}><Text style={s.backText}>← Back</Text></TouchableOpacity>
        <Text style={s.title}>Admin Dashboard</Text>
        <TouchableOpacity onPress={loadData}><Text style={s.refreshText}>Refresh</Text></TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabBar} contentContainerStyle={s.tabContent}>
        {(["overview", "pending", "episodes", "users"] as AdminTab[]).map(t => (
          <TouchableOpacity key={t} style={[s.tabBtn, tab === t && s.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabBtnText, tab === t && s.tabBtnTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {tab === "overview" && stats && (
            <View>
              <View style={s.statsGrid}>
                {[
                  { icon: "👥", label: "Total Users", value: stats.totalUsers },
                  { icon: "🎙️", label: "Creators", value: stats.totalCreators },
                  { icon: "📻", label: "Episodes", value: stats.totalEpisodes },
                  { icon: "✅", label: "Published", value: stats.publishedEpisodes },
                  { icon: "⏳", label: "Pending", value: stats.pendingEpisodes, highlight: stats.pendingEpisodes > 0 },
                  { icon: "💎", label: "Premium", value: stats.premiumEpisodes },
                  { icon: "⏱️", label: "Listen Minutes", value: stats.totalListeningMinutes },
                ].map(st => (
                  <View key={st.label} style={[s.statCard, (st as any).highlight && s.statCardHighlight]}>
                    <Text style={s.statIcon}>{st.icon}</Text>
                    <Text style={[s.statValue, (st as any).highlight && s.statValueHighlight]}>{st.value || 0}</Text>
                    <Text style={s.statLabel}>{st.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {tab === "pending" && (
            <View style={s.pendingList}>
              {pending.length === 0 ? (
                <View style={s.empty}>
                  <Text style={s.emptyEmoji}>✅</Text>
                  <Text style={s.emptyText}>No pending episodes</Text>
                </View>
              ) : (
                pending.map(ep => (
                  <View key={ep._id} style={s.pendingCard}>
                    <View style={[s.pendingThumb, { backgroundColor: ep.exam?.color + "33" || Colors.primaryMuted }]}>
                      <Text>{ep.exam?.icon || "🎙️"}</Text>
                    </View>
                    <View style={s.pendingInfo}>
                      <Text style={s.pendingTitle} numberOfLines={2}>{ep.title}</Text>
                      <Text style={s.pendingMeta}>by {ep.creatorId?.name} • {formatDuration(ep.duration)}</Text>
                      <Text style={s.pendingMeta}>{ep.exam?.name} • {ep.subjectId?.name}</Text>
                      <Text style={s.pendingDate}>{timeAgo(ep.createdAt)}</Text>
                    </View>
                    <View style={s.pendingActions}>
                      <TouchableOpacity style={s.approveBtn} onPress={() => approve(ep._id)}>
                        <Text style={s.approveBtnText}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.rejectBtn} onPress={() => reject(ep._id)}>
                        <Text style={s.rejectBtnText}>✗</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {(tab === "episodes" || tab === "users") && (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🔧</Text>
              <Text style={s.emptyText}>Full {tab} management — use the web admin panel for advanced management</Text>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  backText: { color: Colors.textSecondary, fontSize: Typography.size.base, marginRight: Spacing.sm },
  title: { flex: 1, fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  refreshText: { color: Colors.primary, fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold },
  tabBar: { marginVertical: Spacing.xs },
  tabContent: { paddingHorizontal: Spacing.base, gap: Spacing.sm, paddingVertical: Spacing.xs, alignItems: "center" },
  tabBtn: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  tabBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabBtnText: { fontSize: Typography.size.sm, color: Colors.textSecondary, fontWeight: Typography.weight.medium },
  tabBtnTextActive: { color: Colors.textInverse, fontWeight: Typography.weight.bold },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", padding: Spacing.base, gap: Spacing.md },
  statCard: { width: "46%", backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, alignItems: "center" },
  statCardHighlight: { backgroundColor: Colors.warning + "22", borderWidth: 1, borderColor: Colors.warning },
  statIcon: { fontSize: 24, marginBottom: Spacing.xs },
  statValue: { fontSize: Typography.size["2xl"], fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  statValueHighlight: { color: Colors.warning },
  statLabel: { fontSize: Typography.size.xs, color: Colors.textSecondary, textAlign: "center", marginTop: 2 },
  pendingList: { padding: Spacing.base, gap: Spacing.md },
  pendingCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: "row", gap: Spacing.md, alignItems: "flex-start" },
  pendingThumb: { width: 48, height: 48, borderRadius: Radius.md, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  pendingInfo: { flex: 1 },
  pendingTitle: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary, marginBottom: 4 },
  pendingMeta: { fontSize: Typography.size.xs, color: Colors.textSecondary, marginBottom: 2 },
  pendingDate: { fontSize: Typography.size.xs, color: Colors.textMuted },
  pendingActions: { gap: Spacing.sm, flexShrink: 0 },
  approveBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.success, justifyContent: "center", alignItems: "center" },
  approveBtnText: { color: Colors.textInverse, fontWeight: Typography.weight.bold },
  rejectBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.error, justifyContent: "center", alignItems: "center" },
  rejectBtnText: { color: Colors.textInverse, fontWeight: Typography.weight.bold },
  empty: { alignItems: "center", paddingTop: Spacing["4xl"], paddingHorizontal: Spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { color: Colors.textSecondary, textAlign: "center", fontSize: Typography.size.base },
});
