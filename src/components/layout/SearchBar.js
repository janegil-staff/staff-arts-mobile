import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, rad, fs, sp } from "../../constants/theme";

export default function SearchBar(props) {
  var focused = useState(false);
  return (
    <View style={[s.wrap, focused[0] && s.focused, props.style]}>
      <Ionicons name="search" size={18} color={focused[0] ? colors.accent : colors.textMuted} />
      <TextInput
        style={s.input}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder || "Search..."}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        onSubmitEditing={props.onSubmit}
        onFocus={function () { focused[1](true); if (props.onFocus) props.onFocus(); }}
        onBlur={function () { focused[1](false); if (props.onBlur) props.onBlur(); }}
      />
      {props.value && props.value.length > 0 ? (
        <TouchableOpacity onPress={function () { props.onChangeText(""); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}
      {props.onFilter ? (
        <TouchableOpacity onPress={props.onFilter} style={s.filterBtn}>
          <Ionicons name="options-outline" size={18} color={colors.accent} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

var s = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: rad.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: sp.md, gap: sp.sm },
  focused: { borderColor: colors.accent },
  input: { flex: 1, color: colors.text, fontSize: fs.md, paddingVertical: sp.sm + 2 },
  filterBtn: { marginLeft: sp.xs, padding: sp.xs },
});
