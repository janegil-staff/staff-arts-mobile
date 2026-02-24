import React from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, Button } from "../../components/ui";
import { useAuth } from "../../store/authStore";
import { colors, sp, rad, fs, fw, glassCard, shadows } from "../../constants/theme";

export default function ProfileScreen(props) {
  var navigation = props.navigation;
  var auth = useAuth();

  // ── Not logged in ──
  if (!auth.isAuthenticated || !auth.user) {
    return (
      <View style={[s.container, s.guestCenter]}>
        <Ionicons name="person-circle-outline" size={72} color={colors.textMuted} />
        <Text style={s.guestTitle}>Your profile</Text>
        <Text style={s.guestSub}>Sign in to manage your artworks, orders, and settings.</Text>
        <Button
          title="Sign In"
          onPress={function () { navigation.navigate("Login"); }}
          size="lg"
          style={[{ width: "100%", marginTop: sp.lg }, shadows.md]}
        />
        <Button
          title="Create Account"
          variant="outline"
          onPress={function () { navigation.navigate("Register"); }}
          size="md"
          style={{ width: "100%", marginTop: sp.sm }}
        />
      </View>
    );
  }

  // ── Logged in ──
  var user = auth.user;

  function onLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: function () { auth.logout(); } },
    ]);
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Text style={s.title}>Profile</Text>
        <TouchableOpacity style={s.settingsBtn} onPress={function () { navigation.navigate("Settings"); }}>
          <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={[s.card, glassCard, shadows.md]}>
        <Avatar name={user.name || user.displayName} imageUrl={user.avatar} size={72} />
        <View style={s.userInfo}>
          <Text style={s.name}>{user.name || user.displayName || "User"}</Text>
          <Text style={s.email}>{user.email || ""}</Text>
          {user.role ? (
            <View style={s.roleBadge}>
              <Text style={s.roleText}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={[s.statsRow, glassCard]}>
        <View style={s.stat}><Text style={s.statNum}>{user.followersCount || 0}</Text><Text style={s.statLabel}>Followers</Text></View>
        <View style={s.statDivider} />
        <View style={s.stat}><Text style={s.statNum}>{user.followingCount || 0}</Text><Text style={s.statLabel}>Following</Text></View>
        <View style={s.statDivider} />
        <View style={s.stat}><Text style={s.statNum}>{user.artworksCount || 0}</Text><Text style={s.statLabel}>Works</Text></View>
      </View>

      <View style={[s.menu, glassCard]}>
        <MenuItem icon="create-outline" label="Edit Profile" onPress={function () { navigation.navigate("EditProfile"); }} />
        <MenuItem icon="receipt-outline" label="Orders" onPress={function () { navigation.navigate("Orders"); }} />
        <MenuItem icon="brush-outline" label="Commissions" onPress={function () { navigation.navigate("Commissions"); }} />
        <MenuItem icon="musical-notes-outline" label="Music" onPress={function () { navigation.navigate("Music"); }} last />
      </View>

      <View style={[s.menu, glassCard]}>
        <MenuItem icon="help-circle-outline" label="Help & Support" onPress={function () {}} />
        <MenuItem icon="shield-checkmark-outline" label="Privacy" onPress={function () {}} last />
      </View>

      <TouchableOpacity style={[s.logoutBtn, glassCard]} activeOpacity={0.7} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={s.version}>Staff Arts v1.0.0</Text>
    </ScrollView>
  );
}

function MenuItem(props) {
  return (
    <TouchableOpacity style={[s.menuItem, !props.last && s.menuBorder]} activeOpacity={0.6} onPress={props.onPress}>
      <View style={s.menuLeft}>
        <Ionicons name={props.icon} size={20} color={colors.accent} />
        <Text style={s.menuLabel}>{props.label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

var s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: sp.md, paddingBottom: 120 },
  guestCenter: { alignItems: "center", justifyContent: "center", paddingHorizontal: sp.xl },
  guestTitle: { fontSize: fs.xxl, fontWeight: fw.bold, color: colors.text, marginTop: sp.lg },
  guestSub: { fontSize: fs.md, color: colors.textMuted, textAlign: "center", marginTop: sp.sm, lineHeight: 22 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: sp.md },
  title: { fontSize: fs.xxl, fontWeight: fw.bold, color: colors.text },
  settingsBtn: { padding: sp.sm },
  card: { flexDirection: "row", alignItems: "center", padding: sp.lg, marginBottom: sp.md },
  userInfo: { marginLeft: sp.md, flex: 1 },
  name: { fontSize: fs.xl, fontWeight: fw.bold, color: colors.text },
  email: { fontSize: fs.sm, color: colors.textSecondary, marginTop: 2 },
  roleBadge: { marginTop: sp.sm, alignSelf: "flex-start", backgroundColor: colors.accentMuted, paddingHorizontal: sp.sm + 2, paddingVertical: 3, borderRadius: rad.full },
  roleText: { fontSize: fs.xs, color: colors.accent, fontWeight: fw.semibold },
  statsRow: { flexDirection: "row", alignItems: "center", paddingVertical: sp.md, marginBottom: sp.md },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: fs.xl, fontWeight: fw.bold, color: colors.text },
  statLabel: { fontSize: fs.xs, color: colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border },
  menu: { marginBottom: sp.md, overflow: "hidden" },
  menuItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: sp.md, paddingHorizontal: sp.md },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: sp.md },
  menuLabel: { fontSize: fs.md, color: colors.text },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: sp.md, gap: sp.sm, marginBottom: sp.md },
  logoutText: { fontSize: fs.md, fontWeight: fw.semibold, color: colors.danger },
  version: { textAlign: "center", fontSize: fs.xs, color: colors.textMuted, marginTop: sp.sm },
});
