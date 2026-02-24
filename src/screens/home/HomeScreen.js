import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity as T,
  Image,
  StyleSheet as S,
  RefreshControl,
  Dimensions,
  ScrollView,
} from "react-native";
import { artworks, events as evSvc } from "../../services/data";
import { useAuth } from "../../store/authStore";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
import { format } from "date-fns";
var W = Dimensions.get("window").width,
  FW = W * 0.72;
export default function Home({ navigation: n }) {
  var { user } = useAuth();
  var [feat, sF] = useState([]);
  var [rec, sR] = useState([]);
  var [evs, sE] = useState([]);
  var [ref, sRef] = useState(false);
  var load = useCallback(async () => {
    try {
      var [f, r, e] = await Promise.all([
        artworks.list({ featured: true, limit: 10, status: "all" }),
        artworks.list({ sort: "newest", limit: 10, status: "all" }),
        evSvc.list({}),
      ]);
      sF(f.artworks || []);
      sR(r.artworks || []);
      sE(e.events || []);
    } catch (e) {
      console.log(e);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  var hr = new Date().getHours(),
    g = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
  console.log(rec);
 
    return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={ref}
          onRefresh={async () => {
            sRef(true);
            await load();
            sRef(false);
          }}
          tintColor={c.teal}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          paddingHorizontal: sp.lg,
          paddingTop: sp.sm,
          paddingBottom: sp.lg,
        }}
      >
        <Text style={{ fontSize: fs.sm, color: c.textMuted }}>{g},</Text>
        <Text style={{ fontSize: fs.xxl, fontWeight: fw.light, color: c.text }}>
          {user?.displayName?.split(" ")[0] || "there"}
        </Text>
      </View>
      <View style={s.sec}>
        <View style={s.sh}>
          <Text style={s.sl}>CURATED</Text>
          <T onPress={() => n.navigate("Explore")}>
            <Text style={{ fontSize: fs.sm, color: c.teal }}>See all</Text>
          </T>
        </View>
        <FlatList
          data={rec}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={FW + sp.md}
          decelerationRate="fast"
          contentContainerStyle={{ paddingLeft: sp.lg, paddingRight: sp.md }}
          keyExtractor={(i) => i._id}
          renderItem={({ item: i }) => (
            <T
              style={s.fc}
              onPress={() => n.navigate("ArtworkDetail", { id: i._id })}
            >
              <Image source={{ uri: i.images?.[0]?.url }} style={s.fi} />
              <View style={{ padding: sp.md, paddingBottom: sp.xs }}>
                <Text
                  style={{
                    fontSize: fs.md,
                    fontWeight: fw.semi,
                    color: c.text,
                  }}
                  numberOfLines={1}
                >
                  {i.title}
                </Text>
                <Text
                  style={{
                    fontSize: fs.sm,
                    color: c.textSecondary,
                    marginTop: 2,
                  }}
                  numberOfLines={1}
                >
                  {i.artist?.displayName}
                </Text>
              </View>
              {i.price > 0 && (
                <Text
                  style={{
                    paddingHorizontal: sp.md,
                    paddingBottom: sp.md,
                    fontSize: fs.sm,
                    fontWeight: fw.bold,
                    color: c.teal,
                  }}
                >
                  ${i.price.toLocaleString()}
                </Text>
              )}
            </T>
          )}
        />
      </View>
      {evs.length > 0 && (
        <View style={s.sec}>
          <View style={s.sh}>
            <Text style={s.sl}>UPCOMING</Text>
          </View>
          {evs.slice(0, 3).map((e) => (
            <T
              key={e._id}
              style={s.ec}
              onPress={() =>
                n
                  .getParent()
                  ?.navigate("Events", {
                    screen: "EventDetail",
                    params: { event: e },
                  })
              }
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
                  {e.type?.replace("_", " ")}
                </Text>
                <Text
                  style={{
                    fontSize: fs.md,
                    fontWeight: fw.medium,
                    color: c.text,
                    marginTop: 2,
                  }}
                >
                  {e.title}
                </Text>
                <Text
                  style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 4 }}
                >
                  {e.startDate ? format(new Date(e.startDate), "MMM d") : ""}
                  {e.venue?.city ? ` · ${e.venue.city}` : ""}
                </Text>
              </View>
            </T>
          ))}
        </View>
      )}
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
          {rec.slice(0, 6).map((i) => (
            <T
              key={i._id}
              style={{ width: (W - sp.lg * 2 - sp.sm * 2) / 3 }}
              onPress={() => n.navigate("ArtworkDetail", { id: i._id })}
            >
              <Image
                source={{ uri: i.primaryImage }}
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
                {i.title}
              </Text>
            </T>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
var s = S.create({
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
