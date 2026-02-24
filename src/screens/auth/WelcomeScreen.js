import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.top}>
        <Text style={s.icon}>◆</Text>
        <Text style={s.brand}>Staff Arts</Text>
        <Text style={s.tagline}>Where creativity{"\n"}finds its home</Text>
      </View>
      <View style={s.bottom}>
        <Text style={s.desc}>A community for artists, collectors, and galleries.</Text>
        <TouchableOpacity style={s.btn} onPress={function () { navigation.navigate("Register"); }}>
          <Text style={s.btnText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.link} onPress={function () { navigation.navigate("Login"); }}>
          <Text style={{ color: c.teal, fontSize: fs.md, fontWeight: fw.semi }}>I have an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

var s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg, justifyContent: "space-between" },
  top: { flex: 1, justifyContent: "center", alignItems: "center" },
  icon: { fontSize: 48, color: c.teal, marginBottom: sp.md },
  brand: { fontSize: fs.hero, fontWeight: fw.light, color: c.text, letterSpacing: 2 },
  tagline: { fontSize: fs.xxl, color: c.textSecondary, textAlign: "center", marginTop: sp.md, lineHeight: 34, fontWeight: fw.light },
  bottom: { paddingHorizontal: sp.lg, marginBottom: sp.lg },
  desc: { fontSize: fs.md, color: c.textMuted, textAlign: "center", lineHeight: 24, marginBottom: sp.xxl },
  btn: { backgroundColor: c.teal, paddingVertical: 20, borderRadius: rad.md, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  btnText: { color: c.textInverse, fontSize: fs.lg, fontWeight: fw.bold, letterSpacing: 0.5 },
  link: { paddingVertical: sp.md, alignItems: "center" },
});
