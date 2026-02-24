import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "../ui/Avatar";
import { colors, sp, rad, fs, fw, glassCard } from "../../constants/theme";
import { timeAgo, formatCount } from "../../utils";
import { haptics } from "../../utils/haptics";

export default function PostCard(props) {
  var post = props.post;
  if (!post) return null;
  var user = post.user || post.author || {};

  return (
    <View style={[s.card, glassCard, props.style]}>
      {/* Header */}
      <TouchableOpacity style={s.header} activeOpacity={0.7} onPress={function () { if (props.onUserPress) props.onUserPress(user); }}>
        <Avatar name={user.name || user.displayName} imageUrl={user.avatar} size={40} />
        <View style={s.userInfo}>
          <Text style={s.userName}>{user.name || user.displayName || "User"}</Text>
          <Text style={s.time}>{timeAgo(post.createdAt)}</Text>
        </View>
      </TouchableOpacity>

      {/* Content */}
      {post.content ? <Text style={s.content}>{post.content}</Text> : null}

      {/* Image */}
      {post.images && post.images.length > 0 ? (
        <Image source={{ uri: post.images[0].url || post.images[0] }} style={s.image} contentFit="cover" transition={200} />
      ) : null}

      {/* Artwork link */}
      {post.artwork && post.artwork.title ? (
        <TouchableOpacity style={s.artworkLink} onPress={function () { if (props.onArtworkPress) props.onArtworkPress(post.artwork); }}>
          <Ionicons name="image-outline" size={16} color={colors.accent} />
          <Text style={s.artworkTxt}>{post.artwork.title}</Text>
        </TouchableOpacity>
      ) : null}

      {/* Actions */}
      <View style={s.actions}>
        <TouchableOpacity style={s.action} onPress={function () { haptics.light(); if (props.onLike) props.onLike(); }}>
          <Ionicons name={post.isLiked ? "heart" : "heart-outline"} size={20} color={post.isLiked ? colors.danger : colors.textSecondary} />
          <Text style={s.actionTxt}>{formatCount(post.likesCount || 0)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.action} onPress={function () { if (props.onComment) props.onComment(); }}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
          <Text style={s.actionTxt}>{formatCount(post.commentsCount || 0)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.action} onPress={function () { if (props.onShare) props.onShare(); }}>
          <Ionicons name="share-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

var s = StyleSheet.create({
  card: { padding: sp.md, marginBottom: sp.md },
  header: { flexDirection: "row", alignItems: "center", marginBottom: sp.sm },
  userInfo: { marginLeft: sp.sm, flex: 1 },
  userName: { fontSize: fs.md, fontWeight: fw.semibold, color: colors.text },
  time: { fontSize: fs.xs, color: colors.textMuted, marginTop: 1 },
  content: { fontSize: fs.md, color: colors.textSecondary, lineHeight: 22, marginBottom: sp.sm },
  image: { width: "100%", aspectRatio: 4 / 3, borderRadius: rad.md, marginBottom: sp.sm },
  artworkLink: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: sp.sm },
  artworkTxt: { fontSize: fs.sm, color: colors.accent },
  actions: { flexDirection: "row", gap: sp.lg, paddingTop: sp.sm, borderTopWidth: 1, borderTopColor: colors.border },
  action: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionTxt: { fontSize: fs.sm, color: colors.textSecondary },
});
