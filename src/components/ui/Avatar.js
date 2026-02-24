import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { colors, fw } from "../../constants/theme";

export default function Avatar(props) {
  var size = props.size || 40;
  var borderRadius = size / 2;

  var containerStyle = [
    { width: size, height: size, borderRadius: borderRadius },
    props.bordered && { borderWidth: 2, borderColor: colors.accent },
    props.style,
  ];

  if (props.imageUrl) {
    return (
      <View style={containerStyle}>
        <Image source={{ uri: props.imageUrl }} style={{ width: "100%", height: "100%", borderRadius: borderRadius, backgroundColor: colors.surface }} />
        {props.online ? <View style={[s.online, { borderColor: props.onlineBorderColor || colors.bg }]} /> : null}
      </View>
    );
  }

  var initials = getInitials(props.name);
  return (
    <View style={containerStyle}>
      <View style={[s.fallback, { width: size, height: size, borderRadius: borderRadius }]}>
        <Text style={[s.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
      </View>
      {props.online ? <View style={[s.online, { borderColor: props.onlineBorderColor || colors.bg }]} /> : null}
    </View>
  );
}

function getInitials(name) {
  if (!name) return "?";
  var parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

var s = StyleSheet.create({
  fallback: { backgroundColor: colors.accentMuted, alignItems: "center", justifyContent: "center" },
  initials: { color: colors.accent, fontWeight: fw.semibold },
  online: { position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.success, borderWidth: 2 },
});
