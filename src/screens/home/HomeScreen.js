import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Dimensions,
  StyleSheet,
  Animated,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { artworks, events as evSvc } from "../../services/data";
import { useAuth } from "../../store/authStore";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
import { format } from "date-fns";
import { useEffect, useRef } from "react";

var W = Dimensions.get("window").width;
var FW = W * 0.72;

// ── Skeleton Shimmer ──

function Skeleton({ width, height, style }) {
  var anim = useRef(new Animated.Value(0.3)).current;

  useEffect(function () {
    var loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return function () { loop.stop(); };
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width,
          height: height,
          backgroundColor: c.surfaceDim,
          borderRadius: rad.md,
          opacity: anim,
        },
        style,
      ]}
    />
  );
}

function HomeSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Greeting skeleton */}
      <View style={{ paddingHorizontal: sp.lg, paddingTop: sp.sm, paddingBottom: sp.lg }}>
        <Skeleton width={120} height={16} />
        <Skeleton width={160} height={28} style={{ marginTop: sp.sm }} />
      </View>

      {/* Curated section skeleton */}
      <View style={{ marginBottom: sp.xl }}>
        <View style={{ paddingHorizontal: sp.lg, marginBottom: sp.md }}>
          <Skeleton width={80} height={12} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: sp.lg, gap: sp.md }}
        >
          {[1, 2].map(function (i) {
            return (
              <View
                key={i}
                style={{
                  width: FW,
                  backgroundColor: c.surface,
                  borderRadius: rad.lg,
                  borderWidth: 1,
                  borderColor: c.borderLight,
                  overflow: "hidden",
                }}
              >
                <Skeleton width={FW} height={FW * 1.15} style={{ borderRadius: 0 }} />
                <View style={{ padding: sp.md }}>
                  <Skeleton width={FW * 0.7} height={16} />
                  <Skeleton width={FW * 0.4} height={14} style={{ marginTop: sp.sm }} />
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Events skeleton */}
      <View style={{ paddingHorizontal: sp.lg, marginBottom: sp.xl }}>
        <Skeleton width={80} height={12} style={{ marginBottom: sp.md }} />
        {[1, 2, 3].map(function (i) {
          return (
            <View
              key={i}
              style={{
                backgroundColor: c.surface,
                borderRadius: rad.md,
                padding: sp.md,
                marginBottom: sp.sm,
                borderWidth: 1,
                borderColor: c.borderLight,
              }}
            >
              <Skeleton width={"60%"} height={14} />
              <Skeleton width={"80%"} height={16} style={{ marginTop: sp.sm }} />
              <Skeleton width={"40%"} height={12} style={{ marginTop: sp.sm }} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── Error State ──

function ErrorState({ message, onRetry }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: c.bg,
        paddingHorizontal: sp.xl,
      }}
    >
      <Text style={{ fontSize: 40, marginBottom: sp.md }}>😔</Text>
      <Text
        style={{
          fontSize: fs.md,
          color: c.textSecondary,
          textAlign: "center",
          marginBottom: sp.lg,
        }}
      >
        {message || "Something went wrong"}
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: c.teal,
          paddingVertical: 12,
          paddingHorizontal: 32,
          borderRadius: rad.md,
        }}
        onPress={onRetry}
      >
        <Text
          style={{ fontSize: fs.sm, fontWeight: fw.semi, color: c.textInverse }}
        >
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Empty Section ──

function EmptyHome() {
  return (
    <View style={{ alignItems: "center", paddingVertical: 60 }}>
      <Text style={{ fontSize: 48, marginBottom: sp.md }}>🎨</Text>
      <Text
        style={{
          fontSize: fs.lg,
          fontWeight: fw.medium,
          color: c.text,
          marginBottom: sp.xs,
        }}
      >
        Nothing here yet
      </Text>
      <Text
        style={{
          fontSize: fs.sm,
          color: c.textMuted,
          textAlign: "center",
          maxWidth: 260,
        }}
      >
        New artworks and events will appear here as artists add them
      </Text>
    </View>
  );
}

// ── Main Screen ──

export default function HomeScreen({ navigation }) {
  var { user } = useAuth();
  var [feat, setFeat] = useState([]);
  var [rec, setRec] = useState([]);
  var [evs, setEvs] = useState([]);
  var [refreshing, setRefreshing] = useState(false);
  var [initialLoad, setInitialLoad] = useState(true);
  var [error, setError] = useState(null);

  var load = useCallback(async function () {
    var hadError = false;
    var results = 0;

    try {
      var f = await artworks.list({ featured: true, limit: 10, status: "all" });
      var featured = f.artworks || f.data?.artworks || [];
      setFeat(featured);
      results += featured.length;
    } catch (e) {
      console.log("Home featured error:", e.message);
      hadError = true;
    }

    try {
      var r = await artworks.list({ sort: "newest", limit: 10, status: "all" });
      var recent = r.artworks || r.data?.artworks || [];
      setRec(recent);
      results += recent.length;
    } catch (e) {
      console.log("Home recent error:", e.message);
      hadError = true;
    }

    try {
      var ev = await evSvc.list({});
      var events = ev.events || ev.data?.events || [];
      setEvs(events);
      results += events.length;
    } catch (e) {
      console.log("Home events error:", e.message);
      hadError = true;
    }

    // Only show error state if ALL requests failed
    if (hadError && results === 0) {
      setError("Couldn't load content. Check your connection and try again.");
    } else {
      setError(null);
    }

    setInitialLoad(false);
  }, []);

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

  // Show skeleton on first load
  if (initialLoad) {
    return <HomeSkeleton />;
  }

  // Show error if all requests failed
  if (error && feat.length === 0 && rec.length === 0 && evs.length === 0) {
    return <ErrorState message={error} onRetry={load} />;
  }

  var hr = new Date().getHours();
  var greeting =
    hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";

  var isEmpty = feat.length === 0 && rec.length === 0 && evs.length === 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={c.teal}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <View
        style={{
          paddingHorizontal: sp.lg,
          paddingTop: sp.sm,
          paddingBottom: sp.lg,
        }}
      >
        <Text style={{ fontSize: fs.sm, color: c.textMuted }}>{greeting},</Text>
        <Text style={{ fontSize: fs.xxl, fontWeight: fw.light, color: c.text }}>
          {user && user.name ? user.name.split(" ")[0] : "there"}
        </Text>
      </View>

      {isEmpty ? (
        <EmptyHome />
      ) : (
        <>
          {/* Curated */}
          {feat.length > 0 && (
            <View style={s.sec}>
              <View style={s.sh}>
                <Text style={s.sl}>CURATED</Text>
                <TouchableOpacity
                  onPress={function () {
                    navigation.navigate("Explore");
                  }}
                >
                  <Text style={{ fontSize: fs.sm, color: c.teal }}>See all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={FW + sp.md}
                decelerationRate="fast"
                contentContainerStyle={{ paddingLeft: sp.lg, paddingRight: sp.md }}
              >
                {feat.map(function (item) {
                  return (
                    <TouchableOpacity
                      key={item._id}
                      style={s.fc}
                      onPress={function () {
                        navigation.navigate("ArtworkDetail", { id: item._id });
                      }}
                    >
                      <Image
                        source={{ uri: item.images?.[0]?.url }}
                        style={s.fi}
                      />
                      <View style={{ padding: sp.md, paddingBottom: sp.xs }}>
                        <Text
                          style={{
                            fontSize: fs.md,
                            fontWeight: fw.semi,
                            color: c.text,
                          }}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text
                          style={{
                            fontSize: fs.sm,
                            color: c.textSecondary,
                            marginTop: 2,
                          }}
                          numberOfLines={1}
                        >
                          {item.artistId && item.artistId.displayName
                            ? item.artistId.displayName
                            : ""}
                        </Text>
                      </View>
                      {item.pricing && item.pricing.price > 0 && (
                        <Text
                          style={{
                            paddingHorizontal: sp.md,
                            paddingBottom: sp.md,
                            fontSize: fs.sm,
                            fontWeight: fw.bold,
                            color: c.teal,
                          }}
                        >
                          ${item.pricing.price.toLocaleString()}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Upcoming Events */}
          {evs.length > 0 && (
            <View style={s.sec}>
              <View style={s.sh}>
                <Text style={s.sl}>UPCOMING</Text>
                <TouchableOpacity
                  onPress={function () {
                    navigation.navigate("Shows");
                  }}
                >
                  <Text style={{ fontSize: fs.sm, color: c.teal }}>See all</Text>
                </TouchableOpacity>
              </View>
              {evs.slice(0, 3).map(function (ev) {
                return (
                  <TouchableOpacity
                    key={ev._id}
                    style={s.ec}
                    onPress={function () {
                      navigation.navigate("EventDetail", { id: ev._id });
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: c.tealLight,
                        marginTop: 6,
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: fs.xs,
                          color: c.tealLight,
                          fontWeight: fw.semi,
                          textTransform: "capitalize",
                        }}
                      >
                        {ev.type ? ev.type.replace("_", " ") : ""}
                      </Text>
                      <Text
                        style={{
                          fontSize: fs.md,
                          fontWeight: fw.medium,
                          color: c.text,
                          marginTop: 2,
                        }}
                      >
                        {ev.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: fs.xs,
                          color: c.textMuted,
                          marginTop: 4,
                        }}
                      >
                        {ev.date || ev.startDate
                          ? format(new Date(ev.date || ev.startDate), "MMM d")
                          : ""}
                        {ev.location ? " · " + ev.location : ""}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Just Added */}
          {rec.length > 0 && (
            <View style={s.sec}>
              <View style={s.sh}>
                <Text style={s.sl}>JUST ADDED</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  paddingHorizontal: sp.lg,
                  gap: sp.xs,
                }}
              >
                {rec.slice(0, 6).map(function (item) {
                  var colW = (W - sp.lg * 2 - sp.xs * 2) / 3;
                  return (
                    <TouchableOpacity
                      key={item._id}
                      style={{ width: colW }}
                      onPress={function () {
                        navigation.navigate("ArtworkDetail", { id: item._id });
                      }}
                    >
                      <Image
                        source={{ uri: item.images?.[0]?.url }}
                        style={{
                          width: colW,
                          aspectRatio: 0.8,
                          borderRadius: rad.sm,
                          backgroundColor: c.surfaceDim,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: fs.xs,
                          fontWeight: fw.medium,
                          color: c.text,
                          marginTop: sp.xs,
                        }}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

var s = StyleSheet.create({
  sec: { marginBottom: sp.xl },
  sh: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: sp.lg,
    marginBottom: sp.md,
  },
  sl: {
    fontSize: fs.xxs,
    letterSpacing: 2,
    color: c.textMuted,
    fontWeight: fw.semi,
  },
  fc: {
    width: FW,
    marginRight: sp.md,
    backgroundColor: c.surface,
    borderRadius: rad.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: c.borderLight,
  },
  fi: { width: FW, height: FW * 1.15, backgroundColor: c.surfaceDim },
  ec: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: sp.md,
    marginHorizontal: sp.lg,
    backgroundColor: c.surface,
    borderRadius: rad.md,
    padding: sp.md,
    marginBottom: sp.sm,
    borderWidth: 1,
    borderColor: c.borderLight,
  },
});