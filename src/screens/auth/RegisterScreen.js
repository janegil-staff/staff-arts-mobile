import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../store/authStore";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";

export default function RegisterScreen({ navigation }) {
  var [step, setStep] = useState(1);
  var [role, setRole] = useState("artist");
  var [name, setName] = useState("");
  var [email, setEmail] = useState("");
  var [pass, setPass] = useState("");
  var { register, loading } = useAuth();

  async function onRegister() {
    if (!name || !email || !pass)
      return Alert.alert("Error", "Fill all fields");
    if (pass.length < 8)
      return Alert.alert("Error", "Password must be 8+ characters");
    try {
      await register({
        email: email.trim().toLowerCase(),
        password: pass,
        name: name.trim(),
        displayName: name.trim(),
        role,
      });
    } catch (e) {
      Alert.alert("Failed", e?.message || "Registration failed");
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: sp.lg, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={function () {
              step === 1 ? navigation.goBack() : setStep(1);
            }}
          >
            <Text
              style={{
                color: c.textSecondary,
                fontSize: fs.md,
                marginBottom: sp.xl,
              }}
            >
              ← Back
            </Text>
          </TouchableOpacity>
          <Text style={s.title}>
            {step === 1 ? "I am a..." : "Create account"}
          </Text>

          {step === 1 ? (
            <View style={{ gap: sp.md, marginTop: sp.xl }}>
              {[
                { id: "artist", l: "Artist" },
                { id: "collector", l: "Collector" },
                { id: "gallery", l: "Gallery" },
              ].map(function (r) {
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[s.roleCard, role === r.id && s.roleActive]}
                    onPress={function () {
                      setRole(r.id);
                    }}
                  >
                    <Text
                      style={[s.roleText, role === r.id && { color: c.teal }]}
                    >
                      {r.l}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={s.btn}
                onPress={function () {
                  setStep(2);
                }}
              >
                <Text style={s.btnText}>Continue</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: sp.lg, marginTop: sp.xl }}>
              {[
                ["Name", name, setName, "Your name"],
                ["Email", email, setEmail, "email"],
                ["Password", pass, setPass, "8+ characters"],
              ].map(function (item, i) {
                return (
                  <View key={item[0]} style={{ gap: sp.xs }}>
                    <Text style={s.label}>{item[0]}</Text>
                    <TextInput
                      style={s.input}
                      value={item[1]}
                      onChangeText={item[2]}
                      placeholder={item[3]}
                      placeholderTextColor={c.textMuted}
                      secureTextEntry={i === 2}
                      keyboardType={i === 1 ? "email-address" : "default"}
                      autoCapitalize={i === 1 ? "none" : "sentences"}
                    />
                  </View>
                );
              })}
              <TouchableOpacity style={s.btn} onPress={onRegister}>
                <Text style={s.btnText}>
                  {loading ? "Creating..." : "Create Account"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

var s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  title: {
    fontSize: fs.hero,
    fontWeight: fw.light,
    color: c.text,
    lineHeight: 48,
  },
  roleCard: {
    backgroundColor: c.surface,
    borderWidth: 1.5,
    borderColor: c.border,
    borderRadius: rad.lg,
    padding: sp.lg,
    alignItems: "center",
  },
  roleActive: { borderColor: c.teal, backgroundColor: c.tealBg },
  roleText: { fontSize: fs.lg, fontWeight: fw.semi, color: c.text },
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
});
