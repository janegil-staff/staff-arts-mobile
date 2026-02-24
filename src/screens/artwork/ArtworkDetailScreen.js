import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Alert, TextInput as RNTextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Avatar } from "../../components/ui";
import { artworkService } from "../../services/data";
import { useAuth } from "../../store/authStore";
import { haptics } from "../../utils/haptics";
import { formatPrice, timeAgo, formatCount } from "../../utils";
import { colors, sp, rad, fs, fw, glassCard, shadows, screen } from "../../constants/theme";

export default function ArtworkDetailScreen({ navigation, route }) {
  var ins = useSafeAreaInsets();
  var id = route.params && route.params.id;
  var _auth = useAuth(); var me = _auth.user;
  var art = useState(null);
  var artwork = art[0];
  var comments = useState([]);
  var newComment = useState("");
  var liked = useState(false);
  var saved = useState(false);
  var likeCount = useState(0);
  var imgIndex = useState(0);
  var loading = useState(true);

  useEffect(function () {
    if (!id) return;
    artworkService.getById(id).then(function (res) {
      var a = res.data || res;
      art[1](a);
      liked[1](a.isLiked || false);
      saved[1](a.isSaved || false);
      likeCount[1](a.likesCount || 0);
      loading[1](false);
    }).catch(function () { loading[1](false); });

    artworkService.getComments(id).then(function (res) {
      comments[1](res.data || []);
    }).catch(function () {});
  }, [id]);

  function onLike() {
    haptics.light();
    liked[1](!liked[0]);
    likeCount[1](likeCount[0] + (liked[0] ? -1 : 1));
    artworkService.like(id).catch(function () {});
  }

  function onSave() {
    haptics.light();
    saved[1](!saved[0]);
    artworkService.save(id).catch(function () {});
  }

  function onComment() {
    var text = newComment[0].trim();
    if (!text) return;
    artworkService.addComment(id, text).then(function (res) {
      comments[1]([res.data || { content: text, user: me, createdAt: new Date() }].concat(comments[0]));
      newComment[1]("");
    }).catch(function () { Alert.alert("Error", "Failed to post comment"); });
  }

  if (loading[0] || !artwork) {
    return <View style={[s.c, { paddingTop: ins.top }]}><Text style={s.loadTxt}>Loading...</Text></View>;
  }

  var images = artwork.images || [];
  var artist = artwork.artist || artwork.user || {};
  var currentImg = images[imgIndex[0]];

  return (
    <View style={[s.c, { paddingTop: ins.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Image */}
        <View style={s.imgWrap}>
          {currentImg ? (
            <Image source={{ uri: currentImg.url || currentImg }} style={s.img} contentFit="cover" transition={300} />
          ) : (
            <View style={[s.img, s.imgPh]}><Ionicons name="image-outline" size={48} color={colors.textMuted} /></View>
          )}
          {images.length > 1 ? (
            <View style={s.dots}>
              {images.map(function (_, i) {
                return <View key={i} style={[s.dot, i === imgIndex[0] && s.dotActive]} />;
              })}
            </View>
          ) : null}
          <TouchableOpacity style={s.backBtn} onPress={function () { navigation.goBack(); }}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={s.actions}>
          <View style={s.actionsLeft}>
            <TouchableOpacity onPress={onLike} style={s.actionBtn}>
              <Ionicons name={liked[0] ? "heart" : "heart-outline"} size={24} color={liked[0] ? colors.danger : colors.text} />
              <Text style={s.actionNum}>{formatCount(likeCount[0])}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={function () { /* scroll to comments */ }}>
              <Ionicons name="chatbubble-outline" size={22} color={colors.text} />
              <Text style={s.actionNum}>{formatCount(comments[0].length)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn}>
              <Ionicons name="share-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onSave}>
            <Ionicons name={saved[0] ? "bookmark" : "bookmark-outline"} size={24} color={saved[0] ? colors.accent : colors.text} />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={s.info}>
          <Text style={s.title}>{artwork.title}</Text>
          {artwork.year ? <Text style={s.year}>{artwork.year}</Text> : null}
          {artwork.description ? <Text style={s.desc}>{artwork.description}</Text> : null}

          {/* Details chips */}
          <View style={s.tags}>
            {artwork.category ? <View style={s.tag}><Text style={s.tagTxt}>{artwork.category}</Text></View> : null}
            {artwork.medium ? <View style={s.tag}><Text style={s.tagTxt}>{artwork.medium}</Text></View> : null}
            {artwork.style ? <View style={s.tag}><Text style={s.tagTxt}>{artwork.style}</Text></View> : null}
            {artwork.dimensions ? <View style={s.tag}><Text style={s.tagTxt}>{artwork.dimensions}</Text></View> : null}
          </View>
        </View>

        {/* Price / Buy */}
        {artwork.forSale && artwork.price > 0 ? (
          <View style={[s.priceCard, glassCard, shadows.md]}>
            <View>
              <Text style={s.priceLabel}>Price</Text>
              <Text style={s.price}>{formatPrice(artwork.price, artwork.currency)}</Text>
            </View>
            <TouchableOpacity style={s.buyBtn} activeOpacity={0.8}>
              <Text style={s.buyTxt}>Purchase</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Artist */}
        <TouchableOpacity style={[s.artistCard, glassCard]} activeOpacity={0.7} onPress={function () { if (artist._id) navigation.navigate("ArtistProfile", { id: artist._id }); }}>
          <Avatar name={artist.name || artist.displayName} imageUrl={artist.avatar} size={48} />
          <View style={s.artistInfo}>
            <Text style={s.artistName}>{artist.name || artist.displayName || "Artist"}</Text>
            <Text style={s.artistRole}>{artist.role || "Artist"}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Comments */}
        <View style={s.commentsSection}>
          <Text style={s.commentsTitle}>Comments ({comments[0].length})</Text>
          {comments[0].slice(0, 10).map(function (c, i) {
            return (
              <View key={c._id || i} style={s.comment}>
                <Avatar name={c.user && c.user.name} imageUrl={c.user && c.user.avatar} size={32} />
                <View style={s.commentBody}>
                  <Text style={s.commentUser}>{c.user && (c.user.name || c.user.displayName) || "User"}</Text>
                  <Text style={s.commentText}>{c.content}</Text>
                  <Text style={s.commentTime}>{timeAgo(c.createdAt)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Comment input */}
      <View style={[s.commentBar, { paddingBottom: ins.bottom + 8 }]}>
        <RNTextInput style={s.commentInput} placeholder="Add a comment..." placeholderTextColor={colors.textMuted} value={newComment[0]} onChangeText={newComment[1]} />
        <TouchableOpacity onPress={onComment} disabled={!newComment[0].trim()}>
          <Ionicons name="send" size={22} color={newComment[0].trim() ? colors.accent : colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

var _wd2 = Dimensions.get("window") || {};
var W = _wd2.width || 390;
var s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg },
  loadTxt: { color: colors.textMuted, textAlign: "center", marginTop: 100, fontSize: fs.md },
  imgWrap: { width: W, aspectRatio: 3 / 4, backgroundColor: colors.surface },
  img: { width: "100%", height: "100%" },
  imgPh: { alignItems: "center", justifyContent: "center" },
  dots: { position: "absolute", bottom: 12, alignSelf: "center", flexDirection: "row", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)" },
  dotActive: { backgroundColor: colors.accent, width: 18 },
  backBtn: { position: "absolute", top: 12, left: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(11,17,32,0.6)", alignItems: "center", justifyContent: "center" },

  actions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: sp.md, paddingVertical: sp.md },
  actionsLeft: { flexDirection: "row", gap: sp.lg },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionNum: { color: colors.textSecondary, fontSize: fs.sm },

  info: { paddingHorizontal: sp.md },
  title: { fontSize: fs.xxl, fontWeight: fw.bold, color: colors.text },
  year: { fontSize: fs.sm, color: colors.textMuted, marginTop: 2 },
  desc: { fontSize: fs.md, color: colors.textSecondary, lineHeight: 22, marginTop: sp.sm },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: sp.sm, marginTop: sp.md },
  tag: { backgroundColor: colors.accentMuted, paddingHorizontal: sp.sm + 2, paddingVertical: 4, borderRadius: rad.full },
  tagTxt: { fontSize: fs.xs, color: colors.accent },

  priceCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: sp.md, marginTop: sp.md, padding: sp.md },
  priceLabel: { fontSize: fs.xs, color: colors.textMuted },
  price: { fontSize: fs.xxl, fontWeight: fw.bold, color: colors.text, marginTop: 2 },
  buyBtn: { backgroundColor: colors.accent, paddingHorizontal: sp.xl, paddingVertical: sp.sm + 2, borderRadius: rad.md },
  buyTxt: { color: colors.textInverse, fontWeight: fw.semibold, fontSize: fs.md },

  artistCard: { flexDirection: "row", alignItems: "center", marginHorizontal: sp.md, marginTop: sp.md, padding: sp.md },
  artistInfo: { flex: 1, marginLeft: sp.md },
  artistName: { fontSize: fs.md, fontWeight: fw.semibold, color: colors.text },
  artistRole: { fontSize: fs.sm, color: colors.textMuted, marginTop: 1 },

  commentsSection: { paddingHorizontal: sp.md, marginTop: sp.lg },
  commentsTitle: { fontSize: fs.lg, fontWeight: fw.bold, color: colors.text, marginBottom: sp.md },
  comment: { flexDirection: "row", marginBottom: sp.md, gap: sp.sm },
  commentBody: { flex: 1 },
  commentUser: { fontSize: fs.sm, fontWeight: fw.semibold, color: colors.text },
  commentText: { fontSize: fs.sm, color: colors.textSecondary, marginTop: 2, lineHeight: 20 },
  commentTime: { fontSize: fs.xs, color: colors.textMuted, marginTop: 4 },

  commentBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: sp.md, paddingTop: sp.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg, gap: sp.sm },
  commentInput: { flex: 1, backgroundColor: colors.surface, borderRadius: rad.full, paddingHorizontal: sp.md, paddingVertical: sp.sm, color: colors.text, fontSize: fs.md },
});
