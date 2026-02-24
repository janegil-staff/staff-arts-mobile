import { useState } from "react";
import { Alert } from "react-native";

var Google = null;
var WebBrowser = null;

try { Google = require("expo-auth-session/providers/google"); } catch (e) {}
try { WebBrowser = require("expo-web-browser"); WebBrowser.maybeCompleteAuthSession(); } catch (e) {}

var GOOGLE_CLIENT_ID = {
  expo: "YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com",
  ios: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
  android: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
  web: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
};

export default function useGoogleAuth() {
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState(null);

  // If expo-auth-session is not installed, return a stub
  if (!Google) {
    return {
      signIn: function () {
        Alert.alert(
          "Google Sign-In",
          "Install expo-auth-session and expo-web-browser to enable Google login.\n\nnpx expo install expo-auth-session expo-crypto expo-web-browser"
        );
      },
      loading: false,
      error: null,
      ready: false,
    };
  }

  return {
    signIn: function () {
      Alert.alert(
        "Setup Required",
        "Add your Google OAuth client IDs in src/hooks/useGoogleAuth.js"
      );
    },
    loading: loading,
    error: error,
    ready: true,
  };
}
