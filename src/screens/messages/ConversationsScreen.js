// screens/messages/ConversationsScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
import { useAuth } from "../../store/authStore";
import { API_URL } from "../../constants/api";
import * as SecureStore from "expo-secure-store";
import socket from "../../services/socket";

async function authFetch(url, opts = {}) {
  var token = await SecureStore.getItemAsync("token");
  var headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (token) headers.Authorization = "Bearer " + token;
  return fetch(url, { ...opts, headers });
}

export default function ConversationsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();

      // Poll every 5 seconds for updates while screen is focused
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    }, [])
  );

  // Listen for new messages to update conversation list in real-time
  useEffect(() => {
    function handleNewMessage(message) {
      setConversations((prev) => {
        const convId = message.conversation || message.conversationId;
        const exists = prev.find((c) => c._id === convId);

        if (exists) {
          const updated = prev.map((conv) => {
            if (conv._id === convId) {
              const senderId = message.sender?._id || message.sender || message.senderId;
              const isFromOther = senderId !== userId;
              return {
                ...conv,
                lastMessage: message.content || message.text || conv.lastMessage,
                lastMessageAt: message.createdAt || new Date().toISOString(),
                unreadCount: isFromOther ? (conv.unreadCount || 0) + 1 : conv.unreadCount,
              };
            }
            return conv;
          });
          return updated.sort(
            (a, b) => new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt)
          );
        }

        // New conversation — refetch to get full data
        fetchConversations();
        return prev;
      });
    }

    socket.on("receive-message", handleNewMessage);
    return () => socket.off("receive-message", handleNewMessage);
  }, [userId]);

  async function fetchConversations() {
    try {
      const res = await authFetch(API_URL + "/api/messages/conversations");
      const json = await res.json();
      const data = json.data || json;
      const convs = Array.isArray(data) ? data : [];
      setConversations(convs);

      // Join all conversation rooms so we get real-time updates
      convs.forEach((conv) => {
        socket.emit("join", conv._id);
      });
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query) {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await authFetch(API_URL + "/api/users?search=" + encodeURIComponent(query));
      const json = await res.json();
      const data = json.data || json.users || json;
      const filtered = (Array.isArray(data) ? data : []).filter(
        (u) => (u._id || u.id) !== userId
      );
      setSearchResults(filtered);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  function startChatWithUser(otherUser) {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    navigation.navigate("Chat", {
      conversationId: null,
      participantId: otherUser._id || otherUser.id,
      name: otherUser.displayName || otherUser.name || otherUser.username,
    });
  }

  function getOtherParticipant(convo) {
    return convo.participants?.find((p) => (p._id || p.id) !== userId) || {};
  }

  function renderConversation({ item }) {
    const other = getOtherParticipant(item);
    const lastText = item.lastMessage || "";
    const unread = item.unreadCount || 0;

    return (
      <TouchableOpacity
        style={s.row}
        onPress={() =>
          navigation.navigate("Chat", {
            conversationId: item._id,
            participantId: other._id || other.id,
            name: other.displayName || other.name || "Unknown",
          })
        }
        activeOpacity={0.7}
      >
        <View style={s.avatarWrap}>
          {other.avatar ? (
            <Image source={{ uri: other.avatar }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, s.avatarFallback]}>
              <Text style={s.avatarText}>
                {(other.displayName || other.name || "?")[0].toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={s.content}>
          <View style={s.topRow}>
            <Text style={[s.name, unread > 0 && { color: c.text, fontWeight: fw.bold }]} numberOfLines={1}>
              {other.displayName || other.name || "Unknown"}
            </Text>
            <Text style={s.time}>
              {formatRelativeTime(item.lastMessageAt || item.updatedAt)}
            </Text>
          </View>
          <View style={s.bottomRow}>
            <Text style={[s.preview, unread > 0 && s.previewUnread]} numberOfLines={1}>
              {lastText || "No messages yet"}
            </Text>
            {unread > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{unread > 99 ? "99+" : unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  function renderSearchResult({ item }) {
    return (
      <TouchableOpacity
        style={s.row}
        onPress={() => startChatWithUser(item)}
        activeOpacity={0.7}
      >
        <View style={s.avatarWrap}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, s.avatarFallback]}>
              <Text style={s.avatarText}>
                {(item.displayName || item.name || "?")[0].toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={s.content}>
          <Text style={s.name} numberOfLines={1}>
            {item.displayName || item.name}
          </Text>
          {item.username && (
            <Text style={s.preview}>@{item.username}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={c.teal} size="large" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      {!showSearch && (
        <TouchableOpacity
          style={s.newMsgBtn}
          onPress={() => setShowSearch(true)}
          activeOpacity={0.7}
        >
          <Text style={s.newMsgIcon}>✏️</Text>
          <Text style={s.newMsgText}>New Message</Text>
        </TouchableOpacity>
      )}

      {showSearch && (
        <View style={s.searchBar}>
          <TextInput
            style={s.searchInput}
            placeholder="Search by name or username..."
            placeholderTextColor={c.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          <TouchableOpacity
            onPress={() => {
              setShowSearch(false);
              setSearchQuery("");
              setSearchResults([]);
            }}
            style={s.cancelBtn}
          >
            <Text style={s.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {showSearch ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item._id}
          renderItem={renderSearchResult}
          contentContainerStyle={searchResults.length === 0 ? s.emptyList : undefined}
          ListEmptyComponent={
            searching ? (
              <ActivityIndicator color={c.teal} style={{ marginTop: 40 }} />
            ) : searchQuery.length >= 2 ? (
              <Text style={[s.emptyText, { marginTop: 40 }]}>No users found</Text>
            ) : (
              <Text style={[s.emptyText, { marginTop: 40 }]}>Type at least 2 characters to search</Text>
            )
          }
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={renderConversation}
          contentContainerStyle={conversations.length === 0 ? s.emptyList : undefined}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Text style={{ fontSize: 40, marginBottom: sp.md }}>💬</Text>
              <Text style={{ fontSize: fs.lg, color: c.textSecondary }}>No conversations yet</Text>
              <Text style={{ fontSize: fs.sm, color: c.textMuted, marginTop: sp.xs }}>
                Start a conversation by tapping ✏️ above
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "now";
  if (diff < 3600) return Math.floor(diff / 60) + "m";
  if (diff < 86400) return Math.floor(diff / 3600) + "h";
  if (diff < 604800) return Math.floor(diff / 86400) + "d";
  return d.toLocaleDateString();
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyList: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  newMsgBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: c.surface,
    borderRadius: rad.md,
    borderWidth: 1,
    borderColor: c.borderLight,
  },
  newMsgIcon: { fontSize: 16 },
  newMsgText: { fontSize: fs.sm, fontWeight: fw.semi, color: c.teal },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  searchInput: {
    flex: 1,
    backgroundColor: c.surface,
    borderRadius: rad.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: fs.sm,
    color: c.text,
    borderWidth: 1,
    borderColor: c.borderLight,
  },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 4 },
  cancelText: { fontSize: fs.sm, color: c.teal, fontWeight: fw.semi },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  avatarWrap: { marginRight: 14 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarFallback: {
    backgroundColor: c.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: fw.bold, color: c.teal },
  content: { flex: 1 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: { fontSize: fs.sm, fontWeight: fw.semi, color: c.text, flex: 1, marginRight: 8 },
  time: { fontSize: 11, color: c.textMuted },
  preview: { fontSize: 13, color: c.textMuted, flex: 1, marginRight: 8 },
  previewUnread: { color: c.text, fontWeight: fw.medium },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    backgroundColor: c.teal,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: fw.bold,
  },
  emptyText: { color: c.textMuted, fontSize: fs.sm },
});