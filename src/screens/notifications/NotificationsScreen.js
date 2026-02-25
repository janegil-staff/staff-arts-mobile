import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity as T,
  ActivityIndicator,
} from "react-native";
import { notifs } from "../../services/data";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
import { formatDistanceToNow } from "date-fns";

var ICONS = {
  follow: "👤",
  like: "♥",
  comment: "💬",
  sale: "💰",
  bid: "🔨",
  commission: "🎨",
  event: "📅",
  message: "✉️",
};

export default function NotificationsScreen() {
  var [data, sD] = useState([]);
  var [ld, sL] = useState(true);
  var [uc, sUC] = useState(0);
  useEffect(() => {
    (async () => {
      try {
        var d = await notifs.list();
        sD(d.notifications || []);
        sUC(d.unreadCount || 0);
      } catch {}
      sL(false);
    })();
  }, []);
  var markAll = async () => {
    try {
      await notifs.readAll();
      sD((p) => p.map((n) => ({ ...n, read: true })));
      sUC(0);
    } catch {}
  };
  var markOne = async (id) => {
    try {
      await notifs.read([id]);
      sD((p) => p.map((n) => (n._id === id ? { ...n, read: true } : n)));
      sUC((p) => Math.max(0, p - 1));
    } catch {}
  };
  if (ld)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: c.bg,
        }}
      >
        <ActivityIndicator color={c.teal} />
      </View>
    );
  return (
    <FlatList
      style={{ flex: 1, backgroundColor: c.bg }}
      data={data}
      keyExtractor={(i) => i._id}
      contentContainerStyle={{ paddingBottom: 100 }}
      ListHeaderComponent={
        uc > 0 ? (
          <T
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: sp.lg,
              paddingVertical: sp.md,
            }}
            onPress={markAll}
          >
            <Text style={{ fontSize: fs.sm, color: c.textMuted }}>
              {uc} unread
            </Text>
            <Text
              style={{ fontSize: fs.sm, color: c.teal, fontWeight: fw.semi }}
            >
              Mark all read
            </Text>
          </T>
        ) : null
      }
      ListEmptyComponent={
        <View style={{ alignItems: "center", marginTop: 60 }}>
          <Text style={{ fontSize: 40, marginBottom: sp.md }}>🔔</Text>
          <Text style={{ fontSize: fs.lg, color: c.textSecondary }}>
            No notifications
          </Text>
        </View>
      }
      renderItem={({ item: i }) => (
        <T
          style={{
            flexDirection: "row",
            gap: sp.md,
            paddingHorizontal: sp.lg,
            paddingVertical: sp.md,
            backgroundColor: i.read ? c.bg : c.tealBg,
            borderBottomWidth: 1,
            borderBottomColor: c.borderLight,
          }}
          onPress={() => !i.read && markOne(i._id)}
        >
          <Text style={{ fontSize: 20 }}>{ICONS[i.type] || "●"}</Text>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: fs.md,
                fontWeight: i.read ? fw.regular : fw.semi,
                color: c.text,
              }}
            >
              {i.title}
            </Text>
            {i.body && (
              <Text
                style={{
                  fontSize: fs.sm,
                  color: c.textSecondary,
                  marginTop: 2,
                }}
                numberOfLines={2}
              >
                {i.body}
              </Text>
            )}
            {i.createdAt && (
              <Text
                style={{
                  fontSize: fs.xs,
                  color: c.textMuted,
                  marginTop: sp.xs,
                }}
              >
                {formatDistanceToNow(new Date(i.createdAt), {
                  addSuffix: true,
                })}
              </Text>
            )}
          </View>
          {!i.read && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: c.teal,
                marginTop: 6,
              }}
            />
          )}
        </T>
      )}
    />
  );
}
