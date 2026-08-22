import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Colors, Typography, Spacing, Radius } from "../../theme";

const { width } = Dimensions.get("window");

export function OnboardingScreen() {
  const nav = useNavigation<any>();
  return (
    <SafeAreaView style={s.container}>
      <View style={s.hero}>
        <Text style={s.emoji}>🎙️</Text>
        <Text style={s.title}>ReviseCast</Text>
        <Text style={s.subtitle}>Revise smarter. Listen anywhere.</Text>
        <Text style={s.description}>
          Short, structured audio revision for GATE, UPSC, SSC, CAT and more competitive exams.
          Learn while you commute, exercise, or travel.
        </Text>
      </View>
      <View style={s.features}>
        {[
          { icon: "⏱️", text: "15–30 min focused revision episodes" },
          { icon: "🎧", text: "Listen offline, anytime, anywhere" },
          { icon: "📊", text: "Track your progress topic by topic" },
        ].map((f, i) => (
          <View key={i} style={s.featureRow}>
            <Text style={s.featureIcon}>{f.icon}</Text>
            <Text style={s.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>
      <View style={s.actions}>
        <TouchableOpacity style={s.btnPrimary} onPress={() => nav.navigate("Register")}>
          <Text style={s.btnPrimaryText}>Get Started — Free</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnSecondary} onPress={() => nav.navigate("Login")}>
          <Text style={s.btnSecondaryText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.base },
  hero: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: Spacing["4xl"] },
  emoji: { fontSize: 56, marginBottom: Spacing.base },
  title: { fontSize: Typography.size["4xl"], fontWeight: Typography.weight.extraBold, color: Colors.primary, marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.size.xl, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary, marginBottom: Spacing.lg, textAlign: "center" },
  description: { fontSize: Typography.size.base, color: Colors.textSecondary, textAlign: "center", lineHeight: 22, paddingHorizontal: Spacing.base },
  features: { paddingVertical: Spacing.xl, gap: Spacing.md },
  featureRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: Radius.md },
  featureIcon: { fontSize: 22 },
  featureText: { fontSize: Typography.size.base, color: Colors.textPrimary, fontWeight: Typography.weight.medium, flex: 1 },
  actions: { paddingBottom: Spacing.xl, gap: Spacing.md },
  btnPrimary: { backgroundColor: Colors.primary, paddingVertical: Spacing.base, borderRadius: Radius.lg, alignItems: "center" },
  btnPrimaryText: { color: Colors.textInverse, fontSize: Typography.size.md, fontWeight: Typography.weight.bold },
  btnSecondary: { paddingVertical: Spacing.md, alignItems: "center" },
  btnSecondaryText: { color: Colors.textSecondary, fontSize: Typography.size.base },
});
