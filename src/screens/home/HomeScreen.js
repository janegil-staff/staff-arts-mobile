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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { artworks, events as evSvc } from "../../services/data";
import { useAuth } from "../../store/authStore";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
import { format } from "date-fns";

var W = Dimensions.get("window").width;
var FW = W * 0.72;

export default function HomeScreen({ navigation }) {
  var { user } = useAuth();
  var [feat, setFeat] = useState([]);
  var [rec, setRec] = useState([]);
  var [evs, setEvs] = useState([]);
  var [refreshing, setRefreshing] = useState(false);

  var load = useCallback(async function () {
    // Independent try/catch — one failure won't block the others
    try {
      var f = await artworks.list({ featured: true, limit: 10, status: "all" });
      setFeat(f.artworks || f.data?.artworks || []);
    } catch (e) {
      console.log("Home featured error:", e.message);
    }

    try {
      var r = await artworks.list({ sort: "newest", limit: 10, status: "all" });
      setRec(r.artworks || r.data?.artworks || []);
    } catch (e) {
      console.log("Home recent error:", e.message);
    }

    try {
      var ev = await evSvc.list({});
      setEvs(ev.events || ev.data?.events || []);
    } catch (e) {
      console.log("Home events error:", e.message);
    }
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

  var hr = new Date().getHours();
  var greeting =
    hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";

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
                  <Image source={{ uri: item.images?.[0]?.url }} style={s.fi} />
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
                navigation.navigate("Events");
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
              gap: sp.sm,
            }}
          >
            {rec.slice(0, 6).map(function (item) {
              return (
                <TouchableOpacity
                  key={item._id}
                  style={{ width: (W - sp.lg * 2 - sp.sm * 2) / 3 }}
                  onPress={function () {
                    navigation.navigate("ArtworkDetail", { id: item._id });
                  }}
                >
                  <Image
                    source={{ uri: item.images?.[0]?.url }}
                    style={{
                      width: "100%",
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