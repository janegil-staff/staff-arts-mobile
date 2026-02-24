import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { colors, fs, sp } from "../../constants/theme";

export default function Loading(props) {
  return (
    <View style={props.fullScreen ? s.full : s.inline}>
      <ActivityIndicator size={props.size || "large"} color={props.color || colors.accent} />
      {props.message ? <Text style={s.msg}>{props.message}</Text> : null}
    </View>
  );
}

var s = StyleSheet.create({
  full: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  inline: { padding: sp.xl, alignItems: "center" },
  msg: { color: colors.textSecondary, fontSize: fs.md, marginTop: sp.md },
});
