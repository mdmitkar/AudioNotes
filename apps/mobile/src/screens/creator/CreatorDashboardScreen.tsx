import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { creatorApi } from "../../api";
import { Colors, Typography, Spacing, Radius } from "../../theme";
import { formatDuration, timeAgo } from "../../utils";

const STATUS_COLORS: Record<string, string> = {
  draft: Colors.textMuted,
  pending: Colors.warning,
  published: Colors.success,
  rejected: Colors.error,
};

const STATUS_ICONS: Record<string, string> = {
  draft: "📝", pending: "⏳", published: "✅", rejected: "❌",
};

export function CreatorDashboardScreen() {
  const nav = useNavigation<any>();
  const [profile, setProfile] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      creatorApi.profile(),
      creatorApi.episodes(),
      creatorApi.analytics(),
    ]).then(([pRes, eRes, aRes]) => {
      if (pRes.success) setProfile(pRes.data);
      if (eRes.success) setEpisodes(eRes.data);
      if (aRes.success) setAnalytics(aRes.data);
      setLoading(false);
    });
  }, []);

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.back}><Text style={s.backText}>← Back</Text></TouchableOpacity>
        <Text style={s.title}>Creator Dashboard</Text>
        <TouchableOpacity style={s.uploadBtn} onPress={() => nav.navigate("UploadEpisode")}>
          <Text style={s.uploadBtnText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Analytics */}
          {analytics && (
            <View style={s.analyticsGrid}>
              {[
                { label: "Total Episodes", value: analytics.totalEpisodes, icon: "🎙️" },
                { label: "Published", value: analytics.publishedEpisodes, icon: "✅" },
                { label: "Pending", value: analytics.pendingEpisodes, icon: "⏳" },
                { label: "Total Plays", value: analytics.totalPlays, icon: "▶️" },
              ].map(stat => (
                <View key={stat.label} style={s.statCard}>
                  <Text style={s.statIcon}>{stat.icon}</Text>
                  <Text style={s.statValue}>{stat.value}</Text>
                  <Text style={s.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={s.sectionTitle}>My Episodes</Text>
          {episodes.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>No episodes yet. Upload your first audio note!</Text>
            </View>
          ) : (
            episodes.map(ep => (
              <View key={ep._id} style={s.episodeRow}>
                <View style={[s.epThumb, { backgroundColor: ep.exam?.color + "33" || Colors.primaryMuted }]}>
                  <Text>{ep.exam?.icon || "🎙️"}</Text>
                </View>
                <View style={s.epInfo}>
                  <Text style={s.epTitle} numberOfLines={1}>{ep.title}</Text>
                  <Text style={s.epMeta}>{ep.subject?.name} • {formatDuration(ep.duration)}</Text>
                  <Text style={s.epDate}>{timeAgo(ep.createdAt)}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[ep.status] + "33" }]}>
                  <Text style={s.statusIcon}>{STATUS_ICONS[ep.status]}</Text>
                  <Text style={[s.statusText, { color: STATUS_COLORS[ep.status] }]}>{ep.status}</Text>
                </View>
              </View>
            ))
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
  back: { marginRight: Spacing.sm },
  backText: { color: Colors.textSecondary, fontSize: Typography.size.base },
  title: { flex: 1, fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  uploadBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.lg },
  uploadBtnText: { color: Colors.textInverse, fontWeight: Typography.weight.bold, fontSize: Typography.size.sm },
  analyticsGrid: { flexDirection: "row", flexWrap: "wrap", padding: Spacing.base, gap: Spacing.md },
  statCard: { width: "46%", backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, alignItems: "center" },
  statIcon: { fontSize: 24, marginBottom: Spacing.xs },
  statValue: { fontSize: Typography.size["2xl"], fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: Typography.size.xs, color: Colors.textSecondary, textAlign: "center", marginTop: 2 },
  sectionTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.textPrimary, paddingHorizontal: Spacing.base, marginBottom: Spacing.md },
  episodeRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.md },
  epThumb: { width: 48, height: 48, borderRadius: Radius.md, justifyContent: "center", alignItems: "center" },
  epInfo: { flex: 1 },
  epTitle: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  epMeta: { fontSize: Typography.size.xs, color: Colors.textSecondary, marginTop: 2 },
  epDate: { fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  statusIcon: { fontSize: 12 },
  statusText: { fontSize: Typography.size.xs, fontWeight: Typography.weight.bold, textTransform: "capitalize" },
  empty: { padding: Spacing.xl, alignItems: "center" },
  emptyText: { color: Colors.textSecondary, textAlign: "center" },
});
