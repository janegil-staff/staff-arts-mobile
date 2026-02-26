import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity as T,
  Image,
  ActivityIndicator,
} from "react-native";
import { exhibitions as exSvc } from "../../services/data";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
import { format } from "date-fns";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function Exhibitions({ navigation: n }) {
  var [data, sD] = useState([]);
  var [ld, sL] = useState(true);
  useFocusEffect(
    useCallback(function () {
      sL(true);
      (async function () {
        try {
          var d = await exSvc.list({});
          sD(d.exhibitions || []);
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
          No exhibitions
        </Text>
      }
      renderItem={({ item: i }) => (
        <T
          style={{
            backgroundColor: c.surface,
            borderRadius: rad.lg,
            overflow: "hidden",
            marginBottom: sp.md,
            borderWidth: 1,
            borderColor: c.borderLight,
          }}
          onPress={() => n.navigate("ExhibitionDetail", { id: i._id })}
        >
          {i.coverImage && (
            <Image
              source={{ uri: i.coverImage.url }}
              style={{ width: "100%", height: 180 }}
            />
          )}
          <View style={{ padding: sp.lg }}>
            <Text
              style={{ fontSize: fs.xl, fontWeight: fw.light, color: c.text }}
            >
              {i.title}
            </Text>
            <Text
              style={{
                fontSize: fs.sm,
                color: c.textSecondary,
                marginTop: sp.xs,
              }}
              numberOfLines={2}
            >
              {i.description}
            </Text>
            {i.curatorId && (
              <Text
                style={{
                  fontSize: fs.xs,
                  color: c.textMuted,
                  marginTop: sp.sm,
                }}
              >
                Curated by {i.curatorId.displayName}
              </Text>
            )}
            {i.startDate && (
              <Text
                style={{
                  fontSize: fs.xs,
                  color: c.tealLight,
                  marginTop: sp.xs,
                }}
              >
                {format(new Date(i.startDate), "MMM d, yyyy")}
              </Text>
            )}
          </View>
        </T>
      )}
    />
  );
}
