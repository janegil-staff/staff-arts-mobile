import { useState, useEffect, useCallback } from "react";
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
        var params = {};
        if (medium !== "all") params.medium = medium;
        if (query.trim()) params.search = query.trim();
        var result = await artworks.list(params);
        setData(Array.isArray(result) ? result : result.artworks || []);
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    },
    [medium, query],
  );

  useEffect(
    function () {
      load();
    },
    [load],
  );

  var onRefresh = async function () {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  var mediums = [
    "all",
    "painting",
    "sculpture",
    "photography",
    "digital",
    "mixed_media",
  ];

  if (loading)
    return (
      <View style={s.ctr}>
        <ActivityIndicator color={c.teal} />
      </View>
    );

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
                    {m === "mixed_media"
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
          var idx = info.index;
          return (
            <TouchableOpacity
              style={{ width: CW, marginBottom: sp.md }}
              onPress={function () {
                navigation.navigate("ArtworkDetail", { id: item._id });
              }}
            >
              <Image
                source={{ uri: item.primaryImage }}
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
              {item.artistId?.displayName && (
                <Text
                  style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 2 }}
                >
                  {item.artistId.displayName}
                </Text>
              )}
              {item.pricing?.price > 0 && (
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
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

var s = StyleSheet.create({
  ctr: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: c.bg,
  },
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
