import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { creatorApi, examApi, subjectApi, topicApi } from "../../api";
import { Colors, Typography, Spacing, Radius } from "../../theme";

const STEPS = ["Audio", "Title", "Description", "Exam", "Subject", "Topic", "Thumbnail", "Free/Premium", "Review", "Submit"];

export function UploadEpisodeScreen() {
  const nav = useNavigation<any>();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "", description: "", examId: "", subjectId: "", topicId: "",
    duration: "", isPremium: false, difficulty: "intermediate", whatYoullLearn: "",
  });
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    examApi.list().then(r => { if (r.success) setExams(r.data); });
  }, []);

  useEffect(() => {
    if (form.examId) {
      examApi.subjects(form.examId).then(r => { if (r.success) setSubjects(r.data); setForm(f => ({ ...f, subjectId: "", topicId: "" })); });
    }
  }, [form.examId]);

  useEffect(() => {
    if (form.subjectId) subjectApi.topics(form.subjectId).then(r => { if (r.success) setTopics(r.data); setForm(f => ({ ...f, topicId: "" })); });
  }, [form.subjectId]);

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("examId", form.examId);
    fd.append("subjectId", form.subjectId);
    fd.append("topicId", form.topicId);
    fd.append("duration", String(parseInt(form.duration) * 60 || 0));
    fd.append("isPremium", String(form.isPremium));
    fd.append("difficulty", form.difficulty);
    if (form.whatYoullLearn) form.whatYoullLearn.split("\n").forEach(l => fd.append("whatYoullLearn", l.trim()));

    const res = await creatorApi.uploadEpisode(fd);
    setLoading(false);
    if (res.success) {
      Alert.alert("Submitted!", "Your episode has been submitted for review. It will appear once approved.", [
        { text: "OK", onPress: () => nav.goBack() },
      ]);
    } else {
      Alert.alert("Error", res.error || "Upload failed. Please try again.");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <View style={s.stepContent}>
          <Text style={s.stepTitle}>Audio File</Text>
          <Text style={s.stepDesc}>Upload your audio revision notes. Max file size: 100MB.</Text>
          <View style={s.uploadBox}>
            <Text style={s.uploadIcon}>🎵</Text>
            <Text style={s.uploadText}>Tap to select audio file</Text>
            <Text style={s.uploadSub}>MP3, WAV, AAC supported</Text>
          </View>
          <View style={s.durationRow}>
            <Text style={s.label}>Duration (minutes)</Text>
            <TextInput style={s.input} value={form.duration} onChangeText={v => update("duration", v)} keyboardType="numeric" placeholder="e.g. 15" placeholderTextColor={Colors.textMuted} />
          </View>
        </View>
      );
      case 1: return (
        <View style={s.stepContent}>
          <Text style={s.stepTitle}>Episode Title</Text>
          <Text style={s.stepDesc}>Give your episode a clear, descriptive title.</Text>
          <TextInput style={[s.input, s.inputLarge]} value={form.title} onChangeText={v => update("title", v)} placeholder="e.g. Deadlock — Complete Revision" placeholderTextColor={Colors.textMuted} multiline />
          <Text style={s.hint}>Good titles include the topic + type (e.g. Revision, Quick Notes, PYQ Focus)</Text>
        </View>
      );
      case 2: return (
        <View style={s.stepContent}>
          <Text style={s.stepTitle}>Description</Text>
          <TextInput style={[s.input, s.inputLarge]} value={form.description} onChangeText={v => update("description", v)} placeholder="Describe what this episode covers..." placeholderTextColor={Colors.textMuted} multiline numberOfLines={5} />
          <Text style={s.label}>What will listeners learn? (one item per line)</Text>
          <TextInput style={[s.input, s.inputLarge]} value={form.whatYoullLearn} onChangeText={v => update("whatYoullLearn", v)} placeholder={"Coffman conditions\nDeadlock prevention\nBanker's Algorithm"} placeholderTextColor={Colors.textMuted} multiline />
        </View>
      );
      case 3: return (
        <View style={s.stepContent}>
          <Text style={s.stepTitle}>Select Exam</Text>
          {exams.map(e => (
            <TouchableOpacity key={e._id} style={[s.selectCard, form.examId === e._id && s.selectCardActive]} onPress={() => update("examId", e._id)}>
              <Text style={s.selectIcon}>{e.icon}</Text>
              <Text style={[s.selectLabel, form.examId === e._id && s.selectLabelActive]}>{e.name}</Text>
              {form.examId === e._id && <Text style={s.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      );
      case 4: return (
        <View style={s.stepContent}>
          <Text style={s.stepTitle}>Select Subject</Text>
          {subjects.length === 0 && <Text style={s.hint}>Select an exam first</Text>}
          {subjects.map(sub => (
            <TouchableOpacity key={sub._id} style={[s.selectCard, form.subjectId === sub._id && s.selectCardActive]} onPress={() => update("subjectId", sub._id)}>
              <Text style={s.selectIcon}>{sub.icon}</Text>
              <Text style={[s.selectLabel, form.subjectId === sub._id && s.selectLabelActive]}>{sub.name}</Text>
              {form.subjectId === sub._id && <Text style={s.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      );
      case 5: return (
        <View style={s.stepContent}>
          <Text style={s.stepTitle}>Select Topic</Text>
          {topics.length === 0 && <Text style={s.hint}>Select a subject first</Text>}
          {topics.map(t => (
            <TouchableOpacity key={t._id} style={[s.selectCard, form.topicId === t._id && s.selectCardActive]} onPress={() => update("topicId", t._id)}>
              <Text style={[s.selectLabel, form.topicId === t._id && s.selectLabelActive]}>{t.name}</Text>
              {form.topicId === t._id && <Text style={s.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      );
      case 6: return (
        <View style={s.stepContent}>
          <Text style={s.stepTitle}>Thumbnail</Text>
          <View style={s.uploadBox}>
            <Text style={s.uploadIcon}>🖼️</Text>
            <Text style={s.uploadText}>Tap to select thumbnail image</Text>
            <Text style={s.uploadSub}>JPG, PNG, WebP (optional)</Text>
          </View>
        </View>
      );
      case 7: return (
        <View style={s.stepContent}>
          <Text style={s.stepTitle}>Access Type</Text>
          <View style={s.premiumRow}>
            <View>
              <Text style={s.premiumLabel}>Mark as Premium</Text>
              <Text style={s.premiumSub}>Premium episodes require a subscription</Text>
            </View>
            <Switch value={form.isPremium} onValueChange={v => update("isPremium", v)} trackColor={{ false: Colors.border, true: Colors.premium }} />
          </View>
          <Text style={s.label}>Difficulty Level</Text>
          <View style={s.diffRow}>
            {["beginner", "intermediate", "advanced"].map(d => (
              <TouchableOpacity key={d} style={[s.diffBtn, form.difficulty === d && s.diffBtnActive]} onPress={() => update("difficulty", d)}>
                <Text style={[s.diffText, form.difficulty === d && s.diffTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
      case 8: return (
        <View style={s.stepContent}>
          <Text style={s.stepTitle}>Review</Text>
          {[
            ["Title", form.title],
            ["Duration", form.duration + " min"],
            ["Exam", exams.find(e => e._id === form.examId)?.name || "-"],
            ["Subject", subjects.find(s => s._id === form.subjectId)?.name || "-"],
            ["Topic", topics.find(t => t._id === form.topicId)?.name || "-"],
            ["Access", form.isPremium ? "Premium" : "Free"],
            ["Difficulty", form.difficulty],
          ].map(([k, v]) => (
            <View key={k} style={s.reviewRow}>
              <Text style={s.reviewKey}>{k}</Text>
              <Text style={s.reviewVal}>{v || "-"}</Text>
            </View>
          ))}
        </View>
      );
      case 9: return (
        <View style={s.stepContent}>
          <Text style={s.stepTitle}>Submit for Review</Text>
          <Text style={s.stepDesc}>Your episode will be reviewed by our team. Publishing typically takes 24-48 hours.</Text>
          <View style={s.infoBox}>
            <Text style={s.infoText}>After submission, your episode status will change to "Pending Review". Once approved, it will be published automatically.</Text>
          </View>
          <TouchableOpacity style={[s.submitBtn, loading && s.submitBtnDisabled]} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitBtnText}>Submit Episode</Text>}
          </TouchableOpacity>
        </View>
      );
      default: return null;
    }
  };

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()}><Text style={s.backText}>← Back</Text></TouchableOpacity>
        <Text style={s.headerTitle}>Upload Episode</Text>
        <Text style={s.stepCount}>{step + 1}/{STEPS.length}</Text>
      </View>

      {/* Step indicator */}
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: `${(step + 1) / STEPS.length * 100}%` as any }]} />
      </View>
      <Text style={s.stepName}>{STEPS[step]}</Text>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      <View style={s.navBtns}>
        {step > 0 && (
          <TouchableOpacity style={s.navBtn} onPress={() => setStep(s => s - 1)}>
            <Text style={s.navBtnText}>Previous</Text>
          </TouchableOpacity>
        )}
        {step < STEPS.length - 1 && (
          <TouchableOpacity style={[s.navBtn, s.navBtnPrimary]} onPress={() => setStep(s => s + 1)}>
            <Text style={[s.navBtnText, s.navBtnPrimaryText]}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  backText: { color: Colors.textSecondary, fontSize: Typography.size.base, marginRight: Spacing.sm },
  headerTitle: { flex: 1, fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  stepCount: { color: Colors.textMuted, fontSize: Typography.size.sm },
  progressBar: { height: 3, backgroundColor: Colors.surfaceElevated, marginHorizontal: Spacing.base, borderRadius: 2 },
  progressFill: { height: 3, backgroundColor: Colors.primary, borderRadius: 2 },
  stepName: { fontSize: Typography.size.xs, color: Colors.textMuted, paddingHorizontal: Spacing.base, marginTop: Spacing.xs, textTransform: "uppercase", letterSpacing: 1 },
  scroll: { flex: 1 },
  stepContent: { padding: Spacing.base, gap: Spacing.md },
  stepTitle: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  stepDesc: { fontSize: Typography.size.base, color: Colors.textSecondary },
  uploadBox: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing["2xl"], alignItems: "center", borderWidth: 2, borderColor: Colors.border, borderStyle: "dashed" },
  uploadIcon: { fontSize: 40, marginBottom: Spacing.md },
  uploadText: { fontSize: Typography.size.base, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  uploadSub: { fontSize: Typography.size.sm, color: Colors.textMuted, marginTop: 4 },
  durationRow: { gap: Spacing.xs },
  label: { fontSize: Typography.size.sm, color: Colors.textSecondary, fontWeight: Typography.weight.semiBold },
  input: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: Typography.size.base, borderWidth: 1, borderColor: Colors.border },
  inputLarge: { minHeight: 100, textAlignVertical: "top" },
  hint: { fontSize: Typography.size.xs, color: Colors.textMuted, fontStyle: "italic" },
  selectCard: { flexDirection: "row", alignItems: "center", gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  selectCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  selectIcon: { fontSize: 20 },
  selectLabel: { flex: 1, fontSize: Typography.size.base, color: Colors.textPrimary, fontWeight: Typography.weight.medium },
  selectLabelActive: { color: Colors.primary, fontWeight: Typography.weight.bold },
  checkmark: { color: Colors.primary, fontSize: Typography.size.lg, fontWeight: Typography.weight.bold },
  premiumRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base },
  premiumLabel: { fontSize: Typography.size.base, fontWeight: Typography.weight.semiBold, color: Colors.textPrimary },
  premiumSub: { fontSize: Typography.size.xs, color: Colors.textSecondary, marginTop: 2 },
  diffRow: { flexDirection: "row", gap: Spacing.sm },
  diffBtn: { flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: "center" },
  diffBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  diffText: { fontSize: Typography.size.xs, color: Colors.textSecondary, fontWeight: Typography.weight.medium, textTransform: "capitalize" },
  diffTextActive: { color: Colors.primary, fontWeight: Typography.weight.bold },
  reviewRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: Spacing.sm },
  reviewKey: { width: 90, fontSize: Typography.size.sm, color: Colors.textMuted },
  reviewVal: { flex: 1, fontSize: Typography.size.sm, color: Colors.textPrimary, fontWeight: Typography.weight.medium },
  infoBox: { backgroundColor: Colors.primaryMuted, borderRadius: Radius.lg, padding: Spacing.md },
  infoText: { fontSize: Typography.size.sm, color: Colors.primary, lineHeight: 20 },
  submitBtn: { backgroundColor: Colors.primary, padding: Spacing.md, borderRadius: Radius.lg, alignItems: "center" },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: Colors.textInverse, fontSize: Typography.size.md, fontWeight: Typography.weight.bold },
  navBtns: { flexDirection: "row", justifyContent: "space-between", padding: Spacing.base, gap: Spacing.md },
  navBtn: { flex: 1, padding: Spacing.md, borderRadius: Radius.lg, alignItems: "center", backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  navBtnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  navBtnText: { fontSize: Typography.size.base, color: Colors.textSecondary, fontWeight: Typography.weight.semiBold },
  navBtnPrimaryText: { color: Colors.textInverse },
});
