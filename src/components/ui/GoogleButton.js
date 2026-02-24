import React from "react";
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, rad, fs, fw, sp } from "../../constants/theme";

export default function GoogleButton(props) {
  return (
    <TouchableOpacity onPress={props.onPress} disabled={props.disabled || props.loading} activeOpacity={0.7} style={[s.btn, (props.disabled || props.loading) && s.off]}>
      {props.loading ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <>
          <View style={s.iconWrap}>
            <Ionicons name="logo-google" size={18} color="#FAFAFA" />
          </View>
          <Text style={s.txt}>{props.title || "Continue with Google"}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

var s = StyleSheet.create({
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", width: "100%", paddingVertical: sp.md - 2, paddingHorizontal: sp.lg, borderRadius: rad.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  off: { opacity: 0.5 },
  iconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.elevated, alignItems: "center", justifyContent: "center", marginRight: sp.sm + 2 },
  txt: { color: colors.text, fontSize: fs.md, fontWeight: fw.semibold },
});
