import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fs, fw, sp } from "../../constants/theme";

export default function Header(props) {
  return (
    <View style={[s.header, props.style]}>
      <View style={s.left}>
        {props.onBack ? (
          <TouchableOpacity onPress={props.onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={s.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : null}
        {props.title ? <Text style={[s.title, props.large && s.titleLg]}>{props.title}</Text> : null}
        {props.subtitle ? <Text style={s.subtitle}>{props.subtitle}</Text> : null}
      </View>
      <View style={s.right}>
        {props.rightActions || null}
      </View>
    </View>
  );
}

var s = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: sp.md, paddingVertical: sp.md },
  left: { flex: 1 },
  right: { flexDirection: "row", alignItems: "center", gap: sp.sm },
  backBtn: { marginBottom: sp.xs },
  title: { fontSize: fs.xxl, fontWeight: fw.bold, color: colors.text },
  titleLg: { fontSize: fs.xxxl },
  subtitle: { fontSize: fs.sm, color: colors.textMuted, marginTop: 2 },
});
