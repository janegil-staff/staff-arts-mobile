import { useCallback } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../store/authStore";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";

export default function ProfileScreen({ navigation }) {
  var { user, logout, refreshUser } = useAuth();

  // Silently refresh user data on focus — updates store directly
  useFocusEffect(
    useCallback(function () {
      refreshUser();
    }, [])
  );

  var u = user;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ paddingBottom: 100 }}>

      <View style={{ alignItems: "center", paddingVertical: sp.xl, paddingHorizontal: sp.lg }}>
        {u && u.avatar ? (
          <Image source={{ uri: u.avatar }} style={{ width: 88, height: 88, borderRadius: 44, marginBottom: sp.md, borderWidth: 2, borderColor: c.borderLight }} />
        ) : (
          <View style={{ width: 88, height: 88, borderRadius: 44, marginBottom: sp.md, backgroundColor: c.surface, borderWidth: 2, borderColor: c.borderLight, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 32, fontWeight: fw.bold, color: c.teal }}>
              {u && u.displayName ? u.displayName.charAt(0).toUpperCase() : "?"}
            </Text>
          </View>
        )}
        <Text style={{ fontSize: fs.xxl, fontWeight: fw.light, color: c.text }}>
          {u ? u.displayName || "User" : "User"}
        </Text>
        {u && u.username ? (
          <Text style={{ fontSize: fs.sm, color: c.textMuted, marginTop: 2 }}>@{u.username}</Text>
        ) : null}
        {u && u.role ? (
          <View style={{ marginTop: sp.sm, backgroundColor: c.tealBg, borderRadius: rad.sm, paddingHorizontal: 12, paddingVertical: 4 }}>
            <Text style={{ fontSize: fs.xxs, color: c.teal, fontWeight: fw.semi, textTransform: "capitalize" }}>{u.role}</Text>
          </View>
        ) : null}
        {u && u.bio ? (
          <Text style={{ fontSize: fs.sm, color: c.textSecondary, textAlign: "center", marginTop: sp.md, lineHeight: 20, maxWidth: 280 }}>{u.bio}</Text>
        ) : null}
        {u && u.location ? (
          <Text style={{ fontSize: fs.xs, color: c.textMuted, marginTop: sp.sm }}>📍 {u.location}</Text>
        ) : null}
      </View>

      <View style={{ flexDirection: "row", marginHorizontal: sp.lg, backgroundColor: c.surface, borderRadius: rad.lg, paddingVertical: sp.lg, borderWidth: 1, borderColor: c.borderLight }}>
        {[
          ["Followers", u ? u.followerCount || 0 : 0],
          ["Following", u ? u.followingCount || 0 : 0],
          ["Works", u ? u.artworkCount || 0 : 0],
        ].map(function (item, i) {
          return (
            <View key={item[0]} style={{ flex: 1, alignItems: "center", borderRightWidth: i < 2 ? 1 : 0, borderRightColor: c.borderLight }}>
              <Text style={{ fontSize: fs.xl, fontWeight: fw.semi, color: c.text }}>{item[1]}</Text>
              <Text style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 2 }}>{item[0]}</Text>
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        style={{ marginHorizontal: sp.lg, marginTop: sp.md, borderWidth: 1.5, borderColor: c.teal, borderRadius: rad.md, paddingVertical: 14, alignItems: "center" }}
        onPress={function () { navigation.navigate("EditProfile"); }}
      >
        <Text style={{ fontSize: fs.md, color: c.teal, fontWeight: fw.medium }}>Edit Profile</Text>
      </TouchableOpacity>

      <View style={{ marginHorizontal: sp.lg, marginTop: sp.lg, backgroundColor: c.surface, borderRadius: rad.lg, overflow: "hidden", borderWidth: 1, borderColor: c.borderLight }}>
        {[
          ["My Artworks", "Explore"],
          ["Orders", "Orders"],
          ["Commissions", "Commissions"],
          ["Messages", "Messages"],
          ["Settings", "Settings"],
        ].map(function (item, i) {
          return (
            <TouchableOpacity
              key={item[0]}
              style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: sp.lg, borderBottomWidth: i < 4 ? 1 : 0, borderBottomColor: c.borderLight }}
              onPress={function () { navigation.navigate(item[1]); }}
            >
              <Text style={{ fontSize: fs.md, color: c.text }}>{item[0]}</Text>
              <Text style={{ color: c.textMuted }}>→</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={{ marginHorizontal: sp.lg, marginTop: sp.lg, paddingVertical: 14, alignItems: "center" }}
        onPress={logout}
      >
        <Text style={{ fontSize: fs.md, color: c.error, fontWeight: fw.medium }}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
