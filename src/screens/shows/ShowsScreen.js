import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity as T,
  Image,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  events as evSvc,
  exhibitions as exSvc,
  music as muSvc,
} from "../../services/data";
import { useAuth } from "../../store/authStore";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
import { format } from "date-fns";

// ── Type configs ──

var TYPE_CONFIG = {
  event: { icon: "📅", label: "Event", color: "#2dd4a0", bg: "#0d3b2e" },
  exhibition: { icon: "🖼️", label: "Exhibition", color: "#60a5fa", bg: "#1e2d4a" },
  music: { icon: "🎵", label: "Music", color: "#c084fc", bg: "#2d1b4e" },
};

// ── Slim Row ──

function ShowRow({ item, onPress }) {
  var cfg = TYPE_CONFIG[item._type] || TYPE_CONFIG.event;
  var img = item.coverImage?.url || item.artwork?.url || null;

  return (
    <T style={s.row} onPress={onPress} activeOpacity={0.7}>
      {img ? (
        <Image source={{ uri: img }} style={s.rowImg} />
      ) : (
        <View style={[s.rowImg, { backgroundColor: cfg.bg, alignItems: "center", justifyContent: "center" }]}>
          <Text style={{ fontSize: 16 }}>{cfg.icon}</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
          <View style={[s.typeDot, { backgroundColor: cfg.color }]} />
          <Text style={s.rowMeta}>
            {cfg.label}
            {item._dateStr ? "  ·  " + item._dateStr : ""}
            {item._location ? "  ·  " + item._location : ""}
          </Text>
        </View>
      </View>
      {item.isFree ? (
        <View style={s.freeTag}>
          <Text style={s.freeText}>Free</Text>
        </View>
      ) : null}
      <Text style={{ color: c.textMuted, fontSize: fs.sm, marginLeft: sp.sm }}>›</Text>
    </T>
  );
}

// ── Main Screen ──

export default function ShowsScreen({ navigation }) {
  var { ok } = useAuth();
  var [items, setItems] = useState([]);
  var [loading, setLoading] = useState(true);
  var [refreshing, setRefreshing] = useState(false);

  var load = useCallback(async function () {
    var all = [];

    try {
      var ev = await evSvc.list({});
      var evList = ev.events || ev.data?.events || [];
      evList.forEach(function (e) {
        var d = e.date || e.startDate;
        all.push({
          ...e,
          _type: "event",
          _sortDate: d ? new Date(d).getTime() : 0,
          _dateStr: d ? format(new Date(d), "MMM d") : "",
          _location: e.location || "",
        });
      });
    } catch (e) {
      console.log("Shows events error:", e.message);
    }

    try {
      var ex = await exSvc.list({});
      var exList = ex.exhibitions || ex.data?.exhibitions || [];
      exList.forEach(function (e) {
        var d = e.startDate;
        all.push({
          ...e,
          _type: "exhibition",
          _sortDate: d ? new Date(d).getTime() : 0,
          _dateStr: d ? format(new Date(d), "MMM d") + (e.endDate ? " – " + format(new Date(e.endDate), "MMM d") : "") : "",
          _location: e.location || "",
        });
      });
    } catch (e) {
      console.log("Shows exhibitions error:", e.message);
    }

    try {
      var mu = await muSvc.list({});
      var muList = mu.tracks || mu.data?.tracks || mu.songs || mu.data?.songs || [];
      muList.forEach(function (t) {
        var d = t.createdAt || t.releaseDate;
        all.push({
          ...t,
          _type: "music",
          _sortDate: d ? new Date(d).getTime() : 0,
          _dateStr: d ? format(new Date(d), "MMM d") : "",
          _location: t.artist?.displayName || t.artist?.name || "",
        });
      });
    } catch (e) {
      console.log("Shows music error:", e.message);
    }

    // Sort newest first
    all.sort(function (a, b) {
      return b._sortDate - a._sortDate;
    });

    setItems(all);
    setLoading(false);
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

  function handleCreateShow() {
    if (!ok) {
      navigation.navigate("Profile");
      return;
    }
    navigation.navigate("CreateShow");
  }

  function handleItemPress(item) {
    if (item._type === "event") {
      navigation.navigate("EventDetail", { id: item._id });
    } else if (item._type === "exhibition") {
      navigation.navigate("ExhibitionDetail", { id: item._id });
    } else if (item._type === "music") {
      navigation.navigate("Music");
    }
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={c.teal} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        style={{ flex: 1 }}
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
        {/* ── Nav Buttons ── */}
        <View style={s.navRow}>
          <T
            style={s.navBtn}
            onPress={function () {
              navigation.navigate("Events");
            }}
          >
            <Text style={s.navIcon}>📅</Text>
            <Text style={s.navLabel}>Events</Text>
          </T>
          <T
            style={s.navBtn}
            onPress={function () {
              navigation.navigate("Exhibitions");
            }}
          >
            <Text style={s.navIcon}>🖼️</Text>
            <Text style={s.navLabel}>Exhibitions</Text>
          </T>
          <T
            style={s.navBtn}
            onPress={function () {
              navigation.navigate("Music");
            }}
          >
            <Text style={s.navIcon}>🎵</Text>
            <Text style={s.navLabel}>Music</Text>
          </T>
        </View>

        {/* ── Combined Timeline ── */}
        {items.length > 0 ? (
          <View style={{ paddingHorizontal: sp.md }}>
            <Text style={s.timelineLabel}>UPCOMING & RECENT</Text>
            {items.map(function (item) {
              return (
                <ShowRow
                  key={item._type + "-" + item._id}
                  item={item}
                  onPress={function () {
                    handleItemPress(item);
                  }}
                />
              );
            })}
          </View>
        ) : (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: sp.md }}>🎭</Text>
            <Text style={{ fontSize: fs.lg, color: c.textSecondary }}>
              No shows yet
            </Text>
            <Text style={{ fontSize: fs.sm, color: c.textMuted, marginTop: sp.sm }}>
              Create an event, exhibition, or upload music
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Floating Create Button ── */}
      <T style={s.fab} onPress={handleCreateShow} activeOpacity={0.85}>
        <View style={s.fabInner}>
          <Text style={s.fabPlus}>+</Text>
          <Text style={s.fabLabel}>New Show</Text>
        </View>
      </T>
    </View>
  );
}

// ── Styles ──

var s = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: c.bg,
  },

  // Nav buttons
  navRow: {
    flexDirection: "row",
    gap: sp.sm,
    paddingHorizontal: sp.lg,
    paddingVertical: sp.md,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  navBtn: {
    flex: 1,
    backgroundColor: c.surface,
    borderRadius: rad.md,
    borderWidth: 1,
    borderColor: c.borderLight,
    paddingVertical: sp.md,
    alignItems: "center",
    gap: 4,
  },
  navIcon: { fontSize: 20 },
  navLabel: {
    fontSize: fs.xs,
    color: c.textSecondary,
    fontWeight: fw.medium,
  },

  // Timeline
  timelineLabel: {
    fontSize: fs.xxs,
    letterSpacing: 2,
    color: c.textMuted,
    fontWeight: fw.semi,
    marginTop: sp.lg,
    marginBottom: sp.sm,
    paddingHorizontal: sp.sm,
  },

  // Slim row
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: sp.md,
    paddingVertical: sp.md,
    paddingHorizontal: sp.sm,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  rowImg: {
    width: 48,
    height: 48,
    borderRadius: rad.sm,
  },
  rowTitle: {
    fontSize: fs.md,
    fontWeight: fw.medium,
    color: c.text,
  },
  rowMeta: {
    fontSize: fs.xs,
    color: c.textMuted,
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  freeTag: {
    borderWidth: 1,
    borderColor: c.tealLight,
    borderRadius: rad.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  freeText: {
    fontSize: 9,
    color: c.tealLight,
    fontWeight: fw.semi,
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    zIndex: 10,
  },
  fabInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: c.teal,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: rad.full,
    shadowColor: c.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabPlus: {
    fontSize: 20,
    fontWeight: "700",
    color: c.textInverse,
    marginTop: -1,
  },
  fabLabel: {
    fontSize: fs.sm,
    fontWeight: fw.bold,
    color: c.textInverse,
    letterSpacing: 0.3,
  },
});