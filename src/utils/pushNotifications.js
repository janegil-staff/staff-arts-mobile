import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

// ── Configure how notifications appear when app is in foreground ──

Notifications.setNotificationHandler({
  handleNotification: async function () {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

// ── Register for push notifications ──

export async function registerForPushNotifications() {
  // Push only works on physical devices
  if (!Device.isDevice) {
    console.log("[Push] Must use physical device for push notifications");
    return null;
  }

  // Check existing permissions
  var { status: existingStatus } = await Notifications.getPermissionsAsync();
  var finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== "granted") {
    var { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("[Push] Permission not granted");
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

// ── Hook for handling notifications in components ──

export function useNotifications(onNotificationTapped) {
  var notificationListener = useRef();
  var responseListener = useRef();
  var [notification, setNotification] = useState(null);

  useEffect(function () {
    // Listen for notifications received while app is open
    notificationListener.current =
      Notifications.addNotificationReceivedListener(function (n) {
        setNotification(n);
      });

    // Listen for when user taps a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(function (response) {
        var data = response.notification.request.content.data;
        if (onNotificationTapped) {
          onNotificationTapped(data);
        }
      });

    return function () {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return notification;
}

// ── Get badge count ──

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
