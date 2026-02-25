import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity as T,
  Image,
  ActivityIndicator,
} from "react-native";
import { music } from "../../services/data";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
export default function MusicScreen({ navigation: n }) {
  var [data, sD] = useState([]);
  var [ld, sL] = useState(true);
  var [playing, sP] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        var d = await music.list({});
        sD(d.tracks || []);
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
      ListHeaderComponent={
        <Text
          style={{
            fontSize: fs.xxs,
            letterSpacing: 2,
            color: c.textMuted,
            fontWeight: fw.semi,
            paddingHorizontal: sp.lg,
            paddingTop: sp.md,
            paddingBottom: sp.md,
          }}
        >
          TRACKS
        </Text>
      }
      ListEmptyComponent={
        <View style={{ alignItems: "center", marginTop: 60 }}>
          <Text style={{ fontSize: 40, marginBottom: sp.md }}>♪</Text>
          <Text style={{ fontSize: fs.lg, color: c.textSecondary }}>
            No music yet
          </Text>
        </View>
      }
      renderItem={({ item: i }) => (
        <T
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: sp.md,
            paddingHorizontal: sp.lg,
            paddingVertical: sp.md,
            borderBottomWidth: 1,
            borderBottomColor: c.borderLight,
          }}
          onPress={async () => {
            sP(i._id);
            try {
              await music.get(i._id);
            } catch {}
          }}
          activeOpacity={0.7}
        >
          {i.coverImage ? (
            <Image
              source={{ uri: i.coverImage }}
              style={{ width: 56, height: 56, borderRadius: rad.sm }}
            />
          ) : (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: rad.sm,
                backgroundColor: c.surfaceDim,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 24, color: c.textMuted }}>♪</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: fs.md,
                fontWeight: fw.semi,
                color: playing === i._id ? c.teal : c.text,
              }}
            >
              {i.title}
            </Text>
            <Text
              style={{ fontSize: fs.sm, color: c.textSecondary, marginTop: 2 }}
            >
              {i.artistId?.displayName}
            </Text>
            {i.genre?.length > 0 && (
              <Text
                style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 2 }}
              >
                {i.genre.join(", ")}
              </Text>
            )}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            {i.duration && (
              <Text style={{ fontSize: fs.xs, color: c.textMuted }}>
                {Math.floor(i.duration / 60)}:
                {String(i.duration % 60).padStart(2, "0")}
              </Text>
            )}
            <Text style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 2 }}>
              {i.plays || 0} plays
            </Text>
          </View>
        </T>
      )}
    />
  );
}
