import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity as T,
  Image,
  ActivityIndicator,
} from "react-native";
import { msgs } from "../../services/data";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../../store/authStore";
export default function Conversations({ navigation: n }) {
  var [data, sD] = useState([]);
  var [ld, sL] = useState(true);
  var { user } = useAuth();
  useEffect(() => {
    (async () => {
      try {
        sD(await msgs.convos());
      } catch {}
      sL(false);
    })();
  }, []);
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
      ListEmptyComponent={
        <View style={{ alignItems: "center", marginTop: 60 }}>
          <Text style={{ fontSize: fs.lg, color: c.textSecondary }}>
            No conversations
          </Text>
          <Text
            style={{ fontSize: fs.sm, color: c.textMuted, marginTop: sp.sm }}
          >
            Message an artist to start
          </Text>
        </View>
      }
      renderItem={({ item: i }) => {
        var other = i.participants?.find((p) => p._id !== user?._id);
        return (
          <T
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: sp.md,
              padding: sp.lg,
              borderBottomWidth: 1,
              borderBottomColor: c.borderLight,
            }}
            onPress={() =>
              n.navigate("Chat", {
                conversationId: i._id,
                name: other?.displayName || "Chat",
              })
            }
          >
            {other?.avatar ? (
              <Image
                source={{ uri: other.avatar }}
                style={{ width: 48, height: 48, borderRadius: 24 }}
              />
            ) : (
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: c.surfaceDim,
                }}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: fs.md, fontWeight: fw.semi, color: c.text }}
              >
                {other?.displayName || "Unknown"}
              </Text>
              {i.lastMessage?.text && (
                <Text
                  style={{ fontSize: fs.sm, color: c.textMuted, marginTop: 2 }}
                  numberOfLines={1}
                >
                  {i.lastMessage.text}
                </Text>
              )}
              {i.lastMessage?.timestamp && (
                <Text
                  style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 2 }}
                >
                  {formatDistanceToNow(new Date(i.lastMessage.timestamp), {
                    addSuffix: true,
                  })}
                </Text>
              )}
            </View>
          </T>
        );
      }}
    />
  );
}
