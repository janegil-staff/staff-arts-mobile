import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity as T,
  Image,
  TextInput,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ScrollView,
  Modal,
  Animated,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { artworks, search as searchSvc } from "../../services/data";
import { API_URL } from "../../constants/api";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";

var W = Dimensions.get("window").width;
var CW = (W - sp.lg * 2 - sp.sm) / 2;

// ── Skeleton ──

function Skeleton({ width, height, style }) {
  var anim = useRef(new Animated.Value(0.3)).current;
  useEffect(function () {
    var loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return function () { loop.stop(); };
  }, []);
  return (
    <Animated.View
      style={[
        { width: width, height: height, backgroundColor: c.surfaceDim, borderRadius: rad.md, opacity: anim },
        style,
      ]}
    />
  );
}

function ExploreSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingHorizontal: sp.lg }}>
      <Skeleton width={"100%"} height={48} style={{ marginTop: sp.md }} />
      <View style={{ flexDirection: "row", gap: sp.sm, marginTop: sp.md }}>
        {[1, 2, 3, 4].map(function (i) {
          return <Skeleton key={i} width={70} height={34} style={{ borderRadius: rad.full }} />;
        })}
      </View>
      <View style={{ marginTop: sp.lg }}>
        <Skeleton width={100} height={12} style={{ marginBottom: sp.md }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: sp.md }}>
          {[1, 2, 3].map(function (i) {
            return (
              <View key={i}>
                <Skeleton width={160} height={200} />
                <Skeleton width={120} height={14} style={{ marginTop: sp.sm }} />
              </View>
            );
          })}
        </ScrollView>
      </View>
      <View style={{ flexDirection: "row", gap: sp.sm, marginTop: sp.xl }}>
        <View style={{ flex: 1 }}>
          <Skeleton width={"100%"} height={CW * 1.33} />
          <Skeleton width={"80%"} height={14} style={{ marginTop: sp.sm }} />
        </View>
        <View style={{ flex: 1 }}>
          <Skeleton width={"100%"} height={CW * 1.33} />
          <Skeleton width={"80%"} height={14} style={{ marginTop: sp.sm }} />
        </View>
      </View>
    </View>
  );
}

// ── Filter Chip ──

function Chip({ label, active, onPress }) {
  return (
    <T style={[s.chip, active && s.chipActive]} onPress={onPress}>
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </T>
  );
}

// ── Featured Card (horizontal scroll) ──

function FeaturedCard({ item, onPress }) {
  return (
    <T
      style={{
        width: 160,
        marginRight: sp.md,
        backgroundColor: c.surface,
        borderRadius: rad.lg,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: c.borderLight,
      }}
      onPress={onPress}
    >
      <Image
        source={{ uri: item.images?.[0]?.url }}
        style={{ width: 160, height: 200, backgroundColor: c.surfaceDim }}
        resizeMode="cover"
      />
      <View style={{ padding: sp.sm }}>
        <Text style={{ fontSize: fs.sm, fontWeight: fw.semi, color: c.text }} numberOfLines={1}>
          {item.title}
        </Text>
        {item.artist?.displayName ? (
          <Text style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 2 }} numberOfLines={1}>
            {item.artist.displayName}
          </Text>
        ) : null}
      </View>
    </T>
  );
}

// ── Artist Result Card ──

function ArtistCard({ artist, onPress }) {
  return (
    <T
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: sp.md,
        padding: sp.md,
        backgroundColor: c.surface,
        borderRadius: rad.lg,
        borderWidth: 1,
        borderColor: c.borderLight,
        marginBottom: sp.sm,
      }}
      onPress={onPress}
    >
      {artist.avatar ? (
        <Image source={{ uri: artist.avatar }} style={{ width: 44, height: 44, borderRadius: 22 }} />
      ) : (
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surfaceDim }} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: fs.md, fontWeight: fw.semi, color: c.text }}>
          {artist.displayName || artist.name}
        </Text>
        {artist.location ? (
          <Text style={{ fontSize: fs.xs, color: c.textMuted }}>📍 {artist.location}</Text>
        ) : null}
      </View>
      <Text style={{ fontSize: fs.sm, color: c.textMuted }}>→</Text>
    </T>
  );
}

// ── Filter Modal ──

