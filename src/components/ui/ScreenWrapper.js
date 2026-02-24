import React from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, sp } from "../../constants/theme";

export default function ScreenWrapper(props) {
  var ins = useSafeAreaInsets();
  var edges = props.edges || [];
  var pt = edges.includes("top") ? ins.top : 0;
  var pb = edges.includes("bottom") ? ins.bottom : 0;
  var padded = props.padded !== false;

  var inner = props.scrollable !== false ? (
    <ScrollView
      contentContainerStyle={[padded && s.pad, { paddingTop: pt, paddingBottom: pb + 90 }, props.contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={props.onRefresh ? (
        <RefreshControl refreshing={props.refreshing || false} onRefresh={props.onRefresh} tintColor={colors.accent} colors={[colors.accent]} progressBackgroundColor={colors.surface} />
      ) : undefined}
    >
      {props.children}
    </ScrollView>
  ) : (
    <View style={[s.flex, padded && s.pad, { paddingTop: pt, paddingBottom: pb }, props.contentStyle]}>
      {props.children}
    </View>
  );

  return (
    <KeyboardAvoidingView style={[s.screen, props.style]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {inner}
    </KeyboardAvoidingView>
  );
}

var s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  pad: { paddingHorizontal: sp.md },
});
