import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../stores/authStore";
import { Colors, Typography, Spacing, Radius } from "../../theme";
import { getInitials } from "../../utils";

export function ProfileScreen() {
  const nav = useNavigation<any>();
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.loginPrompt}>
          <Text style={s.loginEmoji}>👤</Text>
          <Text style={s.loginTitle}>Your Profile</Text>
          <TouchableOpacity style={s.loginBtn} onPress={() => nav.navigate("Auth")}>
            <Text style={s.loginBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{getInitials(user.name)}</Text>
          </View>
          <Text style={s.name}>{user.name}</Text>
          <Text style={s.email}>{user.email}</Text>
          <View style={s.roleBadge}>
            <Text style={s.roleText}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Text>
          </View>
        </View>

        <View style={s.section}>
          {(user.role === "creator" || user.role === "admin") && (
            <MenuItem icon="🎙️" label="Creator Dashboard" onPress={() => nav.navigate("CreatorDashboard")} />
          )}
          {user.role === "admin" && (
            <MenuItem icon="⚙️" label="Admin Dashboard" onPress={() => nav.navigate("AdminDashboard")} />
          )}
          <MenuItem icon="🔖" label="My Bookmarks" onPress={() => nav.navigate("Library")} />
          <MenuItem icon="📖" label="Listening History" onPress={() => nav.navigate("Library")} />
          <MenuItem icon="💎" label="Premium Plans" onPress={() => {}} />
          <MenuItem icon="🔔" label="Notifications" onPress={() => {}} />
          <MenuItem icon="❓" label="Help & Support" onPress={() => {}} />
          <MenuItem icon="📄" label="About ReviseCast" onPress={() => {}} />
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.menuItem} onPress={onPress}>
      <Text style={s.menuIcon}>{icon}</Text>
      <Text style={s.menuLabel}>{label}</Text>
      <Text style={s.menuChevron}>›</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loginPrompt: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xl },
  loginEmoji: { fontSize: 56, marginBottom: Spacing.lg },
  loginTitle: { fontSize: Typography.size["2xl"], fontWeight: Typography.weight.bold, color: Colors.textPrimary, marginBottom: Spacing.xl },
  loginBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.lg },
  loginBtnText: { color: Colors.textInverse, fontWeight: Typography.weight.bold },
  header: { alignItems: "center", paddingTop: Spacing.xl, paddingBottom: Spacing["2xl"] },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center", marginBottom: Spacing.md },
  avatarText: { fontSize: Typography.size["2xl"], fontWeight: Typography.weight.bold, color: Colors.textInverse },
  name: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.textPrimary, marginBottom: 4 },
  email: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  roleBadge: { backgroundColor: Colors.primaryMuted, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  roleText: { color: Colors.primary, fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold },
  section: { marginHorizontal: Spacing.base, backgroundColor: Colors.surface, borderRadius: Radius.xl, overflow: "hidden", marginBottom: Spacing.lg },
  menuItem: { flexDirection: "row", alignItems: "center", padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: { fontSize: 18, width: 28 },
  menuLabel: { flex: 1, fontSize: Typography.size.base, color: Colors.textPrimary, fontWeight: Typography.weight.medium },
  menuChevron: { fontSize: 20, color: Colors.textMuted },
  logoutBtn: { marginHorizontal: Spacing.base, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, alignItems: "center", borderWidth: 1, borderColor: Colors.error + "44" },
  logoutText: { color: Colors.error, fontSize: Typography.size.base, fontWeight: Typography.weight.semiBold },
});
