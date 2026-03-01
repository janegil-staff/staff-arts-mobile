import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity as T,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { msgs } from "../../services/data";
import { useAuth } from "../../store/authStore";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
import { format } from "date-fns";

// Socket hooks — gracefully handle when socket server isn't running
var _chatSocket, _typing;
try {
  var socketModule = require("../../services/socket");
  _chatSocket = socketModule.useChatSocket;
  _typing = socketModule.useTyping;
} catch (e) {}

function useChatSocketSafe(convId, cb) {
  if (_chatSocket) { try { _chatSocket(convId, cb); } catch (e) {} }
}
function useTypingSafe(convId) {
  if (_typing) { try { return _typing(convId); } catch (e) {} }
  return { typingUsers: [], sendTyping: function () {}, sendStopTyping: function () {} };
}

// ── Inquiry Banner ──

function InquiryBanner({ listing, onPress }) {
  if (!listing) return null;
  return (
    <T
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: sp.md,
        margin: sp.md,
        marginBottom: 0,
        padding: sp.sm,
        backgroundColor: c.surface,
        borderRadius: rad.lg,
        borderWidth: 1,
        borderColor: c.borderLight,
      }}
      onPress={onPress}
    >
      {listing.image ? (
        <Image
          source={{ uri: listing.image }}
          style={{
            width: 48,
            height: 48,
            borderRadius: rad.sm,
            backgroundColor: c.surfaceDim,
          }}
        />
      ) : (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: rad.sm,
            backgroundColor: c.surfaceDim,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 20 }}>🖼️</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: fs.sm, fontWeight: fw.semi, color: c.text }}
          numberOfLines={1}
        >
          {listing.title}
        </Text>
        {listing.price > 0 ? (
          <Text style={{ fontSize: fs.xs, color: c.teal, fontWeight: fw.medium }}>
            {listing.price.toLocaleString("en-US", {
              style: "currency",
              currency: listing.currency || "NOK",
              minimumFractionDigits: 0,
            })}
          </Text>
        ) : (
          <Text style={{ fontSize: fs.xs, color: c.textMuted }}>
            Price on request
          </Text>
        )}
      </View>
      <Text style={{ fontSize: fs.xs, color: c.textMuted }}>→</Text>
    </T>
  );
}

// ── Main Screen ──

