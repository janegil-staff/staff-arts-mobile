import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/ui";
import { colors, sp, fs, fw, shadows } from "../../constants/theme";

export default function WelcomeScreen(props) {
  var nav = props.navigation;
  var ins = useSafeAreaInsets();

  return (
    <View style={[s.c, { paddingTop: ins.top, paddingBottom: ins.bottom + sp.lg }]}>
      <TouchableOpacity style={s.closeBtn} onPress={function () { nav.goBack(); }}>
        <Ionicons name="close" size={24} color={colors.textMuted} />
      </TouchableOpacity>

      <View style={s.hero}>
        <Image source={require("../../../assets/staff-arts-logo.png")} style={s.logo} resizeMode="contain" />
        <Text style={s.title}>Staff Arts</Text>
        <Text style={s.tagline}>Where artists connect, create, and collect.</Text>
      </View>

      <View style={s.features}>
        <View style={s.featureRow}><Text style={s.featureIcon}>🎨</Text><Text style={s.featureTxt}>Showcase your portfolio</Text></View>
        <View style={s.featureRow}><Text style={s.featureIcon}>🛒</Text><Text style={s.featureTxt}>Buy and sell original artwork</Text></View>
        <View style={s.featureRow}><Text style={s.featureIcon}>🤝</Text><Text style={s.featureTxt}>Connect with artists and collectors</Text></View>
      </View>

      <View style={s.actions}>
        <Button title="Get Started" onPress={function () { nav.navigate("Register"); }} size="lg" style={shadows.md} />
        <Button title="I already have an account" variant="ghost" onPress={function () { nav.navigate("Login"); }} size="md" />
        <TouchableOpacity style={s.skipBtn} onPress={function () { nav.goBack(); }}>
          <Text style={s.skipTxt}>Just browsing</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

var s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: sp.lg },
  closeBtn: { alignSelf: "flex-end", padding: sp.sm, marginTop: sp.xs },
  hero: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 80, height: 80, marginBottom: sp.md },
  title: { fontSize: fs.hero, fontWeight: fw.bold, color: colors.text, letterSpacing: -0.5 },
  tagline: { fontSize: fs.lg, color: colors.textSecondary, marginTop: sp.sm, textAlign: "center", lineHeight: 24, maxWidth: 280 },
  features: { paddingVertical: sp.lg, gap: sp.md },
  featureRow: { flexDirection: "row", alignItems: "center", gap: sp.md },
  featureIcon: { fontSize: 22 },
  featureTxt: { fontSize: fs.md, color: colors.textSecondary },
  actions: { gap: sp.sm, paddingTop: sp.md },
  skipBtn: { alignItems: "center", paddingVertical: sp.sm },
  skipTxt: { fontSize: fs.sm, color: colors.textMuted },
});
