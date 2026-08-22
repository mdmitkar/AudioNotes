import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { episodeApi, bookmarkApi, progressApi } from "../../api";
import { usePlayerStore } from "../../stores/playerStore";
import { useAuthStore } from "../../stores/authStore";
import { Colors, Typography, Spacing, Radius, Shadows } from "../../theme";
import { formatDuration, formatTime, getProgressPercent } from "../../utils";

export function EpisodeDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { episodeId, episode: passedEpisode } = route.params || {};
  const { loadEpisode, episode: currentEpisode } = usePlayerStore();
  const { user } = useAuthStore();
  const [episode, setEpisode] = useState<any>(passedEpisode || null);
  const [loading, setLoading] = useState(!passedEpisode);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [playLoading, setPlayLoading] = useState(false);

  useEffect(() => {
    const id = episodeId || passedEpisode?._id;
    if (!id) return;
    episodeApi.get(id).then(r => { if (r.success) setEpisode(r.data); setLoading(false); });
    if (user) {
      bookmarkApi.check(id).then(r => { if (r.success) setIsBookmarked(r.data.isBookmarked); });
      progressApi.get(id).then(r => { if (r.success && r.data) setProgress(r.data); });
    }
  }, [episodeId]);

  const handlePlay = async () => {
    if (!episode) return;
    if (episode.isPremium && !episode.audioUrl) {
      Alert.alert("Premium Content", "Subscribe to ReviseCast Premium to access this episode.", [
        { text: "Maybe Later", style: "cancel" },
        { text: "Learn More", onPress: () => {} },
      ]);
      return;
    }
    setPlayLoading(true);
    const startPos = progress?.progressSeconds && !progress.completed ? progress.progressSeconds : 0;
    await loadEpisode(episode, startPos);
    setPlayLoading(false);
    nav.navigate("FullPlayer");
  };

  const toggleBookmark = async () => {
    if (!episode) return;
    if (isBookmarked) {
      await bookmarkApi.remove(episode._id);
      setIsBookmarked(false);
    } else {
      await bookmarkApi.add(episode._id);
      setIsBookmarked(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  if (!episode) {
    return (
      <SafeAreaView style={s.container}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.back}><Text style={s.backText}>← Back</Text></TouchableOpacity>
        <Text style={s.errorText}>Episode not found</Text>
      </SafeAreaView>
    );
  }

  const progressPct = progress ? getProgressPercent(progress.progressSeconds, episode.duration) : 0;
  const isCurrentlyPlaying = currentEpisode?._id === episode._id;

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[s.hero, { backgroundColor: episode.exam?.color + "22" || Colors.primaryMuted }]}>
          <TouchableOpacity onPress={() => nav.goBack()} style={s.back}><Text style={s.backText}>← Back</Text></TouchableOpacity>
          <View style={s.heroThumb}>
            <Text style={s.heroEmoji}>{episode.exam?.icon || "🎙️"}</Text>
          </View>
        </View>

        <View style={s.content}>
          {/* Meta */}
          <View style={s.metaRow}>
            <View style={[s.examBadge, { backgroundColor: episode.exam?.color + "33" }]}>
              <Text style={[s.examBadgeText, { color: episode.exam?.color || Colors.primary }]}>{episode.exam?.name}</Text>
            </View>
            {episode.isPremium && (
              <View style={s.premiumBadge}><Text style={s.premiumText}>PREMIUM</Text></View>
            )}
            <View style={s.durationBadge}>
              <Text style={s.durationText}>{formatDuration(episode.duration)}</Text>
            </View>
          </View>

          <Text style={s.title}>{episode.title}</Text>
          <Text style={s.creator}>by {episode.creator?.name || "ReviseCast"}</Text>
          <Text style={s.subject}>{episode.subject?.name} • {episode.topic?.name}</Text>

          {/* Progress bar */}
          {progressPct > 0 && !progress?.completed && (
            <View style={s.progressSection}>
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: `${progressPct}%` as any }]} />
              </View>
              <Text style={s.progressText}>{formatTime(progress.progressSeconds)} listened • Resume</Text>
            </View>
          )}
          {progress?.completed && (
            <View style={s.completedBadge}>
              <Text style={s.completedText}>✓ Completed</Text>
            </View>
          )}

          {/* Play / Bookmark */}
          <View style={s.actionRow}>
            <TouchableOpacity
              style={[s.playBtn, (playLoading || isCurrentlyPlaying) && s.playBtnActive]}
              onPress={handlePlay}
              disabled={playLoading}
            >
              {playLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.playBtnText}>{isCurrentlyPlaying ? "▶ Now Playing" : progress?.progressSeconds && !progress.completed ? "▶ Resume" : "▶ Play Episode"}</Text>
              )}
            </TouchableOpacity>
            {user && (
              <TouchableOpacity style={[s.bookmarkBtn, isBookmarked && s.bookmarkBtnActive]} onPress={toggleBookmark}>
                <Text style={s.bookmarkIcon}>{isBookmarked ? "🔖" : "🏷️"}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Description */}
          <Text style={s.sectionTitle}>About this episode</Text>
          <Text style={s.description}>{episode.description}</Text>

          {/* What you'll learn */}
          {episode.whatYoullLearn?.length > 0 && (
            <View style={s.learnSection}>
              <Text style={s.sectionTitle}>What you'll learn</Text>
              {episode.whatYoullLearn.map((item: string, i: number) => (
                <View key={i} style={s.learnItem}>
                  <Text style={s.learnBullet}>✓</Text>
                  <Text style={s.learnText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Premium lock */}
          {episode.isPremium && !episode.audioUrl && (
            <View style={s.lockBox}>
              <Text style={s.lockEmoji}>🔒</Text>
              <Text style={s.lockTitle}>Premium Episode</Text>
              <Text style={s.lockDesc}>Subscribe to ReviseCast Premium to unlock all premium audio notes.</Text>
              <TouchableOpacity style={s.lockBtn}>
                <Text style={s.lockBtnText}>View Premium Plans</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { height: 160, justifyContent: "flex-end", paddingBottom: Spacing.xl, alignItems: "center" },
  back: { position: "absolute", top: Spacing.md, left: Spacing.base },
  backText: { color: Colors.textSecondary, fontSize: Typography.size.base },
  heroThumb: { width: 80, height: 80, borderRadius: Radius.xl, backgroundColor: Colors.surface, justifyContent: "center", alignItems: "center" },
  heroEmoji: { fontSize: 40 },
  content: { padding: Spacing.base },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.md },
  examBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  examBadgeText: { fontSize: Typography.size.xs, fontWeight: Typography.weight.bold },
  premiumBadge: { backgroundColor: Colors.premiumMuted, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  premiumText: { color: Colors.premium, fontSize: Typography.size.xs, fontWeight: Typography.weight.bold },
  durationBadge: { backgroundColor: Colors.primaryMuted, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  durationText: { color: Colors.primary, fontSize: Typography.size.xs, fontWeight: Typography.weight.bold },
  title: { fontSize: Typography.size["2xl"], fontWeight: Typography.weight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm, lineHeight: 32 },
  creator: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginBottom: 4 },
  subject: { fontSize: Typography.size.sm, color: Colors.textMuted, marginBottom: Spacing.md },
  progressSection: { marginBottom: Spacing.md },
  progressBar: { height: 4, backgroundColor: Colors.surfaceElevated, borderRadius: 2, marginBottom: 6 },
  progressFill: { height: 4, backgroundColor: Colors.primary, borderRadius: 2 },
  progressText: { fontSize: Typography.size.xs, color: Colors.textSecondary },
  completedBadge: { backgroundColor: Colors.primaryMuted, alignSelf: "flex-start", paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, marginBottom: Spacing.md },
  completedText: { color: Colors.primary, fontSize: Typography.size.sm, fontWeight: Typography.weight.bold },
  actionRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.xl },
  playBtn: { flex: 1, backgroundColor: Colors.primary, padding: Spacing.md, borderRadius: Radius.lg, alignItems: "center" },
  playBtnActive: { backgroundColor: Colors.primaryDark },
  playBtnText: { color: Colors.textInverse, fontSize: Typography.size.md, fontWeight: Typography.weight.bold },
  bookmarkBtn: { width: 52, backgroundColor: Colors.surface, borderRadius: Radius.lg, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  bookmarkBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  bookmarkIcon: { fontSize: 20 },
  sectionTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.textPrimary, marginBottom: Spacing.md, marginTop: Spacing.lg },
  description: { fontSize: Typography.size.base, color: Colors.textSecondary, lineHeight: 24 },
  learnSection: { marginTop: Spacing.sm },
  learnItem: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.sm, alignItems: "flex-start" },
  learnBullet: { color: Colors.primary, fontSize: Typography.size.base, fontWeight: Typography.weight.bold, marginTop: 2 },
  learnText: { flex: 1, color: Colors.textPrimary, fontSize: Typography.size.base, lineHeight: 22 },
  lockBox: { marginTop: Spacing.xl, backgroundColor: Colors.premiumMuted, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: "center", borderWidth: 1, borderColor: Colors.premium + "44" },
  lockEmoji: { fontSize: 40, marginBottom: Spacing.md },
  lockTitle: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.premium, marginBottom: Spacing.sm },
  lockDesc: { fontSize: Typography.size.base, color: Colors.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: Spacing.lg },
  lockBtn: { backgroundColor: Colors.premium, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.lg },
  lockBtnText: { color: Colors.textInverse, fontSize: Typography.size.base, fontWeight: Typography.weight.bold },
  errorText: { color: Colors.textSecondary, textAlign: "center", marginTop: 100 },
});
