import {
  View,
  Text,
  TouchableOpacity as T,
  Image,
  ScrollView,
} from "react-native";
import { useAuth } from "../../store/authStore";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
export default function ProfileScreen({ navigation: n }) {
  var { user, logout } = useAuth();
  console.log(user);
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View
        style={{
          alignItems: "center",
          paddingVertical: sp.xl,
          paddingHorizontal: sp.lg,
        }}
      >
        {user?.avatar ? (
          <Image
            source={{ uri: user.avatar }}
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              marginBottom: sp.md,
              borderWidth: 2,
              borderColor: c.borderLight,
            }}
          />
        ) : (
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              marginBottom: sp.md,
              backgroundColor: c.surfaceDim,
              borderWidth: 2,
              borderColor: c.borderLight,
            }}
          />
        )}
        <Text style={{ fontSize: fs.xxl, fontWeight: fw.light, color: c.text }}>
          {user?.displayName || "User"}
        </Text>
        {user?.name && (
          <Text style={{ fontSize: fs.sm, color: c.textMuted, marginTop: 2 }}>
            @{user.name}
          </Text>
        )}
        {user?.role && (
          <View
            style={{
              marginTop: sp.sm,
              backgroundColor: c.tealBg,
              borderRadius: rad.sm,
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{
                fontSize: fs.xxs,
                color: c.teal,
                fontWeight: fw.semi,
                textTransform: "capitalize",
              }}
            >
              {user.role}
            </Text>
          </View>
        )}
        {user?.bio && (
          <Text
            style={{
              fontSize: fs.sm,
              color: c.textSecondary,
              textAlign: "center",
              marginTop: sp.md,
              lineHeight: 20,
              maxWidth: 280,
            }}
          >
            {user.bio}
          </Text>
        )}
        {user?.location && (
          <Text
            style={{ fontSize: fs.xs, color: c.textMuted, marginTop: sp.sm }}
          >
            📍 {user.location}
          </Text>
        )}
      </View>
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: sp.lg,
          backgroundColor: c.surface,
          borderRadius: rad.lg,
          paddingVertical: sp.lg,
          borderWidth: 1,
          borderColor: c.borderLight,
        }}
      >
        {[
          ["Followers", user?.followerCount || 0],
          ["Following", user?.followingCount || 0],
          ["Works", user?.artworkCount || 0],
        ].map(([l, v], i) => (
          <View
            key={l}
            style={{
              flex: 1,
              alignItems: "center",
              borderRightWidth: i < 2 ? 1 : 0,
              borderRightColor: c.borderLight,
            }}
          >
            <Text
              style={{ fontSize: fs.xl, fontWeight: fw.semi, color: c.text }}
            >
              {v}
            </Text>
            <Text style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 2 }}>
              {l}
            </Text>
          </View>
        ))}
      </View>
      <T
        style={{
          marginHorizontal: sp.lg,
          marginTop: sp.md,
          borderWidth: 1.5,
          borderColor: c.teal,
          borderRadius: rad.md,
          paddingVertical: 14,
          alignItems: "center",
        }}
        onPress={() => n.navigate("EditProfile")}
      >
        <Text style={{ fontSize: fs.md, color: c.teal, fontWeight: fw.medium }}>
          Edit Profile
        </Text>
      </T>
      <View
        style={{
          marginHorizontal: sp.lg,
          marginTop: sp.lg,
          backgroundColor: c.surface,
          borderRadius: rad.lg,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: c.borderLight,
        }}
      >
        {[
          ["My Artworks", "Explore"],
          ["Orders", "Orders"],
          ["Commissions", "Commissions"],
          ["Messages", "Messages"],
          ["Settings", "Settings"],
        ].map(([l, scr], i) => (
          <T
            key={l}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: sp.lg,
              borderBottomWidth: i < 4 ? 1 : 0,
              borderBottomColor: c.borderLight,
            }}
            onPress={() => n.getParent()?.navigate(scr)}
          >
            <Text style={{ fontSize: fs.md, color: c.text }}>{l}</Text>
            <Text style={{ color: c.textMuted }}>→</Text>
          </T>
        ))}
      </View>
      <T
        style={{
          marginHorizontal: sp.lg,
          marginTop: sp.lg,
          paddingVertical: 14,
          alignItems: "center",
        }}
        onPress={logout}
      >
        <Text
          style={{ fontSize: fs.md, color: c.error, fontWeight: fw.medium }}
        >
          Sign Out
        </Text>
      </T>
    </ScrollView>
  );
}
