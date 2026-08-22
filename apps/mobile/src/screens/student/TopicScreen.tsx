import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { topicApi } from "../../api";
import { EpisodeCard } from "../../components/episode/EpisodeCard";
import { Colors, Typography, Spacing, Radius } from "../../theme";

export function TopicScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { topicId, topic: passedTopic } = route.params || {};
  const [topic, setTopic] = useState<any>(passedTopic);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = topicId || passedTopic?._id;
    if (!id) return;
    topicApi.episodes(id).then(r => {
      if (r.success) setEpisodes(r.data);
      setLoading(false);
    });
  }, []);

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <TouchableOpacity onPress={() => nav.goBack()} style={s.back}><Text style={s.backText}>← Back</Text></TouchableOpacity>
      {topic && (
        <View style={s.header}>
          <Text style={s.title}>{topic.name}</Text>
        </View>
      )}
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={episodes}
          keyExtractor={i => i._id}
          contentContainerStyle={s.list}
          renderItem={({ item }) => <EpisodeCard episode={item} horizontal />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🎙️</Text>
              <Text style={s.emptyTitle}>No episodes yet</Text>
              <Text style={s.emptySub}>Check back soon — more audio notes are coming!</Text>
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
  back: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
  backText: { color: Colors.textSecondary, fontSize: Typography.size.base },
  header: { padding: Spacing.base },
  title: { fontSize: Typography.size["2xl"], fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  list: { padding: Spacing.base },
  empty: { alignItems: "center", paddingTop: Spacing["4xl"] },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptySub: { fontSize: Typography.size.base, color: Colors.textSecondary, textAlign: "center" },
});
