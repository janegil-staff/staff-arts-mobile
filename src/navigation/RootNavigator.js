import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View, StyleSheet } from "react-native";
import { colors, fs } from "../constants/theme";
import { useAuth } from "../store/authStore";

import HomeScreen from "../screens/home/HomeScreen";
import ExploreScreen from "../screens/explore/ExploreScreen";
import UploadScreen from "../screens/artwork/UploadScreen";
import ArtworkDetailScreen from "../screens/artwork/ArtworkDetailScreen";
import ArtistProfileScreen from "../screens/profile/ArtistProfileScreen";
import ExhibitionsScreen from "../screens/exhibitions/ExhibitionsScreen";
import ExhibitionDetailScreen from "../screens/exhibitions/ExhibitionDetailScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import FeedScreen from "../screens/social/FeedScreen";
import ConversationsScreen from "../screens/messages/ConversationsScreen";
import ChatScreen from "../screens/messages/ChatScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import SearchScreen from "../screens/search/SearchScreen";
import EventsScreen from "../screens/events/EventsScreen";
import EventDetailScreen from "../screens/events/EventDetailScreen";
import MusicScreen from "../screens/music/MusicScreen";
import OrdersScreen from "../screens/orders/OrdersScreen";
import OrderDetailScreen from "../screens/orders/OrderDetailScreen";
import CommissionsScreen from "../screens/commissions/CommissionsScreen";
import CommissionDetailScreen from "../screens/commissions/CommissionDetailScreen";
import WelcomeScreen from "../screens/auth/WelcomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

var Tab = createBottomTabNavigator();
var Stack = createNativeStackNavigator();

var noHeader = { headerShown: false };
var stackOpts = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
};
var tabRootOpts = {
  headerStyle: { backgroundColor: colors.bg },
  headerShadowVisible: false,
  headerTitle: "",
  contentStyle: { backgroundColor: colors.bg },
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={stackOpts}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={tabRootOpts} />
      <Stack.Screen name="ArtworkDetail" component={ArtworkDetailScreen} options={{ title: "" }} />
      <Stack.Screen name="ArtistProfile" component={ArtistProfileScreen} options={{ title: "" }} />
      <Stack.Screen name="Feed" component={FeedScreen} options={tabRootOpts} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={tabRootOpts} />
      <Stack.Screen name="Conversations" component={ConversationsScreen} options={tabRootOpts} />
      <Stack.Screen name="Chat" component={ChatScreen} options={tabRootOpts} />
    </Stack.Navigator>
  );
}

function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={stackOpts}>
      <Stack.Screen name="ExploreMain" component={ExploreScreen} options={tabRootOpts} />
      <Stack.Screen name="ArtworkDetail" component={ArtworkDetailScreen} options={{ title: "" }} />
      <Stack.Screen name="ArtistProfile" component={ArtistProfileScreen} options={{ title: "" }} />
      <Stack.Screen name="Search" component={SearchScreen} options={tabRootOpts} />
    </Stack.Navigator>
  );
}

function ShowsStack() {
  return (
    <Stack.Navigator screenOptions={stackOpts}>
      <Stack.Screen name="ExhibitionsMain" component={ExhibitionsScreen} options={tabRootOpts} />
      <Stack.Screen name="ExhibitionDetail" component={ExhibitionDetailScreen} options={{ title: "" }} />
      <Stack.Screen name="Events" component={EventsScreen} options={tabRootOpts} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: "" }} />
      <Stack.Screen name="ArtworkDetail" component={ArtworkDetailScreen} options={{ title: "" }} />
      <Stack.Screen name="ArtistProfile" component={ArtistProfileScreen} options={{ title: "" }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={stackOpts}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={tabRootOpts} />
      <Stack.Screen name="Login" component={LoginScreen} options={noHeader} />
      <Stack.Screen name="Register" component={RegisterScreen} options={noHeader} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={noHeader} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={tabRootOpts} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={tabRootOpts} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={tabRootOpts} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "" }} />
      <Stack.Screen name="Commissions" component={CommissionsScreen} options={tabRootOpts} />
      <Stack.Screen name="CommissionDetail" component={CommissionDetailScreen} options={{ title: "" }} />
      <Stack.Screen name="Music" component={MusicScreen} options={tabRootOpts} />
      <Stack.Screen name="ArtworkDetail" component={ArtworkDetailScreen} options={{ title: "" }} />
      <Stack.Screen name="ArtistProfile" component={ArtistProfileScreen} options={{ title: "" }} />
    </Stack.Navigator>
  );
}

var tabIcons = {
  Home: ["home", "home-outline"],
  Explore: ["compass", "compass-outline"],
  Upload: ["add", "add"],
  Shows: ["calendar", "calendar-outline"],
  Profile: ["person", "person-outline"],
};

export default function RootNavigator() {
  var auth = useAuth();

  return (
    <Tab.Navigator
      screenOptions={function (opts) {
        var route = opts.route;
        return {
          headerShown: false,
          tabBarStyle: tabStyle,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 10, fontWeight: "500", marginTop: -2 },
          tabBarIcon: function (iconOpts) {
            if (route.name === "Upload") {
              return <View style={s.uploadBtn}><Ionicons name="add" size={24} color={colors.textInverse} /></View>;
            }
            var pair = tabIcons[route.name] || ["help", "help-outline"];
            return <Ionicons name={iconOpts.focused ? pair[0] : pair[1]} size={22} color={iconOpts.color} />;
          },
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Explore" component={ExploreStack} />
      <Tab.Screen
        name="Upload"
        component={UploadScreen}
        options={{ tabBarLabel: function () { return null; } }}
        listeners={function (lo) {
          return {
            tabPress: function (e) {
              if (!auth.isAuthenticated) {
                e.preventDefault();
                lo.navigation.navigate("Profile", { screen: "Login" });
              }
            },
          };
        }}
      />
      <Tab.Screen name="Shows" component={ShowsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

var tabStyle = {
  backgroundColor: colors.bg,
  borderTopColor: colors.border,
  borderTopWidth: 0.5,
  height: Platform.OS === "ios" ? 85 : 65,
  paddingTop: 6,
  paddingBottom: Platform.OS === "ios" ? 28 : 8,
};

var s = StyleSheet.create({
  uploadBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.accent, alignItems: "center", justifyContent: "center",
    marginTop: -12,
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
});
