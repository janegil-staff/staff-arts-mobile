import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity as T,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { posts } from "../../services/data";
import { useAuth } from "../../store/authStore";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
import { formatDistanceToNow } from "date-fns";

export default function Feed({ navigation: n }) {
  var { ok } = useAuth();
  var [data, sD] = useState([]);
  var [ld, sL] = useState(true);

  useEffect(function () {
    (async function () {
      try {
        var d = await posts.list();
        sD(d.posts || []);
      } catch (e) {}
      sL(false);
    })();
  }, []);

  var onLike = async function (id, i) {
    try {
      var r = await posts.like(id);
      var u = data.slice();
      u[i] = Object.assign({}, u[i], {
        _lk: r.liked,
        likes: r.liked
          ? (u[i].likes || []).concat("x")
          : (u[i].likes || []).slice(0, -1),
      });
      sD(u);
    } catch (e) {}
  };

  function handleCreateShow() {
    if (!ok) {
      n.navigate("Profile");
      return;
    }
    n.navigate("CreateShow");
  }

  if (ld) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={c.teal} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <FlatList
        style={{ flex: 1 }}
        data={data}
        keyExtractor={function (i) {
          return i._id;
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <View style={s.navRow}>
            <T
              style={s.navBtn}
              onPress={function () {
                n.navigate("Events");
              }}
            >
              <Text style={s.navIcon}>📅</Text>
              <Text style={s.navLabel}>Events</Text>
            </T>
            <T
              style={s.navBtn}
              onPress={function () {
                n.navigate("Exhibitions");
              }}
            >
              <Text style={s.navIcon}>🖼️</Text>
              <Text style={s.navLabel}>Exhibitions</Text>
            </T>
            <T
              style={s.navBtn}
              onPress={function () {
                n.navigate("Music");
              }}
            >
              <Text style={s.navIcon}>🎵</Text>
              <Text style={s.navLabel}>Music</Text>
            </T>
          </View>
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: sp.md }}>🎭</Text>
            <Text style={{ fontSize: fs.lg, color: c.textSecondary }}>
              No posts yet
            </Text>
          </View>
        }
        renderItem={function ({ item: i, index: idx }) {
          var a = i.authorId || i.author;
          return (
            <View style={s.post}>
              <T
                style={s.authorRow}
                onPress={function () {
                  if (a?.username)
                    n.navigate("ArtistProfile", { username: a.username });
                }}
              >
                {a?.avatar ? (
                  <Image source={{ uri: a.avatar }} style={s.avatar} />
                ) : (
                  <View style={[s.avatar, { backgroundColor: c.surfaceDim }]} />
                )}
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: sp.sm,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: fs.md,
                        fontWeight: fw.semi,
                        color: c.text,
                      }}
                    >
                      {a?.displayName || "Unknown"}
                    </Text>
                    {a?.role === "artist" && (
                      <View style={s.badge}>
                        <Text style={s.badgeText}>ARTIST</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: fs.xs,
                      color: c.textMuted,
                      marginTop: 2,
                    }}
                  >
                    {formatDistanceToNow(new Date(i.createdAt), {
                      addSuffix: true,
                    })}
                  </Text>
                </View>
              </T>

              {i.content ? <Text style={s.content}>{i.content}</Text> : null}

              {i.images?.length > 0 ? (
                <Image
                  source={{ uri: i.images[0]?.url || i.images[0] }}
                  style={s.postImage}
                />
              ) : null}

              <View style={{ flexDirection: "row", gap: sp.xl }}>
                <T
                  onPress={function () {
                    onLike(i._id, idx);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: sp.xs,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color: i._lk ? c.error : c.textMuted,
                    }}
                  >
                    {i._lk ? "♥" : "♡"}
                  </Text>
                  <Text style={{ fontSize: fs.sm, color: c.textMuted }}>
                    {i.likesCount || i.likes?.length || 0}
                  </Text>
                </T>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: sp.xs,
                  }}
                >
                  <Text style={{ fontSize: 18, color: c.textMuted }}>💬</Text>
                  <Text style={{ fontSize: fs.sm, color: c.textMuted }}>
                    {i.commentsCount || i.comments?.length || 0}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Floating Create Show Button */}
      <T style={s.fab} onPress={handleCreateShow} activeOpacity={0.85}>
        <View style={s.fabInner}>
          <Text style={s.fabPlus}>+</Text>
          <Text style={s.fabLabel}>New Show</Text>
        </View>
      </T>
    </View>
  );
}

var s = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: c.bg,
  },
  // Quick nav row
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
  // Post
  post: {
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
    paddingVertical: sp.lg,
    paddingHorizontal: sp.lg,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: sp.md,
    marginBottom: sp.md,
  },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  badge: {
    backgroundColor: c.tealBg,
    borderRadius: rad.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 8,
    color: c.teal,
    fontWeight: fw.bold,
  },
  content: {
    fontSize: fs.md,
    color: c.text,
    lineHeight: 23,
    marginBottom: sp.md,
  },
  postImage: {
    width: "100%",
    height: 260,
    borderRadius: rad.md,
    backgroundColor: c.surfaceDim,
    marginBottom: sp.md,
  },
  // Floating action button
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