export default function Chat({ route, navigation }) {
  var params = route.params || {};
  var { user } = useAuth();
  var userId = user?._id || user?.id;
  var [convId, setConvId] = useState(params.conversationId || null);
  var [data, sD] = useState([]);
  var [txt, sT] = useState("");
  var [loading, sL] = useState(true);
  var [sending, setSending] = useState(false);
  var ref = useRef();

  // Listing info for inquiry banner
  var listing = params.listingId
    ? {
        id: params.listingId,
        title: params.listingTitle,
        price: params.listingPrice,
        currency: params.listingCurrency,
        image: params.listingImage,
      }
    : null;

  // Set header title
  useEffect(function () {
    if (params.name) {
      navigation.setOptions({ title: params.name });
    }
  }, [params.name]);

  // Real-time messages via socket
  useChatSocketSafe(convId, function (message) {
    // Only add if not sent by us (we already add our own messages instantly)
    if (message.senderId?._id !== userId && message.senderId !== userId) {
      sD(function (prev) {
        // Avoid duplicates
        var exists = prev.some(function (m) { return m._id === message._id; });
        if (exists) return prev;
        return [...prev, message];
      });
      setTimeout(function () { ref.current?.scrollToEnd(); }, 100);
    }
  });

  // Typing indicators
  var { typingUsers, sendTyping, sendStopTyping } = useTypingSafe(convId);
  var typingTimeout = useRef(null);

  function handleTextChange(val) {
    sT(val);
    sendTyping();
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(function () {
      sendStopTyping();
    }, 2000);
  }

  // Initialize conversation and load messages
  useEffect(
    function () {
      var cancelled = false;

      (async function () {
        try {
          var activeConvId = convId;

          // If no conversation exists, create one with the participant
          if (!activeConvId && params.participantId) {
            var conv = await msgs.createConversation(params.participantId);
            if (cancelled) return;
            activeConvId = conv._id;
            setConvId(activeConvId);
          }

          if (!activeConvId) {
            sL(false);
            return;
          }

          // Load existing messages
          var messages = await msgs.list(activeConvId);
          if (cancelled) return;
          sD(messages);

          // Auto-send inquiry message if coming from artwork and no previous inquiry
          if (listing && params.autoInquire !== false) {
            var hasExistingInquiry = messages.some(function (m) {
              return m.text && m.text.includes("[Inquiry]") && m.text.includes(listing.title);
            });

            if (!hasExistingInquiry) {
              var inquiryText =
                "[Inquiry] " + listing.title;
              if (listing.price > 0) {
                inquiryText += " — Listed at " + listing.price.toLocaleString("en-US", {
                  style: "currency",
                  currency: listing.currency || "NOK",
                  minimumFractionDigits: 0,
                });
              }
              inquiryText += "\n\nHi, I'm interested in this piece. Is it still available?";

              var m = await msgs.send(activeConvId, inquiryText);
              if (!cancelled) {
                sD(function (prev) { return [...prev, m]; });
              }
            }
          }
        } catch (e) {
          console.log("[Chat] Init error:", e.message);
        }
        if (!cancelled) sL(false);
      })();

      return function () { cancelled = true; };
    },
    [convId, params.participantId],
  );

  var send = async function () {
    if (!txt.trim() || !convId || sending) return;
    setSending(true);
    try {
      var m = await msgs.send(convId, txt.trim());
      sD(function (prev) { return [...prev, m]; });
      sT("");
      setTimeout(function () { ref.current?.scrollToEnd(); }, 100);
    } catch (e) {
      console.log("[Chat] Send error:", e.message);
    }
    setSending(false);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: c.bg,
        }}
      >
        <ActivityIndicator color={c.teal} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Inquiry banner */}
      {listing ? (
        <InquiryBanner
          listing={listing}
          onPress={function () {
            if (listing.id) {
              navigation.push("ArtworkDetail", { id: listing.id });
            }
          }}
        />
      ) : null}

      <FlatList
        ref={ref}
        data={data}
        keyExtractor={function (i) { return i._id; }}
        contentContainerStyle={{ padding: sp.md, paddingBottom: sp.md }}
        onContentSizeChange={function () {
          ref.current?.scrollToEnd({ animated: false });
        }}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 60,
            }}
          >
            <Text style={{ fontSize: fs.sm, color: c.textMuted }}>
              No messages yet
            </Text>
          </View>
        }
        renderItem={function ({ item: i }) {
          var mine =
            i.senderId?._id === userId || i.senderId === userId;
          return (
            <View
              style={{
                alignSelf: mine ? "flex-end" : "flex-start",
                maxWidth: "75%",
                backgroundColor: mine ? c.teal : c.surface,
                borderRadius: rad.lg,
                padding: sp.md,
                marginBottom: sp.sm,
                borderWidth: mine ? 0 : 1,
                borderColor: c.borderLight,
              }}
            >
              <Text
                style={{
                  fontSize: fs.md,
                  color: mine ? c.textInverse : c.text,
                }}
              >
                {i.text}
              </Text>
              <Text
                style={{
                  fontSize: fs.xxs,
                  color: mine ? "rgba(255,255,255,0.6)" : c.textMuted,
                  marginTop: sp.xs,
                }}
              >
                {i.createdAt
                  ? format(new Date(i.createdAt), "HH:mm")
                  : ""}
              </Text>
            </View>
          );
        }}
      />

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <View style={{ paddingHorizontal: sp.md, paddingVertical: sp.xs }}>
          <Text style={{ fontSize: fs.xs, color: c.textMuted, fontStyle: "italic" }}>
            typing...
          </Text>
        </View>
      )}

      {/* Input */}
      <View
        style={{
          flexDirection: "row",
          padding: sp.md,
          gap: sp.sm,
          borderTopWidth: 1,
          borderTopColor: c.borderLight,
          backgroundColor: c.surface,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            backgroundColor: c.bg,
            borderRadius: rad.md,
            paddingHorizontal: sp.md,
            paddingVertical: 12,
            fontSize: fs.md,
            color: c.text,
          }}
          value={txt}
          onChangeText={handleTextChange}
          placeholder="Message..."
          placeholderTextColor={c.textMuted}
          editable={!!convId}
        />
        <T
          style={{
            backgroundColor: txt.trim() && convId ? c.teal : c.surfaceDim,
            borderRadius: rad.md,
            paddingHorizontal: sp.lg,
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 4,
          }}
          onPress={send}
          disabled={!txt.trim() || !convId || sending}
        >
          <Text
            style={{
              color: txt.trim() && convId ? c.textInverse : c.textMuted,
              fontWeight: fw.semi,
            }}
          >
            Send
          </Text>
        </T>
      </View>
    </KeyboardAvoidingView>
  );
}