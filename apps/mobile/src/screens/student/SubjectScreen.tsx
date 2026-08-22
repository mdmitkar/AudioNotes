import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { subjectApi } from "../../api";
import { Colors, Typography, Spacing, Radius } from "../../theme";

export function SubjectScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { subjectId, subject: passedSubject } = route.params || {};
  const [subject, setSubject] = useState<any>(passedSubject);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = subjectId || passedSubject?._id;
    if (!id) return;
    Promise.all([
      passedSubject ? Promise.resolve({ success: true, data: passedSubject }) : subjectApi.get(id),
      subjectApi.topics(id),
    ]).then(([sRes, tRes]) => {
      if (sRes.success) setSubject(sRes.data);
      if (tRes.success) setTopics(tRes.data);
      setLoading(false);
    });
  }, []);

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <TouchableOpacity onPress={() => nav.goBack()} style={s.back}><Text style={s.backText}>← Back</Text></TouchableOpacity>
      {subject && (
        <View style={s.header}>
          <Text style={s.icon}>{subject.icon || "📖"}</Text>
          <Text style={s.title}>{subject.name}</Text>
          <Text style={s.desc}>{subject.description}</Text>
        </View>
      )}
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          <Text style={s.sectionLabel}>Topics</Text>
          {topics.map(topic => (
            <TouchableOpacity
              key={topic._id}
              style={s.topicCard}
              onPress={() => nav.navigate("TopicScreen", { topicId: topic._id, topic })}
            >
              <View style={s.topicInfo}>
                <Text style={s.topicName}>{topic.name}</Text>
                {topic.description ? <Text style={s.topicDesc}>{topic.description}</Text> : null}
              </View>
              <Text style={s.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  back: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
  backText: { color: Colors.textSecondary, fontSize: Typography.size.base },
  header: { padding: Spacing.base, alignItems: "center", paddingBottom: Spacing.xl },
  icon: { fontSize: 40, marginBottom: Spacing.sm },
  title: { fontSize: Typography.size["2xl"], fontWeight: Typography.weight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  desc: { fontSize: Typography.size.base, color: Colors.textSecondary, textAlign: "center" },
  list: { padding: Spacing.base },
  sectionLabel: { fontSize: Typography.size.sm, color: Colors.textMuted, marginBottom: Spacing.md, textTransform: "uppercase", letterSpacing: 1 },
  topicCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, marginBottom: Spacing.md, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  topicInfo: { flex: 1 },
  topicName: { fontSize: Typography.size.base, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  topicDesc: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginTop: 4 },
  chevron: { fontSize: 20, color: Colors.textMuted },
});
