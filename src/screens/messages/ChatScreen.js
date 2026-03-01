// screens/messages/ChatScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { colors as c, fs, fw } from "../../constants/theme";
import { useAuth } from "../../store/authStore";
import useChat from "../../hooks/useChat";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function ChatScreen({ route }) {
  const {
    conversationId: initialConvoId,
    participantId,
    name,
    listingTitle,
    listingPrice,
    listingCurrency,
    listingImage,
  } = route.params;

  const { user } = useAuth();
  const [text, setText] = useState("");
  const [convoId, setConvoId] = useState(initialConvoId);
  console.log(
    "CHAT USER:",
    user?._id || user?.id,
    "PARTICIPANT:",
    participantId,
  );
  const {
    messages,
    loading,
    sending,
    isTyping,
    hasMore,
    sendMessage,
    loadMore,
    handleTypingInput,
  } = useChat({
    conversationId: convoId,
    userId: user?._id || user?.id, // ← fix this line
    receiverId: participantId,
  });

  async function handleSend() {
    if (!text.trim()) return;
    const msg = text;
    setText("");
    const newConvoId = await sendMessage(msg);
    if (!convoId && newConvoId) {
      setConvoId(newConvoId);
    }
  }

  function renderMessage({ item }) {
    const isMe =
      item.senderId === (user?._id || user?.id) ||
      item.senderId?._id === (user?._id || user?.id);

    return (
      <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleThem]}>
        {item.image && (
          <Image source={{ uri: item.image }} style={s.messageImage} />
        )}
        {item.text ? (
          <Text style={[s.bubbleText, isMe && s.bubbleTextMe]}>
            {item.text}
          </Text>
        ) : null}
        <Text style={[s.time, isMe && s.timeMe]}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
    );
  }

  // ── NO EARLY RETURN for loading ──
  // The input bar ALWAYS renders. Loading spinner is inline.
  return (
    <SafeAreaProvider style={s.safeArea}>
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* ── LISTING BANNER ── */}
        {listingTitle && (
          <View style={s.listingBanner}>
            {listingImage && (
              <Image source={{ uri: listingImage }} style={s.listingThumb} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={s.listingTitle} numberOfLines={1}>
                {listingTitle}
              </Text>
              {listingPrice != null && (
                <Text style={s.listingPrice}>
                  {listingCurrency} {listingPrice.toLocaleString()}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* ── MESSAGES AREA ── */}
        {loading ? (
          <View style={s.center}>
            <ActivityIndicator color={c.teal} size="large" />
          </View>
        ) : (
          <FlatList
            inverted
            data={[...messages].reverse()}
            keyExtractor={(item) => item._id}
            renderItem={renderMessage}
            style={s.messagesList}
            contentContainerStyle={s.messagesContent}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              hasMore ? (
                <ActivityIndicator
                  color={c.textMuted}
                  style={{ marginVertical: 10 }}
                />
              ) : null
            }
            ListEmptyComponent={
              <View style={s.emptyWrap}>
                <Text style={s.emptyText}>
                  Start a conversation with {name}
                </Text>
              </View>
            }
          />
        )}

        {/* ── TYPING ── */}
        {isTyping && (
          <View style={s.typingRow}>
            <Text style={s.typingText}>{name} is typing...</Text>
          </View>
        )}

        {/* ── INPUT BAR (always visible) ── */}
        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            placeholder="Type a message..."
            placeholderTextColor={c.textMuted}
            value={text}
            onChangeText={(val) => {
              setText(val);
              if (val.length > 0) handleTypingInput();
            }}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={[s.sendBtn, (!text.trim() || sending) && s.sendBtnDisabled]}
            activeOpacity={0.7}
          >
            <Text style={s.sendBtnText}>{sending ? "···" : "↑"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: c.bg,
  },
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // FlatList gets flex:1 so it fills available space
  // WITHOUT pushing the input bar off screen
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  bubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginVertical: 3,
  },
  bubbleMe: {
    alignSelf: "flex-end",
    backgroundColor: c.teal,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    alignSelf: "flex-start",
    backgroundColor: c.surface,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: fs.sm,
    color: c.text,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: "#fff",
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 6,
  },
  time: {
    fontSize: 10,
    color: c.textMuted,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  timeMe: {
    color: "rgba(255,255,255,0.7)",
  },

  typingRow: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  typingText: {
    fontSize: 12,
    color: c.textMuted,
    fontStyle: "italic",
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: c.borderLight,
    backgroundColor: c.surface,
  },
  input: {
    flex: 1,
    backgroundColor: c.bg,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 10 : 8,
    paddingBottom: Platform.OS === "ios" ? 10 : 8,
    fontSize: fs.sm,
    color: c.text,
    maxHeight: 100,
    minHeight: 42,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: c.teal,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendBtnDisabled: {
    opacity: 0.35,
  },
  sendBtnText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  listingBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
    backgroundColor: c.surface,
  },
  listingThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  listingTitle: {
    fontSize: fs.sm,
    fontWeight: fw.semi,
    color: c.text,
  },
  listingPrice: {
    fontSize: 12,
    color: c.teal,
    marginTop: 2,
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    transform: [{ scaleY: -1 }],
  },
  emptyText: {
    color: c.textMuted,
    fontSize: fs.sm,
  },
});
