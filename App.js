import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LogBox } from "react-native";
import { AuthProvider, ExploreProvider, FeedProvider } from "./src/store";
import RootNavigator from "./src/navigation/RootNavigator";
import { colors } from "./src/constants/theme";

LogBox.ignoreLogs(["Reanimated", "VirtualizedLists"]);

var navTheme = {
  dark: true,
  colors: {
    primary: colors.accent,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.border,
    notification: colors.danger,
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ExploreProvider>
            <FeedProvider>
              <NavigationContainer>
                <StatusBar style="light" />
                <RootNavigator />
              </NavigationContainer>
            </FeedProvider>
          </ExploreProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
