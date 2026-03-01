
import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

// ── Show notifications even when app is open ──

Notifications.setNotificationHandler({
  handleNotification: async function () {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

// ── Ask permission and get the push token ──
//
// Call this after login. Returns the token string or null.
// Send the returned token to your backend via auth.savePushToken(token)

export async function registerForPushNotifications() {
  // Push only works on real phones, not simulators
  if (!Device.isDevice) {
    console.log("[Push] Must use physical device");
    return null;
  }

  // Check if we already have permission
  var { status: existingStatus } = await Notifications.getPermissionsAsync();
  var finalStatus = existingStatus;

  // If not, ask the user
  if (existingStatus !== "granted") {
    var { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("[Push] Permission denied");
    return null;
  }

  // Android needs a notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2dd4a0",
    });
  }

  // Get the Expo push token
  try {
    var projectId = Constants.expoConfig?.extra?.eas?.projectId;
    var tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });
    console.log("[Push] Token:", tokenData.data);
    return tokenData.data;
  } catch (e) {
    console.log("[Push] Token error:", e.message);
    return null;
  }
}

// ── Hook: handle notification taps ──
//
// Use in your root component. Pass a callback that receives
// the notification's data payload (which includes `type`, `artworkId`, etc.)
//
// Example:
//   useNotifications(function (data) {
//     if (data.type === "message") navigate to chat
//     if (data.type === "like") navigate to artwork
//   });

export function useNotifications(onNotificationTapped) {
  var notificationListener = useRef();
  var responseListener = useRef();
  var [notification, setNotification] = useState(null);

  useEffect(function () {
    // When a notification arrives while app is open
    notificationListener.current =
      Notifications.addNotificationReceivedListener(function (n) {
        setNotification(n);
      });

    // When user taps a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        function (response) {
          var data = response.notification.request.content.data;
          if (onNotificationTapped) {
            onNotificationTapped(data);
          }
        },
      );

    return function () {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return notification;
}

// ── Badge helpers ──

export async function setBadgeCount(count) {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch {}
}

export async function clearBadge() {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch {}
}
