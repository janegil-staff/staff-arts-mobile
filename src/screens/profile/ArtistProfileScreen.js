import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Avatar, Button } from "../../components/ui";
import ArtworkCard from "../../components/artwork/ArtworkCard";
import { userService } from "../../services/data";
import { useAuth } from "../../store/authStore";
import { haptics } from "../../utils/haptics";
import { formatCount } from "../../utils";
import { colors, sp, rad, fs, fw, glassCard, shadows, screen } from "../../constants/theme";

export default function ArtistProfileScreen({ navigation, route }) {
  var ins = useSafeAreaInsets();
  var id = route.params && route.params.id;
  var _auth = useAuth(); var me = _auth.user;
  var profile = useState(null);
  var artworks = useState([]);
  var following = useState(false);
  var loading = useState(true);
  var artPage = useState(1);

  useEffect(function () {
    if (!id) return;
    userService.getById(id).then(function (res) {
      var u = res.data || res;
      profile[1](u);
      following[1](u.isFollowing || false);
      loading[1](false);
    }).catch(function () { loading[1](false); });

    userService.getArtworks(id, 1).then(function (res) {
      artworks[1](res.data || []);
    }).catch(function () {});
  }, [id]);

  function onFollow() {
    haptics.light();
    following[1](!following[0]);
    var p = profile[0];
    if (p) {
      profile[1]({ ...p, followersCount: (p.followersCount || 0) + (following[0] ? -1 : 1) });
    }
    userService.follow(id).catch(function () {});
  }

  function onMessage() {
    navigation.navigate("Messages");
  }

  function loadMoreArt() {
    var nextPage = artPage[0] + 1;
    userService.getArtworks(id, nextPage).then(function (res) {
      var list = res.data || [];
      if (list.length > 0) {
        artworks[1](artworks[0].concat(list));
        artPage[1](nextPage);
      }
    }).catch(function () {});
  }

  if (loading[0] || !profile[0]) {
    return <View style={[s.c, { paddingTop: ins.top }]}><Text style={s.loadTxt}>Loading...</Text></View>;
  }

  var user = profile[0];
  var isMe = me && me._id === id;

  function renderHeader() {
    return (
      <View>
        {/* Cover */}
        <View style={s.cover}>
          {user.coverImage ? (
            <Image source={{ uri: user.coverImage }} style={s.coverImg} contentFit="cover" />
          ) : (
            <View style={[s.coverImg, { backgroundColor: colors.elevated }]} />
          )}
        </View>

        {/* Avatar + Actions */}
        <View style={s.profileRow}>
          <View style={s.avatarOuter}>
            <Avatar name={user.name || user.displayName} imageUrl={user.avatar} size={80} />
          </View>
          {!isMe ? (
            <View style={s.actionBtns}>
              <TouchableOpacity style={[s.followBtn, following[0] && s.followBtnOn]} onPress={onFollow}>
                <Text style={[s.followTxt, following[0] && s.followTxtOn]}>{following[0] ? "Following" : "Follow"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.msgBtn} onPress={onMessage}>
                <Ionicons name="chatbubble-outline" size={18} color={colors.accent} />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Info */}
        <View style={s.info}>
          <Text style={s.name}>{user.name || user.displayName}</Text>
          {user.username ? <Text style={s.username}>@{user.username}</Text> : null}
          {user.bio ? <Text style={s.bio}>{user.bio}</Text> : null}

          <View style={s.metaRow}>
            {user.location ? (
              <View style={s.meta}><Ionicons name="location-outline" size={14} color={colors.textMuted} /><Text style={s.metaTxt}>{user.location}</Text></View>
            ) : null}
            {user.website ? (
              <View style={s.meta}><Ionicons name="link-outline" size={14} color={colors.accent} /><Text style={[s.metaTxt, { color: colors.accent }]}>{user.website}</Text></View>
            ) : null}
          </View>

          {/* Stats */}
          <View style={[s.stats, glassCard]}>
            <View style={s.stat}><Text style={s.statNum}>{formatCount(user.followersCount || 0)}</Text><Text style={s.statLabel}>Followers</Text></View>
            <View style={s.statDiv} />
            <View style={s.stat}><Text style={s.statNum}>{formatCount(user.followingCount || 0)}</Text><Text style={s.statLabel}>Following</Text></View>
            <View style={s.statDiv} />
            <View style={s.stat}><Text style={s.statNum}>{formatCount(artworks[0].length)}</Text><Text style={s.statLabel}>Works</Text></View>
          </View>

          {/* Tags */}
          {user.mediums && user.mediums.length > 0 ? (
            <View style={s.tagsRow}>
              {user.mediums.map(function (m) { return <View key={m} style={s.tag}><Text style={s.tagTxt}>{m}</Text></View>; })}
            </View>
          ) : null}

          <Text style={s.sectionTitle}>Artworks</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.c, { paddingTop: ins.top }]}>
      <FlatList
        data={artworks[0]}
        keyExtractor={function (item) { return item._id; }}
        numColumns={2}
        columnWrapperStyle={s.gridRow}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreArt}
        onEndReachedThreshold={0.5}
        renderItem={function (item) {
          return <ArtworkCard artwork={item.item} onPress={function () { navigation.navigate("ArtworkDetail", { id: item.item._id }); }} />;
        }}
        ListEmptyComponent={!loading[0] ? <Text style={s.noArt}>No artworks yet</Text> : null}
      />
    </View>
  );
}

