import React, { useState } from "react";
import { View, Text, TextInput as RNTextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, rad, fs, sp, fw } from "../../constants/theme";

export default function TextInput(props) {
  var show = useState(false);
  var focused = useState(false);

  return (
    <View style={[s.wrap, props.containerStyle]}>
      {props.label ? <Text style={s.label}>{props.label}</Text> : null}
      <View style={[s.row, focused[0] && s.focused, props.error && s.error]}>
        {props.icon ? <Ionicons name={props.icon} size={18} color={focused[0] ? colors.accent : colors.textMuted} style={s.icon} /> : null}
        <RNTextInput
          style={[s.input, props.multiline && { height: props.height || 80, textAlignVertical: "top" }, props.style]}
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={props.isPassword && !show[0]}
          keyboardType={props.keyboardType}
          autoCapitalize={props.autoCapitalize || "sentences"}
          autoCorrect={props.autoCorrect !== undefined ? props.autoCorrect : true}
          multiline={props.multiline}
          maxLength={props.maxLength}
          onFocus={function () { focused[1](true); if (props.onFocus) props.onFocus(); }}
          onBlur={function () { focused[1](false); if (props.onBlur) props.onBlur(); }}
          returnKeyType={props.returnKeyType}
          onSubmitEditing={props.onSubmitEditing}
          editable={props.editable !== false}
        />
        {props.isPassword ? (
          <TouchableOpacity onPress={function () { show[1](!show[0]); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={show[0] ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
        {props.rightIcon || null}
      </View>
      {props.error ? <Text style={s.errorText}>{props.error}</Text> : null}
      {props.hint ? <Text style={s.hint}>{props.hint}</Text> : null}
    </View>
  );
}

var s = StyleSheet.create({
  wrap: { marginBottom: sp.md },
  label: { color: colors.textSecondary, fontSize: fs.sm, fontWeight: fw.medium, marginBottom: sp.sm - 2 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: rad.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: sp.md },
  focused: { borderColor: colors.accent },
  error: { borderColor: colors.danger },
  icon: { marginRight: sp.sm },
  input: { flex: 1, color: colors.text, fontSize: fs.md, paddingVertical: sp.md - 2 },
  errorText: { color: colors.danger, fontSize: fs.xs, marginTop: sp.xs },
  hint: { color: colors.textMuted, fontSize: fs.xs, marginTop: sp.xs },
});
