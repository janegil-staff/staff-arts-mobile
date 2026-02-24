import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { Button, TextInput, GoogleButton, Divider } from "../../components/ui";
import { useAuth } from "../../store/authStore";
import { useGoogleAuth } from "../../hooks";
import { colors, sp, fs, fw, rad, shadows } from "../../constants/theme";

export default function LoginScreen(props) {
  var nav = props.navigation;
  var ins = useSafeAreaInsets();
  var auth = useAuth();
  var google = useGoogleAuth();

  var email = useState("");
  var password = useState("");
  var loading = useState(false);

  function goToProfile() {
    // Reset the ProfileStack so ProfileMain is the only screen
    // By the time this renders, auth state will have updated
    setTimeout(function () {
      nav.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "ProfileMain" }],
        })
      );
    }, 100);
  }

  function onLogin() {
    var e = email[0].trim();
    var p = password[0];
    if (!e || !p) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    loading[1](true);
    auth.login(e, p).then(function () {
      loading[1](false);
      goToProfile();
    }).catch(function (err) {
      loading[1](false);
      Alert.alert("Login failed", err.message || "Invalid credentials");
    });
  }

  function onGoogle() {
    if (google.isReady && google.promptAsync) {
      google.promptAsync();
    }
  }

  return (
    <KeyboardAvoidingView style={[s.c, { paddingTop: ins.top }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.backBtn} onPress={function () { nav.goBack(); }}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={s.title}>Welcome back</Text>
        <Text style={s.subtitle}>Sign in to your account</Text>

        <View style={s.form}>
          <TextInput label="Email" placeholder="you@example.com" value={email[0]} onChangeText={email[1]} icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} returnKeyType="next" />
          <TextInput label="Password" placeholder="Your password" value={password[0]} onChangeText={password[1]} icon="lock-closed-outline" isPassword returnKeyType="done" onSubmitEditing={onLogin} />
          <TouchableOpacity style={s.forgotBtn}><Text style={s.forgotTxt}>Forgot password?</Text></TouchableOpacity>
          <Button title="Sign In" onPress={onLogin} loading={loading[0]} size="lg" style={[{ marginTop: sp.sm }, shadows.md]} />
        </View>

        <Divider text="or" />
        <GoogleButton onPress={onGoogle} disabled={!google.isReady} />

        <View style={s.footer}>
          <Text style={s.footerTxt}>Don't have an account?</Text>
          <TouchableOpacity onPress={function () { nav.replace("Register"); }}>
            <Text style={s.footerLink}> Sign up</Text>
          </TouchableOpacity>
        </View>

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
  subtitle: { fontSize: fs.md, color: colors.textSecondary, marginTop: sp.xs, marginBottom: sp.xl },
  form: {},
  forgotBtn: { alignSelf: "flex-end", marginTop: sp.xs, marginBottom: sp.sm },
  forgotTxt: { fontSize: fs.sm, color: colors.accent, fontWeight: fw.medium },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: sp.lg },
  footerTxt: { fontSize: fs.md, color: colors.textSecondary },
  footerLink: { fontSize: fs.md, color: colors.accent, fontWeight: fw.semibold },
  errorBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.danger + "10", borderWidth: 1, borderColor: colors.danger + "30", borderRadius: rad.md, padding: sp.md, marginTop: sp.md },
  errorTxt: { fontSize: fs.sm, color: colors.danger, flex: 1, marginRight: sp.sm },
});