function FilterModal({ visible, onClose, filters, onApply }) {
  var [sort, setSort] = useState(filters.sort);
  var [forSale, setForSale] = useState(filters.forSale);
  var [style, setStyle] = useState(filters.style);
  var [priceCurrency, setPriceCurrency] = useState(filters.currency);
  var [minPrice, setMinPrice] = useState(filters.minPrice);
  var [maxPrice, setMaxPrice] = useState(filters.maxPrice);

  var styles = ["all", "abstract", "realism", "impressionism", "minimalism", "surrealism", "pop_art", "contemporary"];
  var sorts = [
    { key: "newest", label: "Newest" },
    { key: "popular", label: "Most viewed" },
    { key: "price_asc", label: "Price: Low → High" },
    { key: "price_desc", label: "Price: High → Low" },
  ];
  var currencies = ["USD", "EUR", "GBP", "NOK", "SEK", "CAD", "AUD", "JPY", "CHF"];

  function handleApply() {
    onApply({ sort: sort, forSale: forSale, style: style, currency: priceCurrency, minPrice: minPrice, maxPrice: maxPrice });
    onClose();
  }

  function handleReset() {
    setSort("newest");
    setForSale("all");
    setStyle("all");
    setPriceCurrency("NOK");
    setMinPrice("");
    setMaxPrice("");
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.modalOverlay}>
        <ScrollView style={{ maxHeight: "85%" }} bounces={false}>
        <View style={s.modalContent}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: sp.lg }}>
            <Text style={{ fontSize: fs.lg, fontWeight: fw.semi, color: c.text }}>Filters</Text>
            <T onPress={onClose}>
              <Text style={{ fontSize: fs.md, color: c.textMuted }}>✕</Text>
            </T>
          </View>

          {/* Sort */}
          <Text style={s.filterLabel}>SORT BY</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: sp.sm, marginBottom: sp.lg }}>
            {sorts.map(function (s) {
              return <Chip key={s.key} label={s.label} active={sort === s.key} onPress={function () { setSort(s.key); }} />;
            })}
          </View>

          {/* For Sale */}
          <Text style={s.filterLabel}>AVAILABILITY</Text>
          <View style={{ flexDirection: "row", gap: sp.sm, marginBottom: sp.lg }}>
            <Chip label="All" active={forSale === "all"} onPress={function () { setForSale("all"); }} />
            <Chip label="For Sale" active={forSale === "true"} onPress={function () { setForSale("true"); }} />
            <Chip label="Not for Sale" active={forSale === "false"} onPress={function () { setForSale("false"); }} />
          </View>

          {/* Style */}
          <Text style={s.filterLabel}>STYLE</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: sp.sm, marginBottom: sp.lg }}>
            {styles.map(function (st) {
              var label = st === "all" ? "All" : st.replace(/_/g, " ");
              return <Chip key={st} label={label} active={style === st} onPress={function () { setStyle(st); }} />;
            })}
          </View>

          {/* Currency */}
          {/* Price Range */}
          <Text style={s.filterLabel}>PRICE RANGE</Text>
          <View style={{ flexDirection: "row", gap: sp.sm, marginBottom: sp.md }}>
            <TextInput
              style={s.priceInput}
              value={minPrice}
              onChangeText={setMinPrice}
              placeholder="Min"
              placeholderTextColor={c.textMuted}
              keyboardType="numeric"
            />
            <Text style={{ color: c.textMuted, alignSelf: "center" }}>—</Text>
            <TextInput
              style={s.priceInput}
              value={maxPrice}
              onChangeText={setMaxPrice}
              placeholder="Max"
              placeholderTextColor={c.textMuted}
              keyboardType="numeric"
            />
          </View>
          <Text style={{ fontSize: fs.xs, color: c.textMuted, marginBottom: sp.sm }}>
            Prices will be converted to your selected currency
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: sp.sm, marginBottom: sp.xl }}>
            {currencies.map(function (cur) {
              return <Chip key={cur} label={cur} active={priceCurrency === cur} onPress={function () { setPriceCurrency(priceCurrency === cur ? "" : cur); }} />;
            })}
          </View>

          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: sp.sm }}>
            <T style={[s.modalBtn, { borderWidth: 1, borderColor: c.border }]} onPress={handleReset}>
              <Text style={{ fontSize: fs.sm, fontWeight: fw.semi, color: c.text }}>Reset</Text>
            </T>
            <T style={[s.modalBtn, { backgroundColor: c.teal, flex: 2 }]} onPress={handleApply}>
              <Text style={{ fontSize: fs.sm, fontWeight: fw.semi, color: c.textInverse }}>Apply Filters</Text>
            </T>
          </View>
        </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── Main Screen ──

