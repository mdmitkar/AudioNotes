import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { creatorApi } from "../../api";
import { Colors, Typography, Spacing, Radius } from "../../theme";
import { formatDuration, timeAgo } from "../../utils";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export function CreatorDashboardScreen() {
  const nav = useNavigation<any>();
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Focus listener to refresh when coming back from upload
    const unsubscribe = nav.addListener('focus', () => {
      fetchData();
    });
    fetchData();
    return unsubscribe;
  }, [nav]);

  const fetchData = () => {
    setLoading(true);
    creatorApi.episodes().then((eRes) => {
      if (eRes.success) setEpisodes(eRes.data);
      setLoading(false);
    });
  };

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>My Study Notes</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* Premium Banner */}
        <LinearGradient
          colors={[Colors.primary, Colors.primary + "AA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.banner}
        >
          <View style={s.bannerContent}>
            <Text style={s.bannerTitle}>Record. Listen. Ace GATE.</Text>
            <Text style={s.bannerSub}>Your personal audio revision hub.</Text>
            <TouchableOpacity 
              style={s.recordBtn} 
              activeOpacity={0.8}
              onPress={() => nav.navigate("UploadEpisode")}
            >
              <Text style={s.recordBtnIcon}>🎙️</Text>
              <Text style={s.recordBtnText}>New Audio Note</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.bannerEmoji}>🎧</Text>
        </LinearGradient>

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Recent Notes</Text>
          <Text style={s.sectionCount}>{episodes.length} notes</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        ) : episodes.length === 0 ? (
          <View style={s.empty}>
            <View style={s.emptyIconContainer}>
              <Text style={s.emptyIcon}>📝</Text>
            </View>
            <Text style={s.emptyTitle}>No Notes Yet</Text>
            <Text style={s.emptyText}>Tap the 'New Audio Note' button to record your first study note!</Text>
          </View>
        ) : (
          <View style={s.listContainer}>
            {episodes.map(ep => (
              <TouchableOpacity key={ep._id} style={s.noteCard} activeOpacity={0.7} onPress={() => nav.navigate("Player", { episodeId: ep._id })}>
                <View style={s.noteIconContainer}>
                  <Text style={s.noteIcon}>🎵</Text>
                </View>
                <View style={s.noteInfo}>
                  <Text style={s.noteTitle} numberOfLines={1}>{ep.title}</Text>
                  <View style={s.noteMetaRow}>
                    <Text style={s.noteMetaBadge}>{ep.subject?.name || "General"}</Text>
                    <Text style={s.noteMetaText}>• {formatDuration(ep.duration)}</Text>
                  </View>
                </View>
                <View style={s.noteRight}>
                  <Text style={s.noteDate}>{timeAgo(ep.createdAt)}</Text>
                  <Text style={s.playIcon}>▶</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, backgroundColor: Colors.background },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, justifyContent: "center", alignItems: "center", marginRight: Spacing.sm },
  backText: { color: Colors.textPrimary, fontSize: 20, fontWeight: "bold" },
  title: { flex: 1, fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  
  scrollContent: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
  
  banner: { borderRadius: Radius["2xl"], padding: Spacing.xl, flexDirection: "row", overflow: "hidden", marginBottom: Spacing.xl, elevation: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  bannerContent: { flex: 1, zIndex: 2 },
  bannerTitle: { color: Colors.textInverse, fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, marginBottom: 4 },
  bannerSub: { color: "rgba(255,255,255,0.8)", fontSize: Typography.size.sm, marginBottom: Spacing.lg },
  recordBtn: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.textInverse, alignSelf: "flex-start", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  recordBtnIcon: { fontSize: 18, marginRight: 6 },
  recordBtnText: { color: Colors.primary, fontWeight: Typography.weight.bold, fontSize: Typography.size.sm },
  bannerEmoji: { fontSize: 80, position: "absolute", right: -10, bottom: -10, opacity: 0.2, zIndex: 1 },
  
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  sectionCount: { fontSize: Typography.size.sm, color: Colors.textSecondary, fontWeight: Typography.weight.medium },
  
  listContainer: { gap: Spacing.sm },
  noteCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  noteIconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.primaryMuted, justifyContent: "center", alignItems: "center", marginRight: Spacing.md },
  noteIcon: { fontSize: 24 },
  noteInfo: { flex: 1, justifyContent: "center" },
  noteTitle: { fontSize: Typography.size.base, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary, marginBottom: 4 },
  noteMetaRow: { flexDirection: "row", alignItems: "center" },
  noteMetaBadge: { fontSize: 10, fontWeight: "bold", color: Colors.primary, backgroundColor: Colors.primaryMuted, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: "hidden", textTransform: "uppercase" },
  noteMetaText: { fontSize: Typography.size.xs, color: Colors.textSecondary, marginLeft: 6 },
  
  noteRight: { alignItems: "flex-end", justifyContent: "center", paddingLeft: Spacing.sm },
  noteDate: { fontSize: 10, color: Colors.textMuted, marginBottom: 8 },
  playIcon: { color: Colors.primary, fontSize: 18 },
  
  empty: { padding: Spacing["2xl"], alignItems: "center", backgroundColor: Colors.surface, borderRadius: Radius.xl, marginTop: Spacing.md },
  emptyIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryMuted, justifyContent: "center", alignItems: "center", marginBottom: Spacing.lg },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptyText: { color: Colors.textSecondary, textAlign: "center", lineHeight: 22, paddingHorizontal: Spacing.lg },
});
