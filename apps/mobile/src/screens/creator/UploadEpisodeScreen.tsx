import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { creatorApi, examApi, subjectApi, topicApi } from "../../api";
import { Colors, Typography, Spacing, Radius } from "../../theme";
import { createAudioPlayer, useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync } from "expo-audio";

const STEPS = ["Audio", "Title", "Description", "Exam", "Subject", "Topic", "Thumbnail", "Free/Premium", "Review", "Submit"];

export function UploadEpisodeScreen() {
  const nav = useNavigation<any>();
  const [step, setStep] = useState(0);
  const [uploadMode, setUploadMode] = useState<"record" | "file">("record");
  const [form, setForm] = useState({
    title: "", description: "", examId: "", subjectId: "", topicId: "",
    duration: "", isPremium: false, difficulty: "intermediate", whatYoullLearn: "",
  });
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Recorder states
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Preview Player states
  const [previewPlayer, setPreviewPlayer] = useState<any>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewPosition, setPreviewPosition] = useState(0);

  useEffect(() => {
    examApi.list().then(r => { if (r.success) setExams(r.data); });
  }, []);

  useEffect(() => {
    if (form.examId) {
      examApi.subjects(form.examId).then(r => { 
        if (r.success) setSubjects(r.data); 
        setForm(f => ({ ...f, subjectId: "", topicId: "" })); 
      });
    }
  }, [form.examId]);

  useEffect(() => {
    if (form.subjectId) {
      subjectApi.topics(form.subjectId).then(r => { 
        if (r.success) setTopics(r.data); 
        setForm(f => ({ ...f, topicId: "" })); 
      });
    }
  }, [form.subjectId]);

  // Clean up recording and audio resources
  useEffect(() => {
    return () => {
      if (previewPlayer) {
        previewPlayer.remove();
      }
    };
  }, [recording, previewPlayer]);

  // Timer effect when recording
  useEffect(() => {
    let interval: any = null;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingDuration(d => d + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  // Recorder operations
  const startRecording = async () => {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission Denied", "Microphone access is required to record audio.");
        return;
      }

      if (previewPlayer) {
        previewPlayer.remove();
        setPreviewPlayer(null);
        setIsPreviewPlaying(false);
        setPreviewPosition(0);
      }

      await recorder.prepareToRecordAsync();
      recorder.record();
      
      setIsRecording(true);
      setIsPaused(false);
      setRecordingDuration(0);
      setRecordedUri(null);
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const pauseRecording = async () => {
    try {
      recorder.pause();
      setIsPaused(true);
    } catch (err) {
      console.error("Failed to pause recording", err);
    }
  };

  const resumeRecording = async () => {
    try {
      recorder.record();
      setIsPaused(false);
    } catch (err) {
      console.error("Failed to resume recording", err);
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      setRecordedUri(recorder.uri);
      setIsRecording(false);
      setIsPaused(false);

      const calculatedDurationMin = Math.max(1, Math.round(recordingDuration / 60));
      update("duration", String(calculatedDurationMin));
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  };

  const playPreview = async () => {
    if (!recordedUri) return;
    try {
      if (previewPlayer) {
        previewPlayer.play();
        setIsPreviewPlaying(true);
        return;
      }

      const player = createAudioPlayer({
        uri: recordedUri,
      });

      player.addListener("playbackStatusUpdate", (status) => {
        setIsPreviewPlaying(status.playing);
        setPreviewPosition(Math.floor(status.currentTime || 0));
        if (status.didJustFinish) {
          setIsPreviewPlaying(false);
          setPreviewPosition(0);
        }
      });

      setPreviewPlayer(player);
      player.play();
      setIsPreviewPlaying(true);
    } catch (err) {
      console.error("Failed to play preview", err);
    }
  };

  const pausePreview = async () => {
    if (previewPlayer) {
      previewPlayer.pause();
      setIsPreviewPlaying(false);
    }
  };

  const resetRecording = async () => {
    if (previewPlayer) {
      previewPlayer.remove();
      setPreviewPlayer(null);
    }
    setRecordedUri(null);
    setRecordingDuration(0);
    setIsPreviewPlaying(false);
    setPreviewPosition(0);
    update("duration", "");
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const submit = async () => {
    if (uploadMode === "record" && !recordedUri) {
      Alert.alert("Error", "Please record an audio note first");
      return;
    }
    if (uploadMode === "file" && !form.duration) {
      Alert.alert("Error", "Please specify the duration");
      return;
    }

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
    if (form.whatYoullLearn) {
      form.whatYoullLearn.split("\n").forEach(l => fd.append("whatYoullLearn", l.trim()));
    }

    if (uploadMode === "record" && recordedUri) {
      const filename = `recording_${Date.now()}.m4a`;
      fd.append("audio", {
        uri: recordedUri,
        name: filename,
        type: "audio/m4a",
      } as any);
    } else {
      // Mock File Upload mode
      fd.append("audio", {
        uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        name: "mock_revision_note.mp3",
        type: "audio/mp3",
      } as any);
    }

    const res = await creatorApi.uploadEpisode(fd);
    setLoading(false);
    if (res.success) {
      Alert.alert("Submitted!", "Your audio note has been successfully saved!", [
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
          <Text style={s.stepTitle}>Audio Source</Text>
          <Text style={s.stepDesc}>Record your revision note or upload an audio file.</Text>
          
          <View style={s.tabRow}>
            <TouchableOpacity style={[s.tabButton, uploadMode === "record" && s.tabActive]} onPress={() => setUploadMode("record")}>
              <Text style={[s.tabButtonText, uploadMode === "record" && s.tabButtonTextActive]}>Record Audio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.tabButton, uploadMode === "file" && s.tabActive]} onPress={() => setUploadMode("file")}>
              <Text style={[s.tabButtonText, uploadMode === "file" && s.tabButtonTextActive]}>Upload File</Text>
            </TouchableOpacity>
          </View>

          {uploadMode === "record" ? (
            <View style={s.recorderContainer}>
              <Text style={s.recordTimer}>{formatTime(recordingDuration)}</Text>
              
              {!recordedUri && !isRecording && (
                <>
                  <Text style={s.recordStatus}>Ready to record</Text>
                  <TouchableOpacity style={s.recordBtn} onPress={startRecording}>
                    <Text style={s.recordBtnText}>🎙️</Text>
                  </TouchableOpacity>
                </>
              )}

              {isRecording && (
                <>
                  <View style={s.pulseCircle} />
                  <Text style={s.recordStatus}>{isPaused ? "Recording Paused" : "Recording..."}</Text>
                  <View style={s.controlRow}>
                    <TouchableOpacity style={s.controlBtn} onPress={isPaused ? resumeRecording : pauseRecording}>
                      <Text style={s.controlBtnText}>{isPaused ? "▶" : "⏸"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.controlBtn, s.controlBtnPrimary]} onPress={stopRecording}>
                      <Text style={[s.controlBtnText, { color: Colors.textInverse }]}>⏹</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {recordedUri && !isRecording && (
                <>
                  <Text style={s.recordStatus}>Recording Complete!</Text>
                  
                  <View style={s.previewContainer}>
                    <View style={s.previewInfoRow}>
                      <Text style={s.previewTitle}>Preview Note</Text>
                      <Text style={s.previewDuration}>
                        {formatTime(previewPosition)} / {formatTime(recordingDuration)}
                      </Text>
                    </View>
                    <View style={s.progressBarContainer}>
                      <View style={[s.progressBarFill, { width: `${recordingDuration > 0 ? (previewPosition / recordingDuration) * 100 : 0}%` as any }]} />
                    </View>
                    <View style={{ alignItems: "center", marginTop: 12 }}>
                      <TouchableOpacity style={[s.controlBtn, s.controlBtnPrimary]} onPress={isPreviewPlaying ? pausePreview : playPreview}>
                        <Text style={[s.controlBtnText, { color: Colors.textInverse }]}>{isPreviewPlaying ? "⏸" : "▶"}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={s.resetRow}>
                    <TouchableOpacity style={s.resetBtn} onPress={resetRecording}>
                      <Text style={s.resetBtnText}>🗑️ Delete & Record Again</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ) : (
            <>
              <View style={s.uploadBox}>
                <Text style={s.uploadIcon}>🎵</Text>
                <Text style={s.uploadText}>Selected: mock_revision_note.mp3</Text>
                <Text style={s.uploadSub}>MP3, WAV, AAC supported</Text>
              </View>
              <View style={s.durationRow}>
                <Text style={s.label}>Duration (minutes)</Text>
                <TextInput style={s.input} value={form.duration} onChangeText={v => update("duration", v)} keyboardType="numeric" placeholder="e.g. 15" placeholderTextColor={Colors.textMuted} />
              </View>
            </>
          )}
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

  // Tab Selector
  tabRow: { flexDirection: "row", backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 4, marginBottom: Spacing.md },
  tabButton: { flex: 1, paddingVertical: Spacing.sm, alignItems: "center", borderRadius: Radius.md },
  tabActive: { backgroundColor: Colors.surfaceElevated },
  tabButtonText: { color: Colors.textSecondary, fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold },
  tabButtonTextActive: { color: Colors.primary },

  // Recorder Container
  recorderContainer: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: "center", borderWidth: 1, borderColor: Colors.border, gap: Spacing.lg },
  recordTimer: { fontSize: Typography.size["4xl"], fontWeight: Typography.weight.bold, color: Colors.textPrimary, letterSpacing: 1 },
  recordStatus: { fontSize: Typography.size.sm, color: Colors.textMuted },
  recordBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.error, justifyContent: "center", alignItems: "center" },
  recordBtnText: { fontSize: 28 },
  pulseCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.error + "22", position: "absolute", justifyContent: "center", alignItems: "center" },

  // Control Buttons
  controlRow: { flexDirection: "row", gap: Spacing.lg, alignItems: "center" },
  controlBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.surfaceElevated, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  controlBtnText: { fontSize: Typography.size.lg, color: Colors.textPrimary },
  controlBtnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },

  // Preview Player
  previewContainer: { width: "100%", backgroundColor: Colors.surfaceElevated, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm },
  previewInfoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  previewTitle: { color: Colors.textPrimary, fontWeight: Typography.weight.semiBold, fontSize: Typography.size.sm },
  previewDuration: { color: Colors.textSecondary, fontSize: Typography.size.xs },
  progressBarContainer: { height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: Colors.primary },

  // Reset Row
  resetRow: { flexDirection: "row", justifyContent: "flex-end", width: "100%" },
  resetBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4, paddingHorizontal: Spacing.sm },
  resetBtnText: { color: Colors.error, fontSize: Typography.size.xs, fontWeight: Typography.weight.semiBold },

  // Standard Form items
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
