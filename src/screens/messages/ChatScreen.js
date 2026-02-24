import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput as RNTextInput, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "../../components/ui";
import { messageService } from "../../services/data";
import { useAuth } from "../../store/authStore";
import { timeAgo } from "../../utils";
import { colors, sp, rad, fs, fw } from "../../constants/theme";

export default function ChatScreen({ navigation, route }) {
  var ins = useSafeAreaInsets();
  var _auth = useAuth(); var me = _auth.user;
  var convoId = route.params && route.params.conversationId;
  var otherUser = route.params && route.params.user;

  var msgs = useState([]);
  var text = useState("");
  var loading = useState(true);
  var page = useState(1);
  var listRef = useRef(null);

  useEffect(function () {
    if (!convoId) return;
    messageService.getMessages(convoId, 1).then(function (res) {
      msgs[1]((res.data || []).reverse());
      loading[1](false);
    }).catch(function () { loading[1](false); });
  }, [convoId]);

  function sendMessage() {
    var content = text[0].trim();
    if (!content || !convoId) return;

    var temp = {
      _id: "temp_" + Date.now(),
      content: content,
      sender: me,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    msgs[1](function (prev) { return prev.concat([temp]); });
    text[1]("");

    messageService.send(convoId, content).then(function (res) {
      msgs[1](function (prev) {
        return prev.map(function (m) { return m._id === temp._id ? (res.data || temp) : m; });
      });
    }).catch(function () {});
  }

  function loadMore() {
    var nextPage = page[0] + 1;
    messageService.getMessages(convoId, nextPage).then(function (res) {
      var list = res.data || [];
      if (list.length > 0) {
        msgs[1](function (prev) { return list.reverse().concat(prev); });
        page[1](nextPage);
      }
    }).catch(function () {});
  }

  function renderMessage(item) {
    var m = item.item;
    var isMe = me && m.sender && (m.sender._id === me._id || m.sender === me._id);

    return (
      <View style={[s.msgRow, isMe && s.msgRowMe]}>
        {!isMe ? <Avatar name={otherUser && otherUser.name} imageUrl={otherUser && otherUser.avatar} size={28} /> : null}
        <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleThem]}>
          <Text style={[s.msgText, isMe && s.msgTextMe]}>{m.content}</Text>
          <Text style={[s.msgTime, isMe && s.msgTimeMe]}>{timeAgo(m.createdAt)}</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[s.c, { paddingTop: ins.top }]} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={0}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={function () { navigation.goBack(); }} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Avatar name={otherUser && otherUser.name} imageUrl={otherUser && otherUser.avatar} size={36} />
        <View style={s.headerInfo}>
          <Text style={s.headerName}>{otherUser && (otherUser.name || otherUser.displayName) || "Chat"}</Text>
          {otherUser && otherUser.isOnline ? <Text style={s.onlineTxt}>Online</Text> : null}
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={msgs[0]}
        keyExtractor={function (item) { return item._id; }}
        renderItem={renderMessage}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        onStartReached={loadMore}
        onStartReachedThreshold={0.5}
        onContentSizeChange={function () { if (listRef.current) listRef.current.scrollToEnd({ animated: false }); }}
        ListEmptyComponent={!loading[0] ? (
          <View style={s.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
            <Text style={s.emptyTxt}>Start the conversation</Text>
          </View>
        ) : null}
      />

      {/* Input */}
      <View style={[s.inputBar, { paddingBottom: ins.bottom + 8 }]}>
        <TouchableOpacity style={s.attachBtn}>
          <Ionicons name="add-circle-outline" size={26} color={colors.textMuted} />
        </TouchableOpacity>
        <RNTextInput
          style={s.input}
          value={text[0]}
          onChangeText={text[1]}
          placeholder="Message..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={5000}
        />
        <TouchableOpacity onPress={sendMessage} disabled={!text[0].trim()} style={[s.sendBtn, text[0].trim() && s.sendBtnActive]}>
          <Ionicons name="arrow-up" size={20} color={text[0].trim() ? colors.textInverse : colors.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

var s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: sp.md, paddingVertical: sp.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { marginRight: sp.sm },
  headerInfo: { marginLeft: sp.sm, flex: 1 },
  headerName: { fontSize: fs.md, fontWeight: fw.semibold, color: colors.text },
  onlineTxt: { fontSize: fs.xs, color: colors.success, marginTop: 1 },

  list: { paddingHorizontal: sp.md, paddingVertical: sp.md, flexGrow: 1, justifyContent: "flex-end" },
  msgRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: sp.sm, gap: sp.sm },
  msgRowMe: { flexDirection: "row-reverse" },
  bubble: { maxWidth: "75%", paddingHorizontal: sp.md, paddingVertical: sp.sm + 2, borderRadius: rad.lg },
  bubbleThem: { backgroundColor: colors.surface, borderBottomLeftRadius: rad.xs },
  bubbleMe: { backgroundColor: colors.accent, borderBottomRightRadius: rad.xs },
  msgText: { fontSize: fs.md, color: colors.text, lineHeight: 22 },
  msgTextMe: { color: colors.textInverse },
  msgTime: { fontSize: fs.xs - 1, color: colors.textMuted, marginTop: 4, alignSelf: "flex-end" },
  msgTimeMe: { color: colors.textInverse + "99" },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: sp.sm },
  emptyTxt: { fontSize: fs.md, color: colors.textMuted },

  inputBar: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: sp.sm, paddingTop: sp.sm, borderTopWidth: 1, borderTopColor: colors.border, gap: sp.xs },
  attachBtn: { paddingBottom: sp.sm - 2, paddingHorizontal: sp.xs },
  input: { flex: 1, backgroundColor: colors.surface, borderRadius: rad.xl, paddingHorizontal: sp.md, paddingVertical: sp.sm, color: colors.text, fontSize: fs.md, maxHeight: 100, marginBottom: 2 },
  sendBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  sendBtnActive: { backgroundColor: colors.accent },
});
