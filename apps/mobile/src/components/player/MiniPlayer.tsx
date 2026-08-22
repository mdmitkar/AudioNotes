import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { usePlayerStore } from "../../stores/playerStore";
import { Colors, Typography, Spacing, Radius, Layout, Shadows } from "../../theme";
import { formatTime } from "../../utils";

export function MiniPlayer() {
  const nav = useNavigation<any>();
  const { episode, isPlaying, position, duration, togglePlay, setShowFullPlayer } = usePlayerStore();
  const insets = useSafeAreaInsets();

  if (!episode) return null;

  const progress = duration > 0 ? position / duration : 0;

  return (
    <TouchableOpacity
      style={[s.container, { bottom: Layout.tabBarHeight + insets.bottom }]}
      onPress={() => { setShowFullPlayer(true); nav.navigate("FullPlayer"); }}
      activeOpacity={0.95}
    >
      {/* Progress bar at top of mini player */}
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>

      <View style={s.content}>
        {/* Episode icon */}
        <View style={[s.icon, { backgroundColor: (episode.exam as any)?.color + "33" || Colors.primaryMuted }]}>
          <Text style={s.iconEmoji}>🎙️</Text>
        </View>

        {/* Info */}
        <View style={s.info}>
          <Text style={s.title} numberOfLines={1}>{episode.title}</Text>
          <Text style={s.sub} numberOfLines={1}>
            {episode.exam?.name} • {formatTime(position)} / {formatTime(episode.duration)}
          </Text>
        </View>

        {/* Controls */}
        <TouchableOpacity
          style={s.playBtn}
          onPress={(e) => { e.stopPropagation(); togglePlay(); }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={s.playIcon}>{isPlaying ? "⏸" : "▶"}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: {
    position: "absolute",
    left: 8,
    right: 8,
    height: Layout.miniPlayerHeight,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: "hidden",
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressBar: { height: 2, backgroundColor: Colors.surfaceElevated },
  progressFill: { height: 2, backgroundColor: Colors.primary },
  content: { flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md, gap: Spacing.md },
  icon: { width: 44, height: 44, borderRadius: Radius.md, justifyContent: "center", alignItems: "center" },
  iconEmoji: { fontSize: 20 },
  info: { flex: 1 },
  title: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  sub: { fontSize: Typography.size.xs, color: Colors.textSecondary, marginTop: 2 },
  playBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center", backgroundColor: Colors.primary, borderRadius: Radius.full },
  playIcon: { fontSize: 16, color: Colors.textInverse },
});
