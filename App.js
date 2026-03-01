import { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, LogBox } from "react-native";
import { AuthProvider, useAuth } from "./src/store/authStore";
import { auth } from "./src/services/data";
import MainNav from "./src/navigation/MainNavigator";
import { colors } from "./src/constants/theme";
import { registerForPushNotifications, useNotifications } from "./src/utils/pushNotifications";
import socket from "./src/services/socket";

LogBox.ignoreLogs(["Reanimated", "VirtualizedLists"]);

var navigationRef = createNavigationContainerRef();

var navTheme = {
  dark: true,
  colors: {
    primary: colors.teal,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.border,
    notification: colors.teal,
  },
};

function Root() {
  var { loading, user, ok } = useAuth();

  // ── Connect socket when logged in ──
  useEffect(
    function () {
      if (ok && user) {
        if (!socket.connected) {
          socket.connect();
          console.log("[Socket] Connecting...");
        }
      } else {
        if (socket.connected) {
          socket.disconnect();
        }
      }
    },
    [ok, user],
  );

  // ── Register push token after login ──
  useEffect(
    function () {
      if (ok && user) {
        (async function () {
          var token = await registerForPushNotifications();
          if (token) {
            try {
              await auth.savePushToken(token);
              console.log("[Push] Token saved");
            } catch (e) {
              console.log("[Push] Failed to save token:", e.message);
            }
          }
        })();
      }
    },
    [ok, user],
  );

  // ── Handle notification taps ──
  useNotifications(function (data) {
    if (!data || !data.type || !navigationRef.isReady()) return;

    if (data.type === "message" && data.conversationId) {
      navigationRef.navigate("Messages", {
        screen: "Chat",
        params: { conversationId: data.conversationId },
      });
    } else if (data.type === "like" && data.artworkId) {
      navigationRef.navigate("ArtworkDetail", { id: data.artworkId });
    } else if (data.type === "follow" && data.userId) {
      navigationRef.navigate("ArtistProfile", { id: data.userId });
    } else if (data.type === "event" && data.eventId) {
      navigationRef.navigate("EventDetail", { id: data.eventId });
    } else if (data.type === "commission" && data.commissionId) {
      navigationRef.navigate("CommissionDetail", { id: data.commissionId });
    } else {
      navigationRef.navigate("Notifications");
    }
  });

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator color={colors.teal} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="light" />
      <MainNav />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}