import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import Avatar from "../ui/Avatar";
import { colors, fs, fw, sp } from "../../constants/theme";

export default function UserRow(props) {
  function renderItem(item) {
    var u = item.item;
    return (
      <TouchableOpacity style={s.item} activeOpacity={0.8} onPress={function () { if (props.onPress) props.onPress(u); }}>
        <Avatar name={u.name || u.displayName} imageUrl={u.avatar} size={64} />
        <Text style={s.name} numberOfLines={1}>{u.name || u.displayName}</Text>
        {u.role ? <Text style={s.role}>{u.role}</Text> : null}
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
        data={props.users}
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
  list: { paddingHorizontal: sp.md, gap: sp.md },
  item: { alignItems: "center", width: 76 },
  name: { color: colors.text, fontSize: fs.xs, fontWeight: fw.medium, marginTop: sp.xs + 2, textAlign: "center" },
  role: { color: colors.textMuted, fontSize: fs.xs - 1, marginTop: 1 },
});
