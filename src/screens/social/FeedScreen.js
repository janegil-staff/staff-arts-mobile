import React, { useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Avatar } from "../../components/ui";
import { useFeed } from "../../store/feedStore";
import { useRefresh } from "../../hooks";
import { haptics } from "../../utils/haptics";
import { timeAgo, formatCount } from "../../utils";
import { colors, sp, rad, fs, fw, glassCard } from "../../constants/theme";

export default function FeedScreen({ navigation }) {
  var ins = useSafeAreaInsets();
  var store = useFeed();

  useEffect(function () { store.fetchFeed(true); }, []);

  var refresh = useCallback(function () { return store.fetchFeed(true); }, []);
  var r = useRefresh(refresh);
  var loadMore = useCallback(function () { if (store.hasMore && !store.isLoading) store.fetchFeed(); }, [store.hasMore, store.isLoading]);

  function renderPost(item) {
    var post = item.item;
    var user = post.user || post.author || {};
    return (
      <View style={[s.post, glassCard]}>
        <TouchableOpacity style={s.postHeader} onPress={function () { if (user._id) navigation.navigate("ArtistProfile", { id: user._id }); }}>
          <Avatar name={user.name || user.displayName} imageUrl={user.avatar} size={40} />
          <View style={s.postUserInfo}>
            <Text style={s.postUserName}>{user.name || user.displayName || "User"}</Text>
            <Text style={s.postTime}>{timeAgo(post.createdAt)}</Text>
          </View>
        </TouchableOpacity>

        {post.content ? <Text style={s.postContent}>{post.content}</Text> : null}

        {post.images && post.images.length > 0 ? (
          <Image source={{ uri: post.images[0].url || post.images[0] }} style={s.postImg} contentFit="cover" transition={200} />
        ) : null}

        {post.artwork ? (
          <TouchableOpacity style={s.artworkLink} onPress={function () { navigation.navigate("ArtworkDetail", { id: post.artwork._id || post.artwork }); }}>
            <Ionicons name="image-outline" size={16} color={colors.accent} />
            <Text style={s.artworkLinkTxt}>{post.artwork.title || "View artwork"}</Text>
          </TouchableOpacity>
        ) : null}

        <View style={s.postActions}>
          <TouchableOpacity style={s.postAction} onPress={function () { haptics.light(); store.likePost(post._id); }}>
            <Ionicons name={post.isLiked ? "heart" : "heart-outline"} size={20} color={post.isLiked ? colors.danger : colors.textSecondary} />
            <Text style={s.postActionTxt}>{formatCount(post.likesCount || 0)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.postAction}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
            <Text style={s.postActionTxt}>{formatCount(post.commentsCount || 0)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.postAction}>
            <Ionicons name="share-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.c, { paddingTop: ins.top }]}>
      <FlatList
        data={store.posts}
        keyExtractor={function (item) { return item._id; }}
        renderItem={renderPost}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshing={r.refreshing}
        onRefresh={r.onRefresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={!store.isLoading ? (
          <View style={s.empty}><Text style={s.emptyIcon}>📝</Text><Text style={s.emptyTxt}>No posts yet</Text><Text style={s.emptySub}>Follow artists to see their updates</Text></View>
        ) : null}
      />
    </View>
  );
}

var s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg },
  list: { paddingHorizontal: sp.md, paddingBottom: 100 },
  post: { marginBottom: sp.md, padding: sp.md },
  postHeader: { flexDirection: "row", alignItems: "center", marginBottom: sp.sm },
  postUserInfo: { marginLeft: sp.sm, flex: 1 },
  postUserName: { fontSize: fs.md, fontWeight: fw.semibold, color: colors.text },
  postTime: { fontSize: fs.xs, color: colors.textMuted, marginTop: 1 },
  postContent: { fontSize: fs.md, color: colors.textSecondary, lineHeight: 22, marginBottom: sp.sm },
  postImg: { width: "100%", aspectRatio: 4 / 3, borderRadius: rad.md, marginBottom: sp.sm },
  artworkLink: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: sp.sm },
  artworkLinkTxt: { fontSize: fs.sm, color: colors.accent },
  postActions: { flexDirection: "row", gap: sp.lg, paddingTop: sp.sm, borderTopWidth: 1, borderTopColor: colors.border },
  postAction: { flexDirection: "row", alignItems: "center", gap: 4 },
  postActionTxt: { fontSize: fs.sm, color: colors.textSecondary },
  empty: { alignItems: "center", paddingTop: 100 },
  emptyIcon: { fontSize: 48, marginBottom: sp.md },
  emptyTxt: { fontSize: fs.lg, fontWeight: fw.semibold, color: colors.text },
  emptySub: { fontSize: fs.sm, color: colors.textMuted, marginTop: 4 },
});
