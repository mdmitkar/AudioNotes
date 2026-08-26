import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { episodeApi, examApi, subjectApi } from "../../api";
import { EpisodeCard } from "../../components/episode/EpisodeCard";
import { Colors, Typography, Spacing, Radius } from "../../theme";

const SORTS = [
  { label: "Newest", value: "newest" },
  { label: "Popular", value: "popular" },
  { label: "Shortest", value: "shortest" },
];

const DIFFICULTIES = [
  { label: "All", value: "" },
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

export function ExploreScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const [search, setSearch] = useState(route.params?.q || "");
  const [selectedExamId, setSelectedExamId] = useState(route.params?.examId || "");
  const [sort, setSort] = useState(route.params?.sort || "newest");
  const [difficulty, setDifficulty] = useState("");
  const [premiumFilter, setPremiumFilter] = useState<string>("");
  const [exams, setExams] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    examApi.list().then(r => { if (r.success) setExams(r.data); });
  }, []);

  useEffect(() => {
    setPage(1);
    setEpisodes([]);
    loadEpisodes(1, true);
  }, [search, selectedExamId, sort, difficulty, premiumFilter]);

  const loadEpisodes = async (p: number, reset = false) => {
    setLoading(true);
    const params: Record<string, string> = { sort, page: String(p), limit: "15" };
    if (search) params.q = search;
    if (selectedExamId) params.examId = selectedExamId;
    if (difficulty) params.difficulty = difficulty;
    if (premiumFilter !== "") params.isPremium = premiumFilter;

    const res = await episodeApi.list(params);
    if (res.success) {
      setEpisodes(prev => reset ? res.data : [...prev, ...res.data]);
      setHasMore(p < res.totalPages);
    }
    setLoading(false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const next = page + 1;
      setPage(next);
      loadEpisodes(next);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      {/* Search */}
      <View style={s.searchRow}>
        <View style={s.searchBar}>
          <Text>🔍 </Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search episodes, topics..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search ? <TouchableOpacity onPress={() => setSearch("")}><Text style={s.clearText}>✕</Text></TouchableOpacity> : null}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtersRow} contentContainerStyle={s.filtersContent}>
        {/* Exam filter */}
        <TouchableOpacity style={[s.chip, !selectedExamId && s.chipActive]} onPress={() => setSelectedExamId("")}>
          <Text style={[s.chipText, !selectedExamId && s.chipTextActive]}>All Exams</Text>
        </TouchableOpacity>
        {exams.map(e => (
          <TouchableOpacity key={e._id} style={[s.chip, selectedExamId === e._id && s.chipActive]} onPress={() => setSelectedExamId(e._id)}>
            <Text style={[s.chipText, selectedExamId === e._id && s.chipTextActive]}>{e.icon} {e.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtersRow} contentContainerStyle={s.filtersContent}>
        {SORTS.map(s2 => (
          <TouchableOpacity key={s2.value} style={[s.chip, sort === s2.value && s.chipActive]} onPress={() => setSort(s2.value)}>
            <Text style={[s.chipText, sort === s2.value && s.chipTextActive]}>{s2.label}</Text>
          </TouchableOpacity>
        ))}
        {DIFFICULTIES.map(d => (
          <TouchableOpacity key={d.value} style={[s.chip, difficulty === d.value && s.chipActive]} onPress={() => setDifficulty(d.value)}>
            <Text style={[s.chipText, difficulty === d.value && s.chipTextActive]}>{d.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[s.chip, premiumFilter === "false" && s.chipActive]} onPress={() => setPremiumFilter(premiumFilter === "false" ? "" : "false")}>
          <Text style={[s.chipText, premiumFilter === "false" && s.chipTextActive]}>Free Only</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.chip, premiumFilter === "true" && s.chipActivePremium]} onPress={() => setPremiumFilter(premiumFilter === "true" ? "" : "true")}>
          <Text style={[s.chipText, premiumFilter === "true" && { color: Colors.premium }]}>Premium</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Results */}
      <FlatList
        data={episodes}
        keyExtractor={i => i._id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => <EpisodeCard episode={item} horizontal />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <Text style={s.resultCount}>
            {episodes.length > 0 ? episodes.length + " episodes" : ""}
          </Text>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🔍</Text>
              <Text style={s.emptyTitle}>No episodes found</Text>
              <Text style={s.emptySub}>Try different filters or search terms</Text>
            </View>
          ) : null
        }
        ListFooterComponent={loading ? <ActivityIndicator color={Colors.primary} style={{ margin: 20 }} /> : null}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchRow: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing.xs },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface, borderRadius: Radius.xl, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: Typography.size.base },
  clearText: { color: Colors.textMuted, fontSize: Typography.size.base, paddingLeft: Spacing.sm },
  filtersRow: { marginVertical: Spacing.xs },
  filtersContent: { paddingHorizontal: Spacing.base, gap: Spacing.sm, paddingVertical: Spacing.xs, alignItems: "center" },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  chipActivePremium: { backgroundColor: Colors.premiumMuted, borderColor: Colors.premium },
  chipText: { fontSize: Typography.size.xs, color: Colors.textSecondary, fontWeight: Typography.weight.medium },
  chipTextActive: { color: Colors.primary, fontWeight: Typography.weight.bold },
  list: { padding: Spacing.base },
  resultCount: { color: Colors.textMuted, fontSize: Typography.size.xs, marginBottom: Spacing.sm },
  empty: { alignItems: "center", paddingTop: Spacing["4xl"] },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptySub: { fontSize: Typography.size.base, color: Colors.textSecondary },
});
