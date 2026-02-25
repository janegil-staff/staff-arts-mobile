import {
  View,
  Text,
  TouchableOpacity as T,
  ScrollView,
  Alert,
} from "react-native";
import { useAuth } from "../../store/authStore";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
export default function Settings({ navigation: n }) {
  var { logout } = useAuth();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View
        style={{
          margin: sp.lg,
          backgroundColor: c.surface,
          borderRadius: rad.lg,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: c.borderLight,
        }}
      >
        {[
          ["Account", "Account settings"],
          ["Notifications", "Push notification preferences"],
          ["Privacy", "Privacy and visibility"],
          ["Payment", "Payment methods"],
          ["Help & Support", "FAQ and contact"],
        ].map(([t, d], i) => (
          <T
            key={t}
            style={{
              padding: sp.lg,
              borderBottomWidth: i < 4 ? 1 : 0,
              borderBottomColor: c.borderLight,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: fs.md,
                    color: c.text,
                    fontWeight: fw.medium,
                  }}
                >
                  {t}
                </Text>
                <Text
                  style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 2 }}
                >
                  {d}
                </Text>
              </View>
              <Text style={{ color: c.textMuted }}>→</Text>
            </View>
          </T>
        ))}
      </View>
      <View
        style={{
          margin: sp.lg,
          marginTop: 0,
          backgroundColor: c.surface,
          borderRadius: rad.lg,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: c.borderLight,
        }}
      >
        <T
          style={{ padding: sp.lg }}
          onPress={() => {
            Alert.alert(
              "About",
              "Staff Arts v1.0.0\nA community for visual artists.",
            );
          }}
        >
          <Text style={{ fontSize: fs.md, color: c.text }}>About</Text>
        </T>
        <T
          style={{
            padding: sp.lg,
            borderTopWidth: 1,
            borderTopColor: c.borderLight,
          }}
        >
          <Text style={{ fontSize: fs.md, color: c.text }}>
            Terms of Service
          </Text>
        </T>
        <T
          style={{
            padding: sp.lg,
            borderTopWidth: 1,
            borderTopColor: c.borderLight,
          }}
        >
          <Text style={{ fontSize: fs.md, color: c.text }}>Privacy Policy</Text>
        </T>
      </View>
      <T
        style={{
          marginHorizontal: sp.lg,
          marginTop: sp.md,
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
