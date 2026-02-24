import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../store/authStore";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";

export default function LoginScreen({ navigation }) {
  var [email, setEmail] = useState("");
  var [pass, setPass] = useState("");
  var { login, loading } = useAuth();

  async function onLogin() {
    if (!email || !pass) return Alert.alert("Error", "Fill all fields");
    try {
      await login(email.trim().toLowerCase(), pass);
    } catch (e) {
      Alert.alert("Failed", e?.message || "Login failed");
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={s.inner}>
          <TouchableOpacity
            onPress={function () {
              navigation.goBack();
            }}
            style={{ position: "absolute", top: sp.md, left: sp.lg, zIndex: 1 }}
          >
            <Text style={{ color: c.textSecondary, fontSize: fs.md }}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text style={s.title}>Welcome{"\n"}back</Text>
          <Text style={s.sub}>Sign in to your studio</Text>

          <View style={{ gap: sp.lg }}>
            <View style={{ gap: sp.xs }}>
              <Text style={s.label}>Email</Text>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={c.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={{ gap: sp.xs }}>
              <Text style={s.label}>Password</Text>
              <TextInput
                style={s.input}
                value={pass}
                onChangeText={setPass}
                placeholder="Password"
                placeholderTextColor={c.textMuted}
                secureTextEntry
              />
            </View>
            <TouchableOpacity style={s.btn} onPress={onLogin}>
              <Text style={s.btnText}>
                {loading ? "Signing in..." : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={s.footer}>
            <Text style={{ color: c.textMuted, fontSize: fs.sm }}>
              No account?{" "}
            </Text>
            <TouchableOpacity
              onPress={function () {
                navigation.navigate("Register");
              }}
            >
              <Text
                style={{ color: c.teal, fontSize: fs.sm, fontWeight: fw.bold }}
              >
                Join
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

var s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  inner: { flex: 1, paddingHorizontal: sp.lg, justifyContent: "center" },
  title: {
    fontSize: fs.hero,
    fontWeight: fw.light,
    color: c.text,
    lineHeight: 48,
  },
  sub: {
    fontSize: fs.md,
    color: c.textMuted,
    marginTop: sp.sm,
    marginBottom: sp.xl,
  },
  label: { fontSize: fs.sm, color: c.textSecondary, fontWeight: fw.medium },
  input: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: rad.md,
    paddingHorizontal: sp.md,
    paddingVertical: 16,
    fontSize: fs.md,
    color: c.text,
  },
  btn: {
    backgroundColor: c.teal,
    paddingVertical: 20,
    alignItems: "center",
    borderRadius: rad.md,
    marginTop: sp.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnText: {
    color: c.textInverse,
    fontSize: fs.lg,
    fontWeight: fw.bold,
    letterSpacing: 0.5,
  },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: sp.xxl },
});
