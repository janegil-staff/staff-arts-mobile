import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useExplore } from "../../store/exploreStore";
import { useRefresh } from "../../hooks";
import ArtworkCard, { CARD_WIDTH } from "../../components/artwork/ArtworkCard";
import { colors, fs, fw, sp, rad } from "../../constants/theme";
import { ART_CATEGORIES } from "../../constants";

export default function ExploreScreen(props) {
  var navigation = props.navigation;
  var route = props.route;
  var store = useExplore();

  // Local filter state — guaranteed re-render on change
  var selectedCat = useState(
    (route && route.params && route.params.category) || null,
  );
  var active = selectedCat[0];
  var setActive = selectedCat[1];

  // Fetch when category changes
  useEffect(
    function () {
      if (active) {
        store.setFilter("category", active);
      } else {
        store.clearFilters();
      }
      store.fetchArtworks(true);
    },
    [active],
  );

  var refresh = useCallback(function () {
    return store.fetchArtworks(true);
  }, []);
  var r = useRefresh(refresh);
  var loadMore = useCallback(
    function () {
      if (store.hasMore && !store.isLoading) store.fetchArtworks();
    },
    [store.hasMore, store.isLoading],
  );

  function selectCategory(c) {
    setActive(active === c ? null : c);
  }

  return (
    <View style={s.c}>
      <View style={s.header}>
        <Text style={s.title}>Explore</Text>
        <TouchableOpacity style={s.searchBtn}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
        style={{ maxHeight: 32 }}
      >
        <TouchableOpacity
          onPress={function () {
            setActive(null);
          }}
          style={[s.chip, !active && s.chipOn]}
        >
          <Text style={[s.chipTxt, !active && s.chipTxtOn]}>All</Text>
        </TouchableOpacity>
        {ART_CATEGORIES.map(function (c) {
          return (
            <TouchableOpacity
              key={c}
              onPress={function () {
                selectCategory(c);
              }}
              style={[s.chip, active === c && s.chipOn]}
            >
              <Text style={[s.chipTxt, active === c && s.chipTxtOn]}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <FlatList
        data={store.artworks || []}
        keyExtractor={function (item, i) {
          return item._id || String(i);
        }}
        numColumns={2}
        columnWrapperStyle={{ gap: 8 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onRefresh={r.onRefresh}
        refreshing={r.refreshing}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        renderItem={function (info) {
          var item = info.item;
          var index = info.index;
          return (
            <ArtworkCard
              artwork={item}
              index={index}
              onPress={function () {
                navigation.navigate("ArtworkDetail", { id: item._id });
              }}
              onLike={function () {
                store.likeArtwork(item._id);
              }}
            />
          );
        }}
        ListEmptyComponent={
          !store.isLoading ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🎨</Text>
              <Text style={s.emptyTitle}>No artworks yet</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

var s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: sp.md,
    paddingTop: sp.xs,
    paddingBottom: sp.xs,
  },
  title: { fontSize: fs.xxl, fontWeight: fw.bold, color: colors.text },
  searchBtn: {
    padding: sp.sm,
    backgroundColor: colors.surface,
    borderRadius: rad.md,
  },
  filterRow: { paddingHorizontal: sp.md, paddingBottom: 2, gap: 4 },
  chip: {
    paddingHorizontal: 7,
    paddingVertical: 7,
    backgroundColor: colors.surface,
    borderRadius: rad.full,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  chipOn: { borderColor: colors.accent, backgroundColor: colors.accentMuted },
  chipTxt: { color: colors.textSecondary, fontSize: 10 },
  chipTxtOn: { color: colors.accent, fontWeight: fw.semibold, fontSize: 10 },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: sp.md },
  emptyTitle: { color: colors.text, fontSize: fs.lg, fontWeight: fw.semibold },
});
