import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Colors, Typography, Spacing, Radius, Shadows } from "../../theme";
import { formatDurationShort } from "../../utils";

interface Props {
  episode: any;
  horizontal?: boolean;
  onPlay?: () => void;
}

export function EpisodeCard({ episode, horizontal = false, onPlay }: Props) {
  const nav = useNavigation<any>();

  const handlePress = () => nav.navigate("EpisodeDetail", { episodeId: episode._id, episode });

  return (
    <TouchableOpacity
      style={[s.card, horizontal && s.cardH]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {/* Thumbnail */}
      <View style={[s.thumb, horizontal && s.thumbH]}>
        {episode.thumbnailUrl ? (
          <Image source={{ uri: episode.thumbnailUrl }} style={s.thumbImg} />
        ) : (
          <View style={[s.thumbPlaceholder, { backgroundColor: episode.exam?.color || Colors.primary + "33" }]}>
            <Text style={s.thumbEmoji}>{episode.exam?.icon || "🎙️"}</Text>
          </View>
        )}
        {episode.isPremium && (
          <View style={s.premiumBadge}>
            <Text style={s.premiumText}>PRO</Text>
          </View>
        )}
      </View>

      <View style={[s.info, horizontal && s.infoH]}>
        {/* Duration pill - highly visible */}
        <View style={s.durationPill}>
          <Text style={s.durationText}>{formatDurationShort(episode.duration)}</Text>
        </View>

        <Text style={[s.title, horizontal && s.titleH]} numberOfLines={2}>{episode.title}</Text>
        <Text style={s.creator} numberOfLines={1}>{episode.creator?.name || "ReviseCast"}</Text>
        <View style={s.meta}>
          <Text style={s.metaText} numberOfLines={1}>
            {episode.exam?.name} • {episode.subject?.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: "hidden",
    width: 200,
    marginRight: Spacing.md,
    ...Shadows.sm,
  },
  cardH: { width: "100%", flexDirection: "row", marginRight: 0, marginBottom: Spacing.md },
  thumb: { height: 120, backgroundColor: Colors.surfaceElevated },
  thumbH: { width: 90, height: 90 },
  thumbImg: { width: "100%", height: "100%", resizeMode: "cover" },
  thumbPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  thumbEmoji: { fontSize: 36 },
  premiumBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.premium,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  premiumText: { color: Colors.textInverse, fontSize: 9, fontWeight: Typography.weight.bold, letterSpacing: 0.5 },
  info: { padding: Spacing.md, flex: 1 },
  infoH: { paddingLeft: Spacing.md },
  durationPill: {
    backgroundColor: Colors.primaryMuted,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginBottom: Spacing.xs,
  },
  durationText: { color: Colors.primary, fontSize: Typography.size.xs, fontWeight: Typography.weight.bold },
  title: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary, marginBottom: 4, lineHeight: 18 },
  titleH: { fontSize: Typography.size.base },
  creator: { fontSize: Typography.size.xs, color: Colors.textMuted, marginBottom: 4 },
  meta: { flexDirection: "row", flexWrap: "wrap" },
  metaText: { fontSize: Typography.size.xs, color: Colors.textSecondary },
});
