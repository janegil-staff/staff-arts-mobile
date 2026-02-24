import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, rad, fs, fw, sp } from "../../constants/theme";

export default function Badge(props) {
  var type = props.type || "default";
  var bg = typeStyles[type] || typeStyles.default;

  if (props.count !== undefined) {
    if (props.count <= 0) return null;
    return (
      <View style={[s.count, bg, props.style]}>
        <Text style={s.countTxt}>{props.count > 99 ? "99+" : props.count}</Text>
      </View>
    );
  }

  return (
    <View style={[s.label, bg, props.style]}>
      {props.icon ? <Ionicons name={props.icon} size={12} color={bg.color || colors.text} style={{ marginRight: 4 }} /> : null}
      <Text style={[s.labelTxt, { color: bg.color || colors.text }]}>{props.text}</Text>
    </View>
  );
}

var typeStyles = {
  default: { backgroundColor: colors.accentMuted, color: colors.accent },
  live: { backgroundColor: colors.danger, color: "#FFFFFF" },
  sold: { backgroundColor: colors.danger, color: "#FFFFFF" },
  verified: { backgroundColor: colors.gold ? colors.gold + "1A" : colors.accentMuted, color: colors.gold || colors.accent },
  new: { backgroundColor: colors.success + "1A", color: colors.success },
  premium: { backgroundColor: colors.gold ? colors.gold + "1A" : colors.accentMuted, color: colors.gold || colors.accent },
};

var s = StyleSheet.create({
  count: { minWidth: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  countTxt: { fontSize: fs.xs - 1, fontWeight: fw.bold, color: "#FFFFFF" },
  label: { flexDirection: "row", alignItems: "center", paddingHorizontal: sp.sm, paddingVertical: 3, borderRadius: rad.full },
  labelTxt: { fontSize: fs.xs, fontWeight: fw.semibold },
});
