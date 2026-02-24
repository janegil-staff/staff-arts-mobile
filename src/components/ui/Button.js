import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from "react-native";
import { colors, rad, fs, fw, sp } from "../../constants/theme";

var bgMap = {
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  outline: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.accent },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: colors.danger },
  coral: { backgroundColor: colors.coral || colors.accent },
};

var textColorMap = {
  primary: colors.textInverse,
  secondary: colors.text,
  outline: colors.accent,
  ghost: colors.accent,
  danger: "#FFFFFF",
  coral: "#FFFFFF",
};

var padMap = {
  sm: { paddingVertical: sp.sm - 2, paddingHorizontal: sp.md },
  md: { paddingVertical: sp.sm + 2, paddingHorizontal: sp.lg },
  lg: { paddingVertical: sp.md, paddingHorizontal: sp.xl },
};

export default function Button(props) {
  var v = props.variant || "primary";
  var sz = props.size || "md";
  var off = props.disabled || props.loading;
  var tc = textColorMap[v];

  return (
    <TouchableOpacity
      onPress={props.onPress}
      disabled={off}
      activeOpacity={0.7}
      style={[s.base, bgMap[v], padMap[sz], props.fullWidth !== false && s.full, off && s.off, props.style]}
    >
      {props.loading ? (
        <ActivityIndicator size="small" color={tc} />
      ) : (
        <View style={s.inner}>
          {props.iconLeft || null}
          <Text style={[s.text, { color: tc, fontSize: sz === "lg" ? fs.lg : sz === "sm" ? fs.sm : fs.md }, props.iconLeft && { marginLeft: 8 }, props.iconRight && { marginRight: 8 }, props.textStyle]}>
            {props.title}
          </Text>
          {props.iconRight || null}
        </View>
      )}
    </TouchableOpacity>
  );
}

var s = StyleSheet.create({
  base: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: rad.md },
  full: { width: "100%" },
  off: { opacity: 0.5 },
  inner: { flexDirection: "row", alignItems: "center" },
  text: { fontWeight: fw.semibold },
});