export default function ExploreScreen({ navigation }) {
  var [data, setData] = useState([]);
  var [featured, setFeatured] = useState([]);
  var [artists, setArtists] = useState([]);
  var [loading, setLoading] = useState(true);
  var [refreshing, setRefreshing] = useState(false);
  var [query, setQuery] = useState("");
  var [medium, setMedium] = useState("all");
  var [showFilters, setShowFilters] = useState(false);
  var [filters, setFilters] = useState({
    sort: "newest",
    forSale: "all",
    style: "all",
    currency: "NOK",
    minPrice: "",
    maxPrice: "",
  });
  var [searchMode, setSearchMode] = useState(false);
  var [rates, setRates] = useState(null);

  // Currency symbols for display
  var SYMBOLS = { USD: "$", EUR: "€", GBP: "£", NOK: "kr", SEK: "kr", CAD: "$", AUD: "$", JPY: "¥", CHF: "Fr" };

  // Convert price from one currency to another using rates
  function convertPrice(price, fromCurrency, toCurrency) {
    if (!rates || !price || !fromCurrency || !toCurrency) return price;
    if (fromCurrency === toCurrency) return price;
    var fromRate = rates[fromCurrency] || 1;
    var toRate = rates[toCurrency] || 1;
    return Math.round(price / fromRate * toRate);
  }

  function formatConvertedPrice(item) {
    var price = item.price || item.pricing?.price;
    var cur = item.currency || "USD";
    if (!price || price <= 0) return null;
    if (!filters.currency || !rates) {
      var sym = SYMBOLS[cur] || cur + " ";
      return sym + price.toLocaleString() + (SYMBOLS[cur] ? "" : "");
    }
    var converted = convertPrice(price, cur, filters.currency);
    var sym = SYMBOLS[filters.currency] || filters.currency + " ";
    return sym + converted.toLocaleString();
  }

  var activeFilterCount = [
    filters.sort !== "newest",
    filters.forSale !== "all",
    filters.style !== "all",
    filters.currency !== "NOK",
    filters.minPrice !== "",
    filters.maxPrice !== "",
  ].filter(Boolean).length;

  var loadArtworks = useCallback(
    async function () {
      try {
        var params = { limit: 30, status: "all" };
        if (medium !== "all") params.medium = medium.toLowerCase().replace(" ", "_");
        if (query.trim()) params.search = query.trim();
        if (filters.sort !== "newest") params.sort = filters.sort;
        if (filters.forSale !== "all") params.forSale = filters.forSale;
        if (filters.style !== "all") params.style = filters.style;
        // Don't send currency to backend — we filter on frontend after conversion
        // Don't send price range to backend — we filter on frontend after conversion
        if (!filters.currency) {
          // No currency selected: let backend do raw price filter
          if (filters.minPrice) params.minPrice = filters.minPrice;
          if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        }

        var result = await artworks.list(params);
        var items = result.artworks || [];

        // Client-side price filtering with conversion
        if (filters.currency && (filters.minPrice || filters.maxPrice)) {
          items = items.filter(function (item) {
            var price = item.price || item.pricing?.price;
            if (!price) return false;
            var cur = item.currency || "USD";
            var converted = convertPrice(price, cur, filters.currency);
            var min = filters.minPrice ? parseInt(filters.minPrice) : 0;
            var max = filters.maxPrice ? parseInt(filters.maxPrice) : Infinity;
            return converted >= min && converted <= max;
          });
        }

        setData(items);
      } catch (e) {
        console.log("Explore error:", e.message);
      }
      setLoading(false);
    },
    [medium, query, filters, rates],
  );

  var loadFeatured = useCallback(async function () {
    try {
      var result = await artworks.list({ featured: true, limit: 10, status: "all" });
      setFeatured(result.artworks || []);
    } catch {}
  }, []);

  // Search for artists when query changes
  var searchArtists = useCallback(
    async function () {
      if (!query.trim()) {
        setArtists([]);
        return;
      }
      try {
        var result = await searchSvc.query(query.trim(), "users");
        setArtists(result.users || result.artists || []);
      } catch {
        setArtists([]);
      }
    },
    [query],
  );

  useFocusEffect(
    useCallback(function () {
      loadFeatured();
    }, [loadFeatured]),
  );

  // Fetch exchange rates once
  useEffect(function () {
    (async function () {
      try {
        var res = await fetch(API_URL + "/api/exchange-rates");
        var json = await res.json();
        if (json.data?.rates) setRates(json.data.rates);
      } catch (e) {
        console.log("Rates fetch error:", e.message);
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(function () {
      loadArtworks();
    }, [loadArtworks]),
  );

  // Debounced artist search
  useEffect(function () {
    if (query.trim().length >= 2) {
      var timer = setTimeout(function () {
        searchArtists();
        setSearchMode(true);
      }, 400);
      return function () { clearTimeout(timer); };
    } else {
      setArtists([]);
      setSearchMode(false);
    }
  }, [query]);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([loadArtworks(), loadFeatured()]);
    setRefreshing(false);
  }

  var mediums = ["all", "painting", "sculpture", "photography", "digital", "mixed media"];

  if (loading) return <ExploreSkeleton />;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Search Bar */}
      <View style={{ flexDirection: "row", gap: sp.sm, paddingHorizontal: sp.lg, paddingTop: sp.md }}>
        <View style={{ flex: 1, position: "relative" }}>
          <TextInput
            style={s.search}
            value={query}
            onChangeText={setQuery}
            placeholder="Search artworks & artists..."
            placeholderTextColor={c.textMuted}
            returnKeyType="search"
            onSubmitEditing={loadArtworks}
          />
          {query.length > 0 && (
            <T
              style={{ position: "absolute", right: 12, top: 14 }}
              onPress={function () { setQuery(""); setArtists([]); setSearchMode(false); }}
            >
              <Text style={{ fontSize: fs.md, color: c.textMuted }}>✕</Text>
            </T>
          )}
        </View>
        <T
          style={[s.filterBtn, activeFilterCount > 0 && { borderColor: c.teal }]}
          onPress={function () { setShowFilters(true); }}
        >
          <Text style={{ fontSize: 16 }}>⚙</Text>
          {activeFilterCount > 0 && (
            <View style={s.filterBadge}>
              <Text style={s.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </T>
      </View>

      <FlatList
        data={data}
        keyExtractor={function (i) { return i._id; }}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: sp.lg, paddingBottom: 100 }}
        columnWrapperStyle={{ gap: sp.sm }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.teal} />
        }
        ListHeaderComponent={
          <View>
            {/* Medium Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: sp.sm, paddingVertical: sp.md }}
            >
              {mediums.map(function (m) {
                var active = medium === m;
                var label = m === "mixed media" ? "Mixed" : m.charAt(0).toUpperCase() + m.slice(1);
                return (
                  <Chip key={m} label={label} active={active} onPress={function () { setMedium(m); }} />
                );
              })}
            </ScrollView>

            {/* Active filter tags */}
            {activeFilterCount > 0 && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: sp.xs, marginBottom: sp.md }}>
                {filters.sort !== "newest" && (
                  <View style={s.activeTag}>
                    <Text style={s.activeTagText}>Sort: {filters.sort.replace("_", " ")}</Text>
                  </View>
                )}
                {filters.forSale !== "all" && (
                  <View style={s.activeTag}>
                    <Text style={s.activeTagText}>{filters.forSale === "true" ? "For sale" : "Not for sale"}</Text>
                  </View>
                )}
                {filters.style !== "all" && (
                  <View style={s.activeTag}>
                    <Text style={s.activeTagText}>{filters.style.replace(/_/g, " ")}</Text>
                  </View>
                )}
                {filters.currency !== "" && (
                  <View style={s.activeTag}>
                    <Text style={s.activeTagText}>{filters.currency}</Text>
                  </View>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <View style={s.activeTag}>
                    <Text style={s.activeTagText}>
                      {filters.minPrice || "0"} – {filters.maxPrice || "∞"}
                    </Text>
                  </View>
                )}
                <T onPress={function () { setFilters({ sort: "newest", forSale: "all", style: "all", currency: "NOK", minPrice: "", maxPrice: "" }); }}>
                  <Text style={{ fontSize: fs.xs, color: c.teal, fontWeight: fw.semi }}>Clear all</Text>
                </T>
              </View>
            )}

            {/* Artist Results (when searching) */}
            {artists.length > 0 && searchMode && (
              <View style={{ marginBottom: sp.md }}>
                <Text style={s.secLabel}>ARTISTS</Text>
                {artists.slice(0, 3).map(function (a) {
                  return (
                    <ArtistCard
                      key={a._id}
                      artist={a}
                      onPress={function () {
                        if (a.username) {
                          navigation.push("ArtistProfile", { username: a.username });
                        } else {
                          navigation.push("ArtistProfile", { id: a._id });
                        }
                      }}
                    />
                  );
                })}
              </View>
            )}

            {/* Featured / Trending (when NOT searching) */}
            {!searchMode && featured.length > 0 && (
              <View style={{ marginBottom: sp.lg }}>
                <Text style={s.secLabel}>TRENDING</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: sp.md }}
                >
                  {featured.map(function (item) {
                    return (
                      <FeaturedCard
                        key={item._id}
                        item={item}
                        onPress={function () {
                          navigation.navigate("ArtworkDetail", { id: item._id });
                        }}
                      />
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Results count */}
            {searchMode && (
              <Text style={{ fontSize: fs.xs, color: c.textMuted, marginBottom: sp.md }}>
                {data.length} artwork{data.length !== 1 ? "s" : ""} found
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: sp.md }}>🔍</Text>
            <Text style={{ fontSize: fs.lg, fontWeight: fw.medium, color: c.text, marginBottom: sp.xs }}>
              {query.trim() ? "No results" : "No artworks found"}
            </Text>
            <Text style={{ fontSize: fs.sm, color: c.textMuted, textAlign: "center", maxWidth: 260 }}>
              {query.trim()
                ? 'Try a different search or adjust your filters'
                : "Check back soon for new work"}
            </Text>
          </View>
        }
        renderItem={function (info) {
          var item = info.item;
          return (
            <T
              style={{ width: CW, marginBottom: sp.md }}
              onPress={function () {
                navigation.navigate("ArtworkDetail", { id: item._id });
              }}
            >
              <Image
                source={{ uri: item.images?.[0]?.url }}
                style={{
                  width: "100%",
                  aspectRatio: 0.75,
                  borderRadius: rad.md,
                  backgroundColor: c.surfaceDim,
                }}
              />
              <Text
                style={{ fontSize: fs.sm, fontWeight: fw.medium, color: c.text, marginTop: sp.xs }}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {(item.artist?.displayName || item.artistId?.displayName) ? (
                <Text style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 2 }} numberOfLines={1}>
                  {item.artist?.displayName || item.artistId?.displayName}
                </Text>
              ) : null}
              {(function () {
                var priceStr = formatConvertedPrice(item);
                if (priceStr) {
                  return (
                    <Text style={{ fontSize: fs.sm, color: c.amber, fontWeight: fw.bold, marginTop: 2 }}>
                      {priceStr}
                    </Text>
                  );
                } else if (item.forSale) {
                  return (
                    <Text style={{ fontSize: fs.xs, color: c.teal, marginTop: 2 }}>Price on request</Text>
                  );
                }
                return null;
              })()}
            </T>
          );
        }}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={function () { setShowFilters(false); }}
        filters={filters}
        onApply={setFilters}
      />
    </View>
  );
}

// ── Styles ──

var s = StyleSheet.create({
  search: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: rad.md,
    paddingHorizontal: sp.md,
    paddingRight: 40,
    paddingVertical: 14,
    fontSize: fs.md,
    color: c.text,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: rad.md,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: c.teal,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: c.textInverse,
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
  secLabel: {
    fontSize: fs.xxs,
    letterSpacing: 2,
    color: c.textMuted,
    fontWeight: fw.semi,
    marginBottom: sp.md,
  },
  activeTag: {
    backgroundColor: c.tealBg,
    borderRadius: rad.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeTagText: {
    fontSize: fs.xs,
    color: c.tealLight,
    fontWeight: fw.medium,
    textTransform: "capitalize",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: c.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: sp.lg,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  filterLabel: {
    fontSize: fs.xxs,
    letterSpacing: 2,
    color: c.textMuted,
    fontWeight: fw.semi,
    marginBottom: sp.sm,
  },
  priceInput: {
    flex: 1,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: rad.md,
    paddingHorizontal: sp.md,
    paddingVertical: 12,
    fontSize: fs.md,
    color: c.text,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: rad.md,
    alignItems: "center",
  },
});