import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { bookmarkApi, progressApi } from "../../api";
import { useAuthStore } from "../../stores/authStore";
import { EpisodeCard } from "../../components/episode/EpisodeCard";
import { Colors, Typography, Spacing, Radius } from "../../theme";
import { formatTime } from "../../utils";

type Tab = "bookmarks" | "history";

export function LibraryScreen() {
  const nav = useNavigation<any>();
  const { user, isAuthenticated } = useAuthStore();
  const [tab, setTab] = useState<Tab>("bookmarks");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    Promise.all([
      bookmarkApi.list(),
      progressApi.all(),
    ]).then(([bRes, pRes]) => {
      if (bRes.success) setBookmarks(bRes.data.map((b: any) => b.episodeId).filter(Boolean));
      if (pRes.success) setHistory(pRes.data.filter((p: any) => p.episodeId));
      setLoading(false);
    });
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.loginPrompt}>
          <Text style={s.loginEmoji}>📚</Text>
          <Text style={s.loginTitle}>Your Library</Text>
          <Text style={s.loginDesc}>Sign in to save episodes and track your progress</Text>
          <TouchableOpacity style={s.loginBtn} onPress={() => nav.navigate("Auth")}>
            <Text style={s.loginBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const data = tab === "bookmarks" ? bookmarks : history.map((p: any) => p.episodeId);

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <Text style={s.screenTitle}>My Library</Text>

      <View style={s.tabs}>
        {[["bookmarks", "Saved"], ["history", "History"]].map(([key, label]) => (
          <TouchableOpacity key={key} style={[s.tab, tab === key && s.tabActive]} onPress={() => setTab(key as Tab)}>
            <Text style={[s.tabText, tab === key && s.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={data.filter(Boolean)}
          keyExtractor={(i, idx) => (i?._id || idx.toString())}
          contentContainerStyle={s.list}
          renderItem={({ item }) => item ? <EpisodeCard episode={item} horizontal /> : null}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>{tab === "bookmarks" ? "🔖" : "📖"}</Text>
              <Text style={s.emptyTitle}>{tab === "bookmarks" ? "No saved episodes" : "No listening history"}</Text>
              <Text style={s.emptySub}>{tab === "bookmarks" ? "Bookmark episodes to find them here" : "Start listening to track your progress"}</Text>
              <TouchableOpacity style={s.exploreBtn} onPress={() => nav.navigate("Explore")}>
                <Text style={s.exploreBtnText}>Browse Episodes</Text>
              </TouchableOpacity>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  screenTitle: { fontSize: Typography.size["2xl"], fontWeight: Typography.weight.bold, color: Colors.textPrimary, paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  tabs: { flexDirection: "row", marginHorizontal: Spacing.base, marginBottom: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 4 },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: "center", borderRadius: Radius.md },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, color: Colors.textSecondary },
  tabTextActive: { color: Colors.textInverse },
  list: { padding: Spacing.base },
  empty: { alignItems: "center", paddingTop: Spacing["4xl"] },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptySub: { fontSize: Typography.size.base, color: Colors.textSecondary, textAlign: "center", paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  exploreBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.lg },
  exploreBtnText: { color: Colors.textInverse, fontWeight: Typography.weight.bold },
  loginPrompt: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xl },
  loginEmoji: { fontSize: 56, marginBottom: Spacing.lg },
  loginTitle: { fontSize: Typography.size["2xl"], fontWeight: Typography.weight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  loginDesc: { fontSize: Typography.size.base, color: Colors.textSecondary, textAlign: "center", marginBottom: Spacing.xl },
  loginBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.lg },
  loginBtnText: { color: Colors.textInverse, fontWeight: Typography.weight.bold },
});
