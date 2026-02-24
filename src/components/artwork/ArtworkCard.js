import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors, rad, fs, sp, fw } from "../../constants/theme";
import { formatPrice, formatCount } from "../../utils";
import { haptics } from "../../utils/haptics";

var GAP = 8;
var PAD = 16;
var _w = Dimensions.get("window").width || 390;
export var CARD_WIDTH = (_w - PAD * 2 - GAP) / 2;

export default function ArtworkCard(props) {
  var a = props.artwork;
  if (!a) return null;
  var img = a.images && a.images[0];
  var ratio = img && img.height && img.width ? img.height / img.width : 1.3;
  var imgH = Math.min(Math.max(CARD_WIDTH * ratio, CARD_WIDTH * 0.8), CARD_WIDTH * 1.8);
  var artist = a.artist || a.user || {};

  return (
    <TouchableOpacity onPress={props.onPress} activeOpacity={0.85} style={[s.card, { width: props.width || CARD_WIDTH }, props.style]}>
      <View style={[s.imgWrap, { height: imgH }]}>
        {img ? (
          <Image source={{ uri: img.url || img }} style={s.img} contentFit="cover" transition={300} />
        ) : (
          <View style={s.ph}><Ionicons name="image-outline" size={24} color={colors.textMuted} /></View>
        )}
        {a.forSale && a.price > 0 ? (
          <View style={s.priceBadge}><Text style={s.priceText}>{formatPrice(a.price, a.currency)}</Text></View>
        ) : null}
        {props.onLike ? (
          <TouchableOpacity onPress={function () { haptics.light(); props.onLike(); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={s.likeBtn}>
            <Ionicons name={a.isLiked ? "heart" : "heart-outline"} size={18} color={a.isLiked ? colors.danger : "#FFF"} />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={s.info}>
        <Text style={s.title} numberOfLines={1}>{a.title}</Text>
        <Text style={s.artist} numberOfLines={1}>{artist.name || artist.displayName || ""}</Text>
        {a.likesCount > 0 ? (
          <View style={s.statsRow}>
            <Ionicons name="heart" size={10} color={colors.textMuted} />
            <Text style={s.stats}>{formatCount(a.likesCount)}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

var s = StyleSheet.create({
  card: { marginBottom: GAP },
  imgWrap: { borderRadius: rad.md, overflow: "hidden", backgroundColor: colors.surface },
  img: { width: "100%", height: "100%" },
  ph: { flex: 1, alignItems: "center", justifyContent: "center" },
  priceBadge: { position: "absolute", bottom: 8, left: 8, backgroundColor: "rgba(5,5,5,0.8)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: rad.sm },
  priceText: { color: colors.accent, fontSize: fs.xs, fontWeight: fw.semibold },
  likeBtn: { position: "absolute", top: 8, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(5,5,5,0.45)", alignItems: "center", justifyContent: "center" },
  info: { paddingTop: 6, paddingHorizontal: 2 },
  title: { color: colors.text, fontSize: fs.sm, fontWeight: fw.medium },
  artist: { color: colors.textSecondary, fontSize: fs.xs, marginTop: 1 },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 3 },
  stats: { color: colors.textMuted, fontSize: fs.xs - 1 },
});
