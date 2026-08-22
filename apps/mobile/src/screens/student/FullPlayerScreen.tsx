import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { usePlayerStore } from "../../stores/playerStore";
import { Colors, Typography, Spacing, Radius } from "../../theme";
import { formatTime, getProgressPercent } from "../../utils";

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

export function FullPlayerScreen() {
  const nav = useNavigation<any>();
  const {
    episode, isPlaying, isLoading, position, duration, speed,
    togglePlay, seekTo, seekForward, seekBackward, setSpeed, unload,
  } = usePlayerStore();
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);

  if (!episode) {
    nav.goBack();
    return null;
  }

  const progress = duration > 0 ? position / duration : 0;
  const displayPosition = isSeeking ? seekValue : position;

  const handleSleepTimer = (minutes: number) => {
    if (sleepTimer) clearTimeout(sleepTimer);
    const timer = setTimeout(async () => {
      await unload();
      nav.goBack();
    }, minutes * 60 * 1000);
    setSleepTimer(timer);
    setSleepMinutes(minutes);
    Alert.alert("Sleep Timer", "Audio will stop in " + minutes + " minutes.");
  };

  const cancelSleepTimer = () => {
    if (sleepTimer) clearTimeout(sleepTimer);
    setSleepTimer(null);
    setSleepMinutes(null);
  };

  const hasExamColor = !!((episode.exam as any)?.color);
  const artworkBg = hasExamColor ? (episode.exam as any).color + "33" : Colors.primaryMuted;

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.downBtn}>
          <Text style={s.downIcon}>⌄</Text>
        </TouchableOpacity>
        <Text style={s.headerLabel}>Now Playing</Text>
        <TouchableOpacity
          style={[s.sleepBtn, (sleepMinutes ? s.sleepBtnActive : null) as any]}
          onPress={() => {
            if (sleepMinutes) {
              cancelSleepTimer();
            } else {
              Alert.alert("Sleep Timer", "Stop audio after:", [
                { text: "15 min", onPress: () => handleSleepTimer(15) },
                { text: "30 min", onPress: () => handleSleepTimer(30) },
                { text: "45 min", onPress: () => handleSleepTimer(45) },
                { text: "Cancel", style: "cancel" },
              ]);
            }
          }}
        >
          <Text style={s.sleepIcon}>🌙</Text>
          {sleepMinutes && <Text style={s.sleepLabel}>{sleepMinutes}m</Text>}
        </TouchableOpacity>
      </View>

      {/* Artwork */}
      <View style={s.artworkContainer}>
        <View style={[s.artwork, { backgroundColor: artworkBg }]}>
          <Text style={s.artworkEmoji}>{(episode.exam as any)?.icon || "🎙️"}</Text>
        </View>
        {isLoading && (
          <View style={s.loadingOverlay}>
            <Text style={s.loadingText}>Loading...</Text>
          </View>
        )}
      </View>

      {/* Episode info */}
      <View style={s.info}>
        <View style={s.infoMeta}>
          <View style={[s.examBadge, { backgroundColor: artworkBg }]}>
            <Text style={[s.examBadgeText, { color: (episode.exam as any)?.color || Colors.primary }]}>
              {(episode.exam as any)?.name || "GATE CS"}
            </Text>
          </View>
          {episode.isPremium && (
            <View style={s.premiumBadge}><Text style={s.premiumText}>PRO</Text></View>
          )}
        </View>
        <Text style={s.title} numberOfLines={2}>{episode.title}</Text>
        <Text style={s.creator}>{episode.creator?.name || "ReviseCast"}</Text>
        <Text style={s.subject}>{episode.subject?.name} • {episode.topic?.name}</Text>
      </View>

      {/* Seek bar */}
      <View style={s.seekSection}>
        <View style={s.seekBarWrapper}>
          <View style={s.seekBarBg}>
            <View style={[s.seekBarFill, { width: `${(isSeeking ? seekValue / duration : progress) * 100}%` as any }]} />
          </View>
          {/* Touch-based seeking — simple tap */}
          <TouchableOpacity
            style={s.seekTouchArea}
            onPress={(e) => {
              const { locationX, target } = e.nativeEvent;
              seekTo(Math.round((locationX / 300) * duration));
            }}
          />
        </View>
        <View style={s.timeRow}>
          <Text style={s.timeText}>{formatTime(displayPosition)}</Text>
          <Text style={s.timeText}>{formatTime(duration || episode.duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={s.controls}>
        <TouchableOpacity style={s.controlBtn} onPress={() => seekBackward(15)}>
          <Text style={s.controlIcon}>⏪</Text>
          <Text style={s.controlLabel}>15s</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.playBtn} onPress={togglePlay} disabled={isLoading}>
          <Text style={s.playIcon}>{isPlaying ? "⏸" : "▶"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.controlBtn} onPress={() => seekForward(30)}>
          <Text style={s.controlIcon}>⏩</Text>
          <Text style={s.controlLabel}>30s</Text>
        </TouchableOpacity>
      </View>

      {/* Speed selector */}
      <View style={s.speedSection}>
        <Text style={s.speedLabel}>Speed</Text>
        <View style={s.speedRow}>
          {SPEEDS.map(sp => (
            <TouchableOpacity
              key={sp}
              style={[s.speedBtn, speed === sp && s.speedBtnActive]}
              onPress={() => setSpeed(sp)}
            >
              <Text style={[s.speedBtnText, speed === sp && s.speedBtnTextActive]}>{sp}x</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  downBtn: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  downIcon: { fontSize: 28, color: Colors.textSecondary, lineHeight: 32 },
  headerLabel: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, color: Colors.textSecondary, letterSpacing: 1, textTransform: "uppercase" },
  sleepBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.full, backgroundColor: Colors.surface },
  sleepBtnActive: { backgroundColor: Colors.primaryMuted },
  sleepIcon: { fontSize: 16 },
  sleepLabel: { fontSize: Typography.size.xs, color: Colors.primary, fontWeight: Typography.weight.bold },
  artworkContainer: { alignItems: "center", paddingVertical: Spacing["2xl"], position: "relative" },
  artwork: { width: 200, height: 200, borderRadius: Radius["2xl"], justifyContent: "center", alignItems: "center" },
  artworkEmoji: { fontSize: 80 },
  loadingOverlay: { ...StyleSheet.absoluteFill, justifyContent: "center", alignItems: "center", backgroundColor: Colors.overlay, borderRadius: Radius["2xl"] },
  loadingText: { color: Colors.textPrimary, fontSize: Typography.size.base },
  info: { paddingHorizontal: Spacing.xl, alignItems: "center" },
  infoMeta: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.sm },
  examBadge: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full },
  examBadgeText: { fontSize: Typography.size.xs, fontWeight: Typography.weight.bold },
  premiumBadge: { backgroundColor: Colors.premiumMuted, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full },
  premiumText: { color: Colors.premium, fontSize: Typography.size.xs, fontWeight: Typography.weight.bold },
  title: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.textPrimary, textAlign: "center", lineHeight: 28, marginBottom: Spacing.sm },
  creator: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginBottom: 4 },
  subject: { fontSize: Typography.size.xs, color: Colors.textMuted },
  seekSection: { paddingHorizontal: Spacing.xl, marginTop: Spacing.xl },
  seekBarWrapper: { position: "relative", marginBottom: Spacing.sm },
  seekBarBg: { height: 4, backgroundColor: Colors.surfaceElevated, borderRadius: 2 },
  seekBarFill: { height: 4, backgroundColor: Colors.primary, borderRadius: 2 },
  seekTouchArea: { position: "absolute", top: -12, left: 0, right: 0, bottom: -12 },
  timeRow: { flexDirection: "row", justifyContent: "space-between" },
  timeText: { fontSize: Typography.size.xs, color: Colors.textMuted },
  controls: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: Spacing["2xl"], marginTop: Spacing.xl },
  controlBtn: { alignItems: "center" },
  controlIcon: { fontSize: 24 },
  controlLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 2 },
  playBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" },
  playIcon: { fontSize: 28, color: Colors.textInverse },
  speedSection: { paddingHorizontal: Spacing.xl, marginTop: Spacing.xl },
  speedLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, textAlign: "center", marginBottom: Spacing.sm, textTransform: "uppercase", letterSpacing: 1 },
  speedRow: { flexDirection: "row", justifyContent: "center", gap: Spacing.sm },
  speedBtn: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  speedBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  speedBtnText: { fontSize: Typography.size.sm, color: Colors.textSecondary, fontWeight: Typography.weight.medium },
  speedBtnTextActive: { color: Colors.textInverse, fontWeight: Typography.weight.bold },
});
