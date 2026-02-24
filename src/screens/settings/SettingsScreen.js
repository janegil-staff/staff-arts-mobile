import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../store/authStore";
import { colors, sp, rad, fs, fw, glassCard } from "../../constants/theme";

function MenuItem(props) {
  return (
    <TouchableOpacity style={s.menuItem} onPress={props.onPress} activeOpacity={0.7}>
      <View style={[s.menuIcon, { backgroundColor: props.iconBg || colors.accentMuted }]}>
        <Ionicons name={props.icon} size={18} color={props.iconColor || colors.accent} />
      </View>
      <Text style={s.menuLabel}>{props.label}</Text>
      {props.value ? <Text style={s.menuValue}>{props.value}</Text> : null}
      {props.toggle !== undefined ? (
        <Switch value={props.toggle} onValueChange={props.onToggle} trackColor={{ false: colors.border, true: colors.accentMuted }} thumbColor={props.toggle ? colors.accent : colors.textMuted} />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }) {
  var ins = useSafeAreaInsets();
  var _auth = useAuth(); var logout = _auth.logout;

  function onLogout() {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: function () { logout(); } },
    ]);
  }

  function onDeleteAccount() {
    Alert.alert("Delete Account", "This action cannot be undone. All your data will be permanently deleted.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: function () { /* TODO: call API */ } },
    ]);
  }

  return (
    <View style={[s.c, { paddingTop: ins.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={function () { navigation.goBack(); }}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Account */}
        <Text style={s.sectionTitle}>Account</Text>
        <View style={[s.section, glassCard]}>
          <MenuItem icon="person-outline" label="Edit Profile" onPress={function () { navigation.navigate("EditProfile"); }} />
          <MenuItem icon="lock-closed-outline" label="Change Password" onPress={function () {}} />
          <MenuItem icon="shield-checkmark-outline" label="Privacy" onPress={function () {}} />
        </View>

        {/* Preferences */}
        <Text style={s.sectionTitle}>Preferences</Text>
        <View style={[s.section, glassCard]}>
          <MenuItem icon="notifications-outline" label="Push Notifications" toggle={true} onToggle={function () {}} />
          <MenuItem icon="mail-outline" label="Email Updates" toggle={false} onToggle={function () {}} />
        </View>

        {/* Support */}
        <Text style={s.sectionTitle}>Support</Text>
        <View style={[s.section, glassCard]}>
          <MenuItem icon="help-circle-outline" label="Help Center" onPress={function () {}} />
          <MenuItem icon="chatbubble-ellipses-outline" label="Contact Us" onPress={function () {}} />
          <MenuItem icon="document-text-outline" label="Terms of Service" onPress={function () { Linking.openURL("https://staffarts.com/terms"); }} />
          <MenuItem icon="shield-outline" label="Privacy Policy" onPress={function () { Linking.openURL("https://staffarts.com/privacy"); }} />
        </View>

        {/* About */}
        <Text style={s.sectionTitle}>About</Text>
        <View style={[s.section, glassCard]}>
          <MenuItem icon="information-circle-outline" label="Version" value="1.0.0" onPress={function () {}} />
          <MenuItem icon="star-outline" label="Rate Staff Arts" onPress={function () {}} />
        </View>

        {/* Actions */}
        <TouchableOpacity style={s.logoutBtn} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={s.logoutTxt}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.deleteBtn} onPress={onDeleteAccount}>
          <Text style={s.deleteTxt}>Delete Account</Text>
        </TouchableOpacity>

        <View style={{ height: sp.xxl }} />
      </ScrollView>
    </View>
  );
}

var s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: sp.md, paddingVertical: sp.md },
  headerTitle: { fontSize: fs.lg, fontWeight: fw.bold, color: colors.text },
  scroll: { paddingHorizontal: sp.md, paddingBottom: 40 },
  sectionTitle: { fontSize: fs.sm, fontWeight: fw.medium, color: colors.textMuted, marginTop: sp.lg, marginBottom: sp.sm, textTransform: "uppercase", letterSpacing: 1 },
  section: { overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: sp.md, paddingHorizontal: sp.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center", marginRight: sp.md },
  menuLabel: { flex: 1, fontSize: fs.md, color: colors.text },
  menuValue: { fontSize: fs.sm, color: colors.textMuted, marginRight: sp.sm },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: sp.sm, marginTop: sp.xl, paddingVertical: sp.md, borderRadius: rad.md, borderWidth: 1, borderColor: colors.danger + "33" },
  logoutTxt: { fontSize: fs.md, fontWeight: fw.semibold, color: colors.danger },
  deleteBtn: { alignItems: "center", marginTop: sp.md, paddingVertical: sp.sm },
  deleteTxt: { fontSize: fs.sm, color: colors.textMuted },
});