var s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg },
  loadTxt: { color: colors.textMuted, textAlign: "center", marginTop: 100, fontSize: fs.md },
  cover: { width: "100%", height: 160, backgroundColor: colors.surface },
  coverImg: { width: "100%", height: "100%" },
  profileRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: sp.md, marginTop: -40 },
  avatarOuter: { borderWidth: 3, borderColor: colors.bg, borderRadius: 43 },
  actionBtns: { flexDirection: "row", gap: sp.sm, paddingBottom: sp.sm },
  followBtn: { backgroundColor: colors.accent, paddingHorizontal: sp.lg, paddingVertical: sp.sm, borderRadius: rad.md },
  followBtnOn: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.accent },
  followTxt: { fontSize: fs.sm, fontWeight: fw.semibold, color: colors.textInverse },
  followTxtOn: { color: colors.accent },
  msgBtn: { width: 36, height: 36, borderRadius: rad.md, borderWidth: 1.5, borderColor: colors.accent, alignItems: "center", justifyContent: "center" },

  info: { paddingHorizontal: sp.md, marginTop: sp.sm },
  name: { fontSize: fs.xl, fontWeight: fw.bold, color: colors.text },
  username: { fontSize: fs.sm, color: colors.textMuted, marginTop: 2 },
  bio: { fontSize: fs.md, color: colors.textSecondary, lineHeight: 22, marginTop: sp.sm },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: sp.md, marginTop: sp.sm },
  meta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaTxt: { fontSize: fs.sm, color: colors.textMuted },

  stats: { flexDirection: "row", marginTop: sp.md, paddingVertical: sp.md },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: fs.xl, fontWeight: fw.bold, color: colors.text },
  statLabel: { fontSize: fs.xs, color: colors.textMuted, marginTop: 2 },
  statDiv: { width: 1, height: 32, backgroundColor: colors.border },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: sp.sm, marginTop: sp.md },
  tag: { backgroundColor: colors.accentMuted, paddingHorizontal: sp.sm + 2, paddingVertical: 3, borderRadius: rad.full },
  tagTxt: { fontSize: fs.xs, color: colors.accent },

  sectionTitle: { fontSize: fs.lg, fontWeight: fw.bold, color: colors.text, marginTop: sp.lg, marginBottom: sp.md },
  list: { paddingBottom: 100 },
  gridRow: { paddingHorizontal: sp.md, gap: 8 },
  noArt: { textAlign: "center", color: colors.textMuted, fontSize: fs.md, paddingHorizontal: sp.md },
});
