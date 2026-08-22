import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../stores/authStore";
import { Colors, Typography, Spacing, Radius } from "../../theme";

export function LoginScreen() {
  const nav = useNavigation<any>();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert("Error", "Please fill in all fields"); return; }
    setLoading(true);
    const success = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (!success) Alert.alert("Login Failed", "Invalid email or password. Please try again.");
  };

  const fillDemo = (type: string) => {
    const demos: Record<string, [string, string]> = {
      student: ["rahul@revisecast.com", "student123"],
      creator: ["arjun@revisecast.com", "creator123"],
      admin: ["admin@revisecast.com", "admin123"],
    };
    const [e, p] = demos[type];
    setEmail(e); setPassword(p);
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.inner}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.back}>
          <Text style={s.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Welcome back</Text>
        <Text style={s.subtitle}>Sign in to continue your revision</Text>
        <View style={s.form}>
          <Text style={s.label}>Email</Text>
          <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={Colors.textMuted} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <Text style={s.label}>Password</Text>
          <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder="Your password" placeholderTextColor={Colors.textMuted} secureTextEntry />
          <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign In</Text>}
          </TouchableOpacity>
        </View>
        <View style={s.demo}>
          <Text style={s.demoLabel}>Demo accounts — tap to fill:</Text>
          <View style={s.demoRow}>
            {["student", "creator", "admin"].map(t => (
              <TouchableOpacity key={t} style={s.demoBtn} onPress={() => fillDemo(t)}>
                <Text style={s.demoBtnText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={s.footer}>
          <Text style={s.footerText}>No account? </Text>
          <TouchableOpacity onPress={() => nav.navigate("Register")}>
            <Text style={s.footerLink}>Sign up free</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, paddingHorizontal: Spacing.base, paddingTop: Spacing.lg },
  back: { marginBottom: Spacing.xl },
  backText: { color: Colors.textSecondary, fontSize: Typography.size.base },
  title: { fontSize: Typography.size["3xl"], fontWeight: Typography.weight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.size.base, color: Colors.textSecondary, marginBottom: Spacing["2xl"] },
  form: { gap: Spacing.sm },
  label: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, color: Colors.textSecondary, marginBottom: 4 },
  input: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: Typography.size.base, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  btn: { backgroundColor: Colors.primary, padding: Spacing.md, borderRadius: Radius.lg, alignItems: "center", marginTop: Spacing.sm },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: Colors.textInverse, fontSize: Typography.size.md, fontWeight: Typography.weight.bold },
  demo: { marginTop: Spacing.xl, padding: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.md },
  demoLabel: { color: Colors.textMuted, fontSize: Typography.size.sm, marginBottom: Spacing.sm },
  demoRow: { flexDirection: "row", gap: Spacing.sm },
  demoBtn: { flex: 1, backgroundColor: Colors.surfaceElevated, padding: Spacing.sm, borderRadius: Radius.sm, alignItems: "center" },
  demoBtnText: { color: Colors.primary, fontSize: Typography.size.xs, fontWeight: Typography.weight.semiBold },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: Spacing["2xl"] },
  footerText: { color: Colors.textSecondary, fontSize: Typography.size.base },
  footerLink: { color: Colors.primary, fontSize: Typography.size.base, fontWeight: Typography.weight.semiBold },
});
