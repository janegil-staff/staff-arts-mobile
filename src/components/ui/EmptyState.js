import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "./Button";
import { colors, fs, fw, sp } from "../../constants/theme";

export default function EmptyState(props) {
  return (
    <View style={[s.wrap, props.style]}>
      {props.icon ? <Ionicons name={props.icon} size={56} color={colors.textMuted} /> : null}
      {props.emoji ? <Text style={s.emoji}>{props.emoji}</Text> : null}
      <Text style={s.title}>{props.title || "Nothing here yet"}</Text>
      {props.subtitle ? <Text style={s.sub}>{props.subtitle}</Text> : null}
      {props.actionTitle ? (
        <Button title={props.actionTitle} onPress={props.onAction} variant={props.actionVariant || "outline"} size="sm" style={{ marginTop: sp.md }} fullWidth={false} />
      ) : null}
    </View>
  );
}

var s = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", paddingVertical: sp.xxxl || 64, paddingHorizontal: sp.xl },
  emoji: { fontSize: 56, marginBottom: sp.md },
  title: { fontSize: fs.lg, fontWeight: fw.semibold, color: colors.text, marginTop: sp.md, textAlign: "center" },
  sub: { fontSize: fs.md, color: colors.textMuted, marginTop: sp.sm, textAlign: "center", lineHeight: 22 },
});
