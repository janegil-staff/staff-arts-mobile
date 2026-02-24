import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fs, sp } from "../../constants/theme";

export default function Divider(props) {
  if (props.text) {
    return (
      <View style={[s.row, props.style]}>
        <View style={s.line} />
        <Text style={s.text}>{props.text}</Text>
        <View style={s.line} />
      </View>
    );
  }
  return <View style={[s.single, props.style]} />;
}

var s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginVertical: sp.md },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  text: { color: colors.textMuted, fontSize: fs.sm, paddingHorizontal: sp.md },
  single: { height: 1, backgroundColor: colors.border, marginVertical: sp.md },
});
