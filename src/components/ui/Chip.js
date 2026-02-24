import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, rad, fs, fw, sp } from "../../constants/theme";

export default function Chip(props) {
  var active = props.active;
  return (
    <TouchableOpacity
      onPress={props.onPress}
      activeOpacity={0.7}
      style={[s.chip, active && s.chipOn, props.size === "sm" && s.chipSm, props.style]}
    >
      {props.icon ? <Ionicons name={props.icon} size={14} color={active ? colors.accent : colors.textSecondary} style={{ marginRight: 4 }} /> : null}
      <Text style={[s.txt, active && s.txtOn, props.size === "sm" && s.txtSm]}>{props.label}</Text>
      {props.onRemove ? (
        <TouchableOpacity onPress={props.onRemove} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }} style={{ marginLeft: 4 }}>
          <Ionicons name="close" size={14} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

var s = StyleSheet.create({
  chip: { flexDirection: "row", alignItems: "center", paddingHorizontal: sp.md, paddingVertical: sp.sm, backgroundColor: colors.surface, borderRadius: rad.full, borderWidth: 1, borderColor: colors.border },
  chipOn: { borderColor: colors.accent, backgroundColor: colors.accentMuted },
  chipSm: { paddingHorizontal: sp.sm + 2, paddingVertical: sp.xs + 1 },
  txt: { fontSize: fs.sm, color: colors.textSecondary },
  txtOn: { color: colors.accent, fontWeight: fw.semibold },
  txtSm: { fontSize: fs.xs },
});
