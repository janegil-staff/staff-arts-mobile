import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { artworks } from "../../services/data";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";

var W = Dimensions.get("window").width;
var CW = (W - sp.lg * 2 - sp.sm) / 2;

export default function ExploreScreen({ navigation }) {
  var [data, setData] = useState([]);
  var [loading, setLoading] = useState(true);
  var [query, setQuery] = useState("");
  var [medium, setMedium] = useState("all");
  var [refreshing, setRefreshing] = useState(false);

  var load = useCallback(
    async function () {
      try {
        var params = { limit: 30, status: "all" };
        if (medium !== "all")
          params.medium = medium.toLowerCase().replace(" ", "_");
        if (query.trim()) params.search = query.trim();
        var result = await artworks.list(params);
        setData(result.artworks || []);
      } catch (e) {
        console.log("Explore error:", e);
      }
      setLoading(false);
    },
    [medium, query],
  );

  // Reload on focus
  useFocusEffect(
    useCallback(
      function () {
        load();
      },
      [load],
    ),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  var mediums = [
    "all",
    "painting",
    "sculpture",
    "photography",
    "digital",
    "mixed media",
  ];

  if (loading) {
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
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingHorizontal: sp.lg, paddingTop: sp.md }}>
        <TextInput
          style={s.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Search artworks..."
          placeholderTextColor={c.textMuted}
          returnKeyType="search"
          onSubmitEditing={load}
        />
      </View>
      <FlatList
        data={data}
        keyExtractor={function (i) {
          return i._id;
        }}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: sp.lg, paddingBottom: 100 }}
        columnWrapperStyle={{ gap: sp.sm }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={c.teal}
          />
        }
        ListHeaderComponent={
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: sp.sm,
              marginBottom: sp.md,
              marginTop: sp.md,
            }}
          >
            {mediums.map(function (m) {
              var active = medium === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[s.chip, active && s.chipActive]}
                  onPress={function () {
                    setMedium(m);
                  }}
                >
                  <Text style={[s.chipText, active && s.chipTextActive]}>
                    {m === "mixed media"
                      ? "Mixed"
                      : m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: sp.md }}>🎨</Text>
            <Text style={{ fontSize: fs.lg, color: c.textSecondary }}>
              No artworks found
            </Text>
          </View>
        }
        renderItem={function (info) {
          var item = info.item;
          return (
            <TouchableOpacity
              style={{ width: CW, marginBottom: sp.md }}
              onPress={function () {
                navigation.navigate("ArtworkDetail", { id: item._id });
              }}
            >
              <Image
                source={{ uri: item.images[0]?.url }}
                style={{
                  width: "100%",
                  aspectRatio: 0.75,
                  borderRadius: rad.md,
                  backgroundColor: c.surfaceDim,
                }}
              />
              <Text
                style={{
                  fontSize: fs.sm,
                  fontWeight: fw.medium,
                  color: c.text,
                  marginTop: sp.xs,
                }}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {item.artistId && item.artistId.displayName ? (
                <Text
                  style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 2 }}
                >
                  {item.artistId.displayName}
                </Text>
              ) : null}
              {item.pricing && item.pricing.price > 0 ? (
                <Text
                  style={{
                    fontSize: fs.sm,
                    color: c.amber,
                    fontWeight: fw.bold,
                    marginTop: 2,
                  }}
                >
                  ${item.pricing.price.toLocaleString()}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

var s = StyleSheet.create({
  search: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: rad.md,
    paddingHorizontal: sp.md,
    paddingVertical: 14,
    fontSize: fs.md,
    color: c.text,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: rad.full,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  chipActive: { backgroundColor: c.teal, borderColor: c.teal },
  chipText: {
    fontSize: fs.sm,
    color: c.textSecondary,
    fontWeight: fw.medium,
    textTransform: "capitalize",
  },
  chipTextActive: { color: c.textInverse },
});
