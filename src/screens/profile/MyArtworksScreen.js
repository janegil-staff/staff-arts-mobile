import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, Image, FlatList, Dimensions, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { artworks } from "../../services/data";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";

var W = Dimensions.get("window").width;
var GAP = sp.sm;
var COLS = 3;
var CW = (W - sp.lg * 2 - GAP * (COLS - 1)) / COLS;

export default function MyArtworksScreen({ navigation }) {
  var [items, setItems] = useState([]);
  var [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(function () {
      setLoading(true);
      artworks.getMine({ limit: 50 }).then(function (data) {
        setItems(data.artworks || []);
      }).catch(function (e) {
        console.log("My artworks error:", e.message);
      }).finally(function () {
        setLoading(false);
      });
    }, [])
  );

  function renderItem({ item }) {
    var img = item.primaryImage || (item.images && item.images[0] && (item.images[0].url || item.images[0]));
    return (
      <TouchableOpacity
        style={{ width: CW, marginBottom: GAP }}
        onPress={function () { navigation.navigate("ArtworkDetail", { id: item._id }); }}
      >
        <Image
          source={{ uri: img }}
          style={{ width: "100%", aspectRatio: 1, borderRadius: rad.sm, backgroundColor: c.surfaceDim }}
        />
        <Text style={{ fontSize: fs.xs, fontWeight: fw.medium, color: c.text, marginTop: sp.xs }} numberOfLines={1}>
          {item.title}
        </Text>
        {item.pricing && item.pricing.forSale ? (
          <Text style={{ fontSize: fs.xxs, color: c.teal }}>
            ${item.pricing.price}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={c.teal} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {items.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: sp.xl }}>
          <Text style={{ fontSize: 48, marginBottom: sp.md }}>🎨</Text>
          <Text style={{ fontSize: fs.lg, fontWeight: fw.semi, color: c.text, marginBottom: sp.sm }}>No artworks yet</Text>
          <Text style={{ fontSize: fs.sm, color: c.textMuted, textAlign: "center", marginBottom: sp.xl }}>
            Upload your first artwork to see it here
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: c.teal, borderRadius: rad.md, paddingHorizontal: 24, paddingVertical: 14 }}
            onPress={function () { navigation.navigate("Upload"); }}
          >
            <Text style={{ fontSize: fs.md, color: "#fff", fontWeight: fw.semi }}>Upload Artwork</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={function (item) { return item._id; }}
          numColumns={COLS}
          columnWrapperStyle={{ gap: GAP }}
          contentContainerStyle={{ padding: sp.lg }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
