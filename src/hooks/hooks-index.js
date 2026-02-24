import { useState, useEffect, useCallback } from "react";
import { Keyboard, Platform } from "react-native";

// Safe Google auth — returns no-op if expo-auth-session is missing
export function useGoogleAuth() {
  var authSession = null;
  var WebBrowser = null;
  try {
    WebBrowser = require("expo-web-browser");
    authSession = require("expo-auth-session");
    WebBrowser.maybeCompleteAuthSession();
  } catch (e) {}

  if (!authSession || !authSession.useAuthRequest) {
    return { request: null, promptAsync: function () {}, isReady: false };
  }

  var clientId = Platform.select({
    ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    default: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  var discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
  };

  var redirectUri = authSession.makeRedirectUri({ scheme: "staffarts" });

  var result = authSession.useAuthRequest(
    { clientId: clientId, responseType: authSession.ResponseType.Token, scopes: ["openid", "profile", "email"], redirectUri: redirectUri },
    discovery
  );

  return { request: result[0], promptAsync: result[2], isReady: !!result[0] };
}

export function useRefresh(fn) {
  var ref = useState(false);

  var onRefresh = useCallback(function () {
    ref[1](true);
    var result;
    try { result = fn(); } catch (e) { ref[1](false); return; }
    if (result && typeof result.then === "function") {
      result.then(function () { ref[1](false); }).catch(function () { ref[1](false); });
    } else {
      ref[1](false);
    }
  }, [fn]);

  return { refreshing: ref[0], onRefresh: onRefresh };
}

export function useDebounce(value, delay) {
  var d = useState(value);
  useEffect(function () {
    var t = setTimeout(function () { d[1](value); }, delay || 300);
    return function () { clearTimeout(t); };
  }, [value, delay]);
  return d[0];
}

export function useKeyboard() {
  var v = useState(false);
  var h = useState(0);
  useEffect(function () {
    var show = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    var hide = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    var s1 = Keyboard.addListener(show, function (e) { v[1](true); h[1](e.endCoordinates.height); });
    var s2 = Keyboard.addListener(hide, function () { v[1](false); h[1](0); });
    return function () { s1.remove(); s2.remove(); };
  }, []);
  return { visible: v[0], height: h[0], dismiss: Keyboard.dismiss };
}
