import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors, rad, fs, fw, sp } from "../../constants/theme";
import { formatPrice } from "../../utils";

var ITEM_W = 160;

export default function ArtworkRow(props) {
  function renderItem(item) {
    var a = item.item;
    var img = a.images && a.images[0];
    return (
      <TouchableOpacity style={s.item} activeOpacity={0.85} onPress={function () { if (props.onPress) props.onPress(a); }}>
        <View style={s.imgWrap}>
          {img ? (
            <Image source={{ uri: img.url || img }} style={s.img} contentFit="cover" transition={200} />
          ) : (
            <View style={s.ph}><Ionicons name="image-outline" size={20} color={colors.textMuted} /></View>
          )}
        </View>
        <Text style={s.title} numberOfLines={1}>{a.title}</Text>
        {a.forSale && a.price > 0 ? <Text style={s.price}>{formatPrice(a.price, a.currency)}</Text> : null}
      </TouchableOpacity>
    );
  }

  return (
    <View style={props.style}>
      {props.title ? (
        <View style={s.header}>
          <Text style={s.headerTitle}>{props.title}</Text>
          {props.onSeeAll ? <TouchableOpacity onPress={props.onSeeAll}><Text style={s.seeAll}>See all</Text></TouchableOpacity> : null}
        </View>
      ) : null}
      <FlatList
        horizontal
        data={props.artworks}
        keyExtractor={function (item) { return item._id; }}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.list}
      />
    </View>
  );
}

var s = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: sp.md, marginBottom: sp.sm },
  headerTitle: { fontSize: fs.lg, fontWeight: fw.bold, color: colors.text },
  seeAll: { fontSize: fs.sm, color: colors.accent, fontWeight: fw.medium },
  list: { paddingHorizontal: sp.md, gap: sp.sm },
  item: { width: ITEM_W },
  imgWrap: { width: ITEM_W, height: ITEM_W * 1.2, borderRadius: rad.md, overflow: "hidden", backgroundColor: colors.surface },
  img: { width: "100%", height: "100%" },
  ph: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { color: colors.text, fontSize: fs.sm, fontWeight: fw.medium, marginTop: sp.xs + 2, paddingHorizontal: 2 },
  price: { color: colors.accent, fontSize: fs.xs, marginTop: 2, paddingHorizontal: 2 },
});
