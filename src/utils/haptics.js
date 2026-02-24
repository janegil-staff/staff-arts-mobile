import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export var haptics = {
  light: function () { if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); },
  medium: function () { if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); },
  success: function () { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); },
  error: function () { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); },
  selection: function () { Haptics.selectionAsync(); },
};
