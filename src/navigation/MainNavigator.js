import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, Platform, Alert } from "react-native";
import { colors as c, fs, fw, sp } from "../constants/theme";
import { useAuth } from "../store/authStore";

import HomeScreen from "../screens/home/HomeScreen";
import ExploreScreen from "../screens/explore/ExploreScreen";
import UploadScreen from "../screens/artwork/UploadScreen";
import ArtworkDetailScreen from "../screens/artwork/ArtworkDetailScreen";
import ArtistProfileScreen from "../screens/profile/ArtistProfileScreen";
import EventsScreen from "../screens/events/EventsScreen";
import EventDetailScreen from "../screens/events/EventDetailScreen";
import ExhibitionsScreen from "../screens/exhibitions/ExhibitionsScreen";
import ExhibitionDetailScreen from "../screens/exhibitions/ExhibitionDetailScreen";
import FeedScreen from "../screens/social/FeedScreen";
import ConversationsScreen from "../screens/messages/ConversationsScreen";
import ChatScreen from "../screens/messages/ChatScreen";
import MusicScreen from "../screens/music/MusicScreen";
import OrdersScreen from "../screens/orders/OrdersScreen";
import OrderDetailScreen from "../screens/orders/OrderDetailScreen";
import CommissionsScreen from "../screens/commissions/CommissionsScreen";
import CommissionDetailScreen from "../screens/commissions/CommissionDetailScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import SearchScreen from "../screens/search/SearchScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

var Tab = createBottomTabNavigator();

var so = {
  headerStyle: { backgroundColor: c.bg },
  headerTintColor: c.text,
  headerTitleStyle: { fontWeight: fw.semi, fontSize: fs.md },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: c.bg },
};

function TabIcon({ label, icon, focused }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: 70, paddingTop: 8 }}>
      <Text style={{ fontSize: 22, color: focused ? c.teal : c.textMuted, marginBottom: 4 }}>{icon}</Text>
      <Text style={{ fontSize: 11, color: focused ? c.teal : c.textMuted, fontWeight: focused ? fw.bold : fw.medium, letterSpacing: 0.3 }}>{label}</Text>
      {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: c.teal, marginTop: 4 }} />}
    </View>
  );
}

function S() { return createNativeStackNavigator(); }

// ── PUBLIC STACKS (no auth needed) ──

var HS = S();
function HomeNav() {
  return (
    <HS.Navigator screenOptions={so}>
      <HS.Screen name="HomeScreen" component={HomeScreen} options={{
        headerTitle: function () {
          return <Text style={{ fontSize: fs.lg, fontWeight: fw.light, color: c.text, letterSpacing: 1 }}>STAFF <Text style={{ color: c.teal, fontStyle: "italic" }}>Arts</Text></Text>;
        },
      }} />
      <HS.Screen name="ArtworkDetail" component={ArtworkDetailScreen} options={{ title: "" }} />
      <HS.Screen name="ArtistProfile" component={ArtistProfileScreen} options={{ title: "" }} />
    </HS.Navigator>
  );
}

var ES = S();
function ExploreNav() {
  return (
    <ES.Navigator screenOptions={so}>
      <ES.Screen name="ExploreScreen" component={ExploreScreen} options={{ title: "Explore" }} />
      <ES.Screen name="ArtworkDetail" component={ArtworkDetailScreen} options={{ title: "" }} />
      <ES.Screen name="ArtistProfile" component={ArtistProfileScreen} options={{ title: "" }} />
      <ES.Screen name="Search" component={SearchScreen} options={{ title: "Search" }} />
    </ES.Navigator>
  );
}

var CS = S();
function ShowsNav() {
  return (
    <CS.Navigator screenOptions={so}>
      <CS.Screen name="FeedScreen" component={FeedScreen} options={{ title: "Community" }} />
      <CS.Screen name="ArtistProfile" component={ArtistProfileScreen} options={{ title: "" }} />
      <CS.Screen name="ArtworkDetail" component={ArtworkDetailScreen} options={{ title: "" }} />
      <CS.Screen name="Events" component={EventsScreen} options={{ title: "Events" }} />
      <CS.Screen name="EventDetail" component={EventDetailScreen} options={{ title: "" }} />
      <CS.Screen name="Exhibitions" component={ExhibitionsScreen} options={{ title: "Exhibitions" }} />
      <CS.Screen name="ExhibitionDetail" component={ExhibitionDetailScreen} options={{ title: "" }} />
      <CS.Screen name="Music" component={MusicScreen} options={{ title: "Music" }} />
    </CS.Navigator>
  );
}

// ── PROFILE STACK (has login/register screens inside) ──

var PS = S();
function ProfileNav() {
  var { ok } = useAuth();
  return (
    <PS.Navigator screenOptions={so}>
      {ok ? (
        <>
          <PS.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: "Profile" }} />
          <PS.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Edit Profile" }} />
          <PS.Screen name="Orders" component={OrdersScreen} options={{ title: "Orders" }} />
          <PS.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Order" }} />
          <PS.Screen name="Commissions" component={CommissionsScreen} options={{ title: "Commissions" }} />
          <PS.Screen name="CommissionDetail" component={CommissionDetailScreen} options={{ title: "Commission" }} />
          <PS.Screen name="Messages" component={ConversationsScreen} options={{ title: "Messages" }} />
          <PS.Screen name="Chat" component={ChatScreen} options={function ({ route }) { return { title: route.params?.name || "Chat" }; }} />
          <PS.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Notifications" }} />
          <PS.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
        </>
      ) : (
        <>
          <PS.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <PS.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      )}
    </PS.Navigator>
  );
}

// ── TAB NAVIGATOR ──

export default function MainNav() {
  var { ok } = useAuth();

  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: c.surface,
        borderTopColor: c.borderLight,
        borderTopWidth: 1,
        height: Platform.OS === "ios" ? 94 : 72,
        paddingBottom: Platform.OS === "ios" ? 28 : 10,
        paddingTop: 4,
        elevation: 0,
      },
      tabBarShowLabel: false,
    }}>
      <Tab.Screen name="Home" component={HomeNav} options={{ tabBarIcon: function ({ focused }) { return <TabIcon label="Home" icon="🏠" focused={focused} />; } }} />
      <Tab.Screen name="Explore" component={ExploreNav} options={{ tabBarIcon: function ({ focused }) { return <TabIcon label="Explore" icon="🔍" focused={focused} />; } }} />
      <Tab.Screen
        name="Upload"
        component={UploadScreen}
        listeners={function (props) {
          return {
            tabPress: function (e) {
              if (!ok) {
                e.preventDefault();
                props.navigation.navigate("Profile");
              }
            },
          };
        }}
        options={{
          tabBarIcon: function () {
            return (
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.teal, alignItems: "center", justifyContent: "center", marginTop: -18, shadowColor: c.teal, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 }}>
                <Text style={{ fontSize: 28, color: c.textInverse, fontWeight: "700", marginTop: -2 }}>+</Text>
              </View>
            );
          },
        }}
      />
      <Tab.Screen name="Shows" component={ShowsNav} options={{ tabBarIcon: function ({ focused }) { return <TabIcon label="Shows" icon="🎭" focused={focused} />; } }} />
      <Tab.Screen name="Profile" component={ProfileNav} options={{ tabBarIcon: function ({ focused }) { return <TabIcon label="Profile" icon="👤" focused={focused} />; } }} />
    </Tab.Navigator>
  );
}
