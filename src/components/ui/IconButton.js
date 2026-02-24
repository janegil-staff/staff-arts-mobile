import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, rad } from "../../constants/theme";

export default function IconButton(props) {
  var size = props.size || 40;
  var iconSize = props.iconSize || size * 0.5;
  return (
    <TouchableOpacity
      onPress={props.onPress}
      disabled={props.disabled}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        s.base,
        { width: size, height: size, borderRadius: size / 2 },
        props.variant === "filled" && { backgroundColor: colors.surface },
        props.variant === "accent" && { backgroundColor: colors.accentMuted },
        props.variant === "overlay" && { backgroundColor: "rgba(0,0,0,0.5)" },
        props.disabled && { opacity: 0.4 },
        props.style,
      ]}
    >
      <Ionicons name={props.icon} size={iconSize} color={props.color || colors.text} />
    </TouchableOpacity>
  );
}

var s = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center" },
});
