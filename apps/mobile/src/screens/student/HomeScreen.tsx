import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../stores/authStore";
import { usePlayerStore } from "../../stores/playerStore";
import { episodeApi, examApi, progressApi } from "../../api";
import { EpisodeCard } from "../../components/episode/EpisodeCard";
import { Colors, Typography, Spacing, Radius } from "../../theme";
import { getGreeting, formatDurationShort, formatTime } from "../../utils";

export function HomeScreen() {
  const nav = useNavigation<any>();
  const { user } = useAuthStore();
  const { loadEpisode, episode: currentEpisode } = usePlayerStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [featured, setFeatured] = useState<any[]>([]);
  const [quick, setQuick] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [inProgress, setInProgress] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const [featRes, quickRes, popRes, examRes, recentRes] = await Promise.all([
        episodeApi.featured(),
        episodeApi.quick(),
        episodeApi.popular(),
        examApi.list(),
        episodeApi.list({ sort: "newest", limit: "10" }),
      ]);
      if (featRes.success) setFeatured(featRes.data);
      if (quickRes.success) setQuick(quickRes.data);
      if (popRes.success) setPopular(popRes.data);
      if (examRes.success) setExams(examRes.data);
      if (recentRes.success) setRecent(recentRes.data);

      if (user) {
        const progRes = await progressApi.inProgress();
        if (progRes.success) setInProgress(progRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handlePlay = async (ep: any) => {
    if (ep.isPremium && !ep.audioUrl) {
      nav.navigate("EpisodeDetail", { episodeId: ep._id, episode: ep });
      return;
    }
    await loadEpisode(ep);
  };

  const handleSearch = () => {
    if (search.trim()) nav.navigate("Explore", { q: search });
  };

  const selectedExam = user?.selectedExams?.[0] as any;

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={s.loadingText}>Loading your revision feed...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{getGreeting()}, {user?.name?.split(" ")[0] || "there"} 👋</Text>
            {selectedExam && (
              <TouchableOpacity style={s.examChip} onPress={() => nav.navigate("Explore")}>
                <Text style={s.examChipText}>{selectedExam.icon || "📚"} {selectedExam.name || "GATE CS"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search */}
        <View style={s.searchBar}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search topics, subjects..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* Continue Listening */}
        {inProgress.length > 0 && (
          <Section title="Continue Listening" onSeeAll={() => nav.navigate("Library")}>
            <FlatList
              horizontal
              data={inProgress}
              keyExtractor={i => i._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: Spacing.base }}
              renderItem={({ item }) => {
                const ep = item.episodeId;
                if (!ep) return null;
                const pct = ep.duration > 0 ? (item.progressSeconds / ep.duration) * 100 : 0;
                return (
                  <TouchableOpacity
                    style={s.continueCard}
                    onPress={() => loadEpisode(ep, item.progressSeconds)}
                    activeOpacity={0.85}
                  >
                    <View style={[s.continueThumb, { backgroundColor: ep.exam?.color + "33" || Colors.primaryMuted }]}>
                      <Text style={s.continueEmoji}>{ep.exam?.icon || "🎙️"}</Text>
                    </View>
                    <Text style={s.continueTitle} numberOfLines={2}>{ep.title}</Text>
                    <Text style={s.continueMeta}>{formatTime(item.progressSeconds)} / {formatDurationShort(ep.duration)}</Text>
                    <View style={s.continueProgress}>
                      <View style={[s.continueProgressFill, { width: `${pct}%` as any }]} />
                    </View>
                    <View style={s.continueBadge}><Text style={s.continueBadgeText}>Resume</Text></View>
                  </TouchableOpacity>
                );
              }}
            />
          </Section>
        )}

        {/* Quick Revision */}
        {quick.length > 0 && (
          <Section title="Quick Revision" subtitle="5–20 min sessions" onSeeAll={() => nav.navigate("Explore", { maxDuration: "1200" })}>
            <FlatList
              horizontal
              data={quick.slice(0, 8)}
              keyExtractor={i => i._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: Spacing.base }}
              renderItem={({ item }) => <EpisodeCard episode={item} />}
            />
          </Section>
        )}

        {/* Featured */}
        {featured.length > 0 && (
          <Section title="Featured Episodes" onSeeAll={() => nav.navigate("Explore")}>
            <FlatList
              horizontal
              data={featured.slice(0, 8)}
              keyExtractor={i => i._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: Spacing.base }}
              renderItem={({ item }) => <EpisodeCard episode={item} />}
            />
          </Section>
        )}

        {/* Browse By Exam */}
        {exams.length > 0 && (
          <Section title="Browse By Exam">
            <View style={s.examGrid}>
              {exams.map(exam => (
                <TouchableOpacity
                  key={exam._id}
                  style={[s.examCard, { borderColor: exam.color + "55" }]}
                  onPress={() => nav.navigate("Explore", { examId: exam._id })}
                >
                  <Text style={s.examCardIcon}>{exam.icon}</Text>
                  <Text style={s.examCardName}>{exam.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>
        )}

        {/* Popular This Week */}
        {popular.length > 0 && (
          <Section title="Popular This Week" onSeeAll={() => nav.navigate("Explore", { sort: "popular" })}>
            <FlatList
              horizontal
              data={popular.slice(0, 8)}
              keyExtractor={i => i._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: Spacing.base }}
              renderItem={({ item }) => <EpisodeCard episode={item} />}
            />
          </Section>
        )}

        {/* New Audio Notes */}
        {recent.length > 0 && (
          <Section title="New Audio Notes" onSeeAll={() => nav.navigate("Explore", { sort: "newest" })}>
            {recent.slice(0, 5).map(ep => <EpisodeCard key={ep._id} episode={ep} horizontal />)}
          </Section>
        )}

        <View style={{ height: Spacing["3xl"] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, subtitle, children, onSeeAll }: { title: string; subtitle?: string; children: React.ReactNode; onSeeAll?: () => void }) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <View>
          <Text style={s.sectionTitle}>{title}</Text>
          {subtitle && <Text style={s.sectionSub}>{subtitle}</Text>}
        </View>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={s.seeAll}>See all</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: Spacing.md },
  loadingText: { color: Colors.textSecondary, fontSize: Typography.size.base },
  header: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  greeting: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  examChip: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.primaryMuted, alignSelf: "flex-start", paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, marginTop: Spacing.xs },
  examChipText: { color: Colors.primary, fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface, margin: Spacing.base, borderRadius: Radius.xl, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: Typography.size.base },
  section: { marginBottom: Spacing.xl },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: Spacing.base, marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  sectionSub: { fontSize: Typography.size.xs, color: Colors.textSecondary, marginTop: 2 },
  seeAll: { color: Colors.primary, fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold },
  continueCard: { width: 180, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginRight: Spacing.md, overflow: "hidden" },
  continueThumb: { width: 48, height: 48, borderRadius: Radius.md, justifyContent: "center", alignItems: "center", marginBottom: Spacing.sm },
  continueEmoji: { fontSize: 24 },
  continueTitle: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary, lineHeight: 18, marginBottom: 4 },
  continueMeta: { fontSize: Typography.size.xs, color: Colors.textSecondary, marginBottom: Spacing.sm },
  continueProgress: { height: 3, backgroundColor: Colors.surfaceElevated, borderRadius: 2, marginBottom: Spacing.sm },
  continueProgressFill: { height: 3, backgroundColor: Colors.primary, borderRadius: 2 },
  continueBadge: { alignSelf: "flex-start", backgroundColor: Colors.primaryMuted, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  continueBadgeText: { color: Colors.primary, fontSize: Typography.size.xs, fontWeight: Typography.weight.bold },
  examGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: Spacing.base, gap: Spacing.md },
  examCard: { width: "46%", backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, alignItems: "center", borderWidth: 1 },
  examCardIcon: { fontSize: 28, marginBottom: Spacing.sm },
  examCardName: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary, textAlign: "center" },
});
