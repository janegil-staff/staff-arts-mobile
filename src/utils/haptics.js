import { Platform } from "react-native";

// Lightweight haptics - works without expo-haptics installed
// If you install expo-haptics, replace with real implementation
var haptics = {
  light: function () {
    // Placeholder - install expo-haptics for real haptics
    // import * as Haptics from 'expo-haptics';
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  medium: function () {},
  heavy: function () {},
  success: function () {},
  warning: function () {},
  error: function () {},
  selection: function () {},
};

export default haptics;
