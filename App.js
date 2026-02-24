import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, LogBox } from "react-native";
import { AuthProvider, useAuth } from "./src/store/authStore";
import AuthNav from "./src/navigation/AuthNavigator";
import MainNav from "./src/navigation/MainNavigator";
import { colors } from "./src/constants/theme";

LogBox.ignoreLogs(["Reanimated", "VirtualizedLists"]);

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
  var { ok, loading } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.teal} size="large" />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {ok ? <MainNav /> : <AuthNav />}
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
