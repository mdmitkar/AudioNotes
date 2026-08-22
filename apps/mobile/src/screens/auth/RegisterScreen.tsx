import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../stores/authStore";
import { Colors, Typography, Spacing, Radius } from "../../theme";

export function RegisterScreen() {
  const nav = useNavigation<any>();
  const { register } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) { Alert.alert("Error", "Please fill in all fields"); return; }
    if (password.length < 6) { Alert.alert("Error", "Password must be at least 6 characters"); return; }
    setLoading(true);
    const success = await register(name, email.trim().toLowerCase(), password, role);
    setLoading(false);
    if (!success) Alert.alert("Registration Failed", "Email may already be in use.");
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => nav.goBack()} style={s.back}>
            <Text style={s.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={s.title}>Create account</Text>
          <Text style={s.subtitle}>Start your revision journey today</Text>

          <Text style={s.label}>Full Name</Text>
          <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Rahul Gupta" placeholderTextColor={Colors.textMuted} autoCapitalize="words" />

          <Text style={s.label}>Email</Text>
          <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={Colors.textMuted} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />

          <Text style={s.label}>Password</Text>
          <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder="Min 6 characters" placeholderTextColor={Colors.textMuted} secureTextEntry />

          <Text style={s.label}>I am a...</Text>
          <View style={s.roleRow}>
            {[["student", "🎓 Student"], ["creator", "🎙️ Creator"]].map(([r, label]) => (
              <TouchableOpacity key={r} style={[s.roleBtn, role === r && s.roleBtnActive]} onPress={() => setRole(r)}>
                <Text style={[s.roleBtnText, role === r && s.roleBtnTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <View style={s.footer}>
            <Text style={s.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => nav.navigate("Login")}>
              <Text style={s.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { paddingHorizontal: Spacing.base, paddingTop: Spacing.lg, paddingBottom: Spacing["3xl"] },
  back: { marginBottom: Spacing.xl },
  backText: { color: Colors.textSecondary, fontSize: Typography.size.base },
  title: { fontSize: Typography.size["3xl"], fontWeight: Typography.weight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.size.base, color: Colors.textSecondary, marginBottom: Spacing["2xl"] },
  label: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, color: Colors.textSecondary, marginBottom: 6, marginTop: Spacing.sm },
  input: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: Typography.size.base, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
  roleRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.lg },
  roleBtn: { flex: 1, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: "center" },
  roleBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  roleBtnText: { color: Colors.textSecondary, fontSize: Typography.size.base, fontWeight: Typography.weight.medium },
  roleBtnTextActive: { color: Colors.primary, fontWeight: Typography.weight.bold },
  btn: { backgroundColor: Colors.primary, padding: Spacing.md, borderRadius: Radius.lg, alignItems: "center", marginTop: Spacing.md },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: Colors.textInverse, fontSize: Typography.size.md, fontWeight: Typography.weight.bold },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: Spacing.xl },
  footerText: { color: Colors.textSecondary, fontSize: Typography.size.base },
  footerLink: { color: Colors.primary, fontSize: Typography.size.base, fontWeight: Typography.weight.semiBold },
});
