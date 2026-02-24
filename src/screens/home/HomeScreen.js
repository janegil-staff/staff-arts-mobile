import React, { useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useExplore } from "../../store/exploreStore";
import { useRefresh } from "../../hooks";
import ArtworkCard from "../../components/artwork/ArtworkCard";
import { colors, fs, fw, sp, rad, screen } from "../../constants/theme";
import { ART_CATEGORIES } from "../../constants";

function placeholders(n) {
  return Array.from({ length: n }, function (_, i) {
    return { _id: null, title: "Artwork " + (i + 1), images: [], artist: { name: "Artist" }, likesCount: 0, isLiked: false, forSale: false, price: 0, currency: "USD" };
  });
}

export default function HomeScreen({ navigation }) {
  var ins = useSafeAreaInsets();
  var store = useExplore();

  useEffect(function () { store.fetchFeatured(); store.fetchArtworks(true); }, []);

  var refresh = useCallback(function () { return Promise.all([store.fetchFeatured(), store.fetchArtworks(true)]); }, []);
  var r = useRefresh(refresh);

  var items = store.artworks.length > 0 ? store.artworks.slice(0, 10) : placeholders(6);
  var feat = store.featured.length > 0 ? store.featured : placeholders(5);

  return (
    <ScrollView style={[s.c, { paddingTop: ins.top }]} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={r.refreshing} onRefresh={r.onRefresh} tintColor={colors.accent} colors={[colors.accent]} progressBackgroundColor={colors.surface} />}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.logo}>Staff<Text style={{ color: colors.accent }}>Arts</Text></Text>
        <View style={s.headerR}>
          <TouchableOpacity onPress={function () { navigation.navigate("Messages"); }} style={s.iconBtn}><Ionicons name="chatbubble-outline" size={22} color={colors.textSecondary} /></TouchableOpacity>
          <TouchableOpacity onPress={function () { navigation.navigate("Notifications"); }} style={s.iconBtn}><Ionicons name="notifications-outline" size={22} color={colors.textSecondary} /></TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.cats}>
        {ART_CATEGORIES.map(function (c) {
          return <TouchableOpacity key={c} onPress={function () { navigation.navigate("Explore", { screen: "ExploreMain", params: { category: c } }); }} style={s.chip} activeOpacity={0.7}><Text style={s.chipTxt}>{c}</Text></TouchableOpacity>;
        })}
      </ScrollView>

      {/* Featured carousel */}
      <View style={s.sec}>
        <View style={s.secH}>
          <Text style={s.secT}>✦ Featured</Text>
          <TouchableOpacity onPress={function () { navigation.navigate("Explore"); }}><Text style={s.seeAll}>See all</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.featScroll} snapToInterval={screen.width * 0.7 + sp.md} decelerationRate="fast">
          {feat.map(function (item, i) {
            return (
              <TouchableOpacity key={item._id || i} activeOpacity={0.85} onPress={function () { if (item._id) navigation.navigate("ArtworkDetail", { id: item._id }); }} style={s.featCard}>
                <View style={s.featImg}>
                  {item.images && item.images[0]
                    ? <Image source={{ uri: item.images[0].url }} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={300} />
                    : <View style={s.ph}><Ionicons name="image-outline" size={28} color={colors.textMuted} /></View>}
                </View>
                <Text style={s.featTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={s.featArtist} numberOfLines={1}>{item.artist && item.artist.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Recent grid */}
      <View style={s.sec}>
        <Text style={[s.secT, { paddingHorizontal: sp.md, marginBottom: sp.md }]}>Recent Works</Text>
        <View style={s.grid}>
          {items.map(function (item, i) {
            return <ArtworkCard key={item._id || i} artwork={item} onPress={function () { if (item._id) navigation.navigate("ArtworkDetail", { id: item._id }); }} onLike={item._id ? function () { store.likeArtwork(item._id); } : undefined} />;
          })}
        </View>
      </View>
    </ScrollView>
  );
}

var s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: sp.md, paddingVertical: sp.md },
  logo: { fontSize: fs.xxl, fontWeight: fw.bold, color: colors.text },
  headerR: { flexDirection: "row", gap: sp.xs },
  iconBtn: { padding: sp.sm, borderRadius: rad.md },
  cats: { paddingHorizontal: sp.md, paddingBottom: sp.md, gap: sp.sm },
  chip: { paddingHorizontal: sp.md, paddingVertical: sp.sm, backgroundColor: colors.surface, borderRadius: rad.full, borderWidth: 1, borderColor: colors.border },
  chipTxt: { color: colors.textSecondary, fontSize: fs.sm },
  sec: { marginTop: sp.md },
  secH: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: sp.md, marginBottom: sp.md },
  secT: { color: colors.text, fontSize: fs.lg, fontWeight: fw.bold },
  seeAll: { color: colors.accent, fontSize: fs.sm, fontWeight: fw.medium },
  featScroll: { paddingLeft: sp.md, paddingRight: sp.sm },
  featCard: { width: screen.width * 0.7, marginRight: sp.md },
  featImg: { width: "100%", aspectRatio: 3 / 4, borderRadius: rad.lg, overflow: "hidden", backgroundColor: colors.surface, marginBottom: sp.sm },
  ph: { flex: 1, alignItems: "center", justifyContent: "center" },
  featTitle: { color: colors.text, fontSize: fs.md, fontWeight: fw.semibold },
  featArtist: { color: colors.textSecondary, fontSize: fs.sm, marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: sp.md, gap: 8 },
});
