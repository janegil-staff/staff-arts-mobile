import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { Button, TextInput, GoogleButton, Divider, Chip } from "../../components/ui";
import { useAuth } from "../../store/authStore";
import { useGoogleAuth } from "../../hooks";
import { USER_ROLES } from "../../constants";
import { colors, sp, fs, fw, rad, shadows } from "../../constants/theme";

export default function RegisterScreen(props) {
  var nav = props.navigation;
  var ins = useSafeAreaInsets();
  var auth = useAuth();
  var google = useGoogleAuth();

  var name = useState("");
  var email = useState("");
  var password = useState("");
  var role = useState("artist");
  var loading = useState(false);

  function goToProfile() {
    setTimeout(function () {
      nav.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "ProfileMain" }],
        })
      );
    }, 100);
  }

  function onRegister() {
    var n = name[0].trim();
    var e = email[0].trim();
    var p = password[0];
    if (!n || !e || !p) { Alert.alert("Missing fields", "Please fill in all fields."); return; }
    if (p.length < 6) { Alert.alert("Weak password", "Password must be at least 6 characters."); return; }

    loading[1](true);
    auth.register({ name: n, email: e, password: p, role: role[0] }).then(function () {
      loading[1](false);
      goToProfile();
    }).catch(function (err) {
      loading[1](false);
      Alert.alert("Registration failed", err.message || "Something went wrong");
    });
  }

  function onGoogle() {
    if (google.isReady && google.promptAsync) { google.promptAsync(); }
  }

  return (
    <KeyboardAvoidingView style={[s.c, { paddingTop: ins.top }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.backBtn} onPress={function () { nav.goBack(); }}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={s.title}>Create account</Text>
        <Text style={s.subtitle}>Join the community</Text>

        <Text style={s.label}>I am a...</Text>
        <View style={s.roles}>
          {USER_ROLES.map(function (r) {
            return <Chip key={r.value} label={r.label} active={role[0] === r.value} onPress={function () { role[1](r.value); }} />;
          })}
        </View>

        <View style={s.form}>
          <TextInput label="Name" placeholder="Your full name" value={name[0]} onChangeText={name[1]} icon="person-outline" autoCapitalize="words" returnKeyType="next" />
          <TextInput label="Email" placeholder="you@example.com" value={email[0]} onChangeText={email[1]} icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} returnKeyType="next" />
          <TextInput label="Password" placeholder="At least 6 characters" value={password[0]} onChangeText={password[1]} icon="lock-closed-outline" isPassword returnKeyType="done" onSubmitEditing={onRegister} hint="Min. 6 characters" />
          <Button title="Create Account" onPress={onRegister} loading={loading[0]} size="lg" style={[{ marginTop: sp.md }, shadows.md]} />
        </View>

        <Divider text="or" />
        <GoogleButton title="Sign up with Google" onPress={onGoogle} disabled={!google.isReady} />

        <View style={s.footer}>
          <Text style={s.footerTxt}>Already have an account?</Text>
          <TouchableOpacity onPress={function () { nav.replace("Login"); }}>
            <Text style={s.footerLink}> Sign in</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.terms}>By creating an account you agree to our Terms of Service and Privacy Policy.</Text>

        {auth.error ? (
          <View style={s.errorBanner}>
            <Text style={s.errorTxt}>{auth.error}</Text>
            <TouchableOpacity onPress={auth.clearError}><Ionicons name="close" size={16} color={colors.danger} /></TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

var s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: sp.lg, paddingBottom: sp.xxl },
  backBtn: { paddingVertical: sp.md },
  title: { fontSize: fs.xxl, fontWeight: fw.bold, color: colors.text, marginTop: sp.md },
  subtitle: { fontSize: fs.md, color: colors.textSecondary, marginTop: sp.xs, marginBottom: sp.lg },
  label: { fontSize: fs.sm, fontWeight: fw.medium, color: colors.textSecondary, marginBottom: sp.sm },
  roles: { flexDirection: "row", flexWrap: "wrap", gap: sp.sm, marginBottom: sp.lg },
  form: {},
  footer: { flexDirection: "row", justifyContent: "center", marginTop: sp.lg },
  footerTxt: { fontSize: fs.md, color: colors.textSecondary },
  footerLink: { fontSize: fs.md, color: colors.accent, fontWeight: fw.semibold },
  terms: { fontSize: fs.xs, color: colors.textMuted, textAlign: "center", marginTop: sp.md, lineHeight: 18 },
  errorBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.danger + "10", borderWidth: 1, borderColor: colors.danger + "30", borderRadius: rad.md, padding: sp.md, marginTop: sp.md },
  errorTxt: { fontSize: fs.sm, color: colors.danger, flex: 1, marginRight: sp.sm },
});
