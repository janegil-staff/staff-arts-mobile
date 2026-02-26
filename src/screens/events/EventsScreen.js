import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity as T,
  Image,
  StyleSheet as S,
  ActivityIndicator,
} from "react-native";
import { events as evSvc } from "../../services/data";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
import { format } from "date-fns";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function Events({ navigation: n }) {
  var [data, sD] = useState([]);
  var [ld, sL] = useState(true);

  useFocusEffect(
    useCallback(function () {
      sL(true);
      (async function () {
        try {
          var d = await evSvc.list({});
          sD(d.events || []);
        } catch {}
        sL(false);
      })();
    }, []),
  );

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: c.bg }}
      data={data}
      keyExtractor={(i) => i._id}
      contentContainerStyle={{ padding: sp.lg, paddingBottom: 100 }}
      ListEmptyComponent={
        <Text
          style={{ textAlign: "center", color: c.textMuted, marginTop: 60 }}
        >
          No events
        </Text>
      }
      renderItem={({ item: i }) => (
        <T
          style={s.card}
          onPress={() => n.navigate("EventDetail", { id: i._id })}
        >
          {i.coverImage?.url && (
            <Image
              source={{ uri: i.coverImage.url }}
              style={{ width: "100%", height: 160 }}
            />
          )}
          <View style={{ padding: sp.lg }}>
            {i.type ? (
              <View style={s.badge}>
                <Text style={s.badgeT}>{i.type.replace("_", " ")}</Text>
              </View>
            ) : null}
            <Text
              style={{
                fontSize: fs.xl,
                fontWeight: fw.light,
                color: c.text,
                marginBottom: sp.sm,
              }}
            >
              {i.title}
            </Text>
            <Text
              style={{
                fontSize: fs.sm,
                color: c.textSecondary,
                lineHeight: 20,
              }}
              numberOfLines={2}
            >
              {i.description}
            </Text>
            {i.organizer ? (
              <Text
                style={{
                  fontSize: fs.xs,
                  color: c.textMuted,
                  marginTop: sp.sm,
                }}
              >
                By {i.organizer.displayName || i.organizer.name}
              </Text>
            ) : null}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: sp.sm,
                marginTop: sp.md,
              }}
            >
              {(i.date || i.startDate) && (
                <View style={s.chip}>
                  <Text style={s.chipT}>
                    {format(new Date(i.date || i.startDate), "MMM d, yyyy")}
                  </Text>
                </View>
              )}
              {i.location ? (
                <View style={s.chip}>
                  <Text style={s.chipT}>{i.location}</Text>
                </View>
              ) : null}
              {i.isFree ? (
                <View
                  style={[
                    s.chip,
                    { borderColor: c.tealLight, backgroundColor: c.tealGlow || c.tealBg },
                  ]}
                >
                  <Text style={[s.chipT, { color: c.tealLight }]}>Free</Text>
                </View>
              ) : null}
            </View>
          </View>
        </T>
      )}
    />
  );
}

var s = S.create({
  card: {
    backgroundColor: c.surface,
    borderRadius: rad.lg,
    overflow: "hidden",
    marginBottom: sp.md,
    borderWidth: 1,
    borderColor: c.borderLight,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: c.tealGlow || c.tealBg,
    borderRadius: rad.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: sp.sm,
  },
  badgeT: {
    fontSize: fs.xxs,
    color: c.tealLight,
    fontWeight: fw.semi,
    textTransform: "capitalize",
  },
  chip: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: rad.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipT: { fontSize: fs.xs, color: c.textMuted },
});