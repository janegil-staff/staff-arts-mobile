// hooks/useChat.js
import { useState, useEffect, useCallback, useRef } from "react";
import * as SecureStore from "expo-secure-store";
import socket from "../services/socket";
import { API_URL } from "../constants/api";

async function authFetch(url, opts = {}) {
  const token = await SecureStore.getItemAsync("token");
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  if (token) headers.Authorization = "Bearer " + token;
  return fetch(url, { ...opts, headers });
}

export default function useChat({ conversationId, userId, receiverId }) {
  const [activeConvId, setActiveConvId] = useState(conversationId);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);
  const typingTimeout = useRef(null);

  // ── CONNECT SOCKET ON MOUNT ──
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    return () => {};
  }, []);

  // ── FIND OR CREATE CONVERSATION ──
  useEffect(() => {
    if (activeConvId || !userId || !receiverId) return;

    (async () => {
      try {
        const res = await authFetch(API_URL + "/api/messages/conversations", {
          method: "POST",
          body: JSON.stringify({ participantId: receiverId }),
        });
        const json = await res.json();
        const convo = json.data || json;
        if (convo?._id) {
          console.log("[useChat] Found/created conversation:", convo._id);
          setActiveConvId(convo._id);
        }
      } catch (err) {
        console.error("[useChat] Conversation lookup error:", err);
        setLoading(false);
      }
    })();
  }, [activeConvId, userId, receiverId]);

  // ── FETCH MESSAGES ──
  const fetchMessages = useCallback(
    async (page = 1) => {
      if (!activeConvId) {
        setLoading(false);
        return;
      }
      try {
        const res = await authFetch(
          API_URL +
            "/api/messages?conversationId=" +
            activeConvId +
            "&page=" +
            page +
            "&limit=30",
        );
        const json = await res.json();
        const msgs = json.data || json.messages || json;

        if (Array.isArray(msgs)) {
          // Normalize field names for the UI
          const normalized = msgs.map((m) => ({
            ...m,
            senderId: m.sender?._id || m.sender || m.senderId,
            text: m.content || m.text,
          }));

          if (page === 1) {
            setMessages(normalized);
          } else {
            setMessages((prev) => [...normalized, ...prev]);
          }
          setHasMore(msgs.length >= 30);
        }
      } catch (err) {
        console.error("[useChat] Fetch error:", err);
      } finally {
        setLoading(false);
      }
    },
    [activeConvId],
  );

  // ── LOAD MORE ──
  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    pageRef.current += 1;
    fetchMessages(pageRef.current);
  }, [hasMore, loading, fetchMessages]);

  // ── JOIN ROOM + LISTEN FOR MESSAGES ──
  useEffect(() => {
    if (!activeConvId) return;

    fetchMessages(1);

    // Join the conversation room
    socket.emit("join", activeConvId);

    function handleMessage(message) {
      const normalized = {
        ...message,
        senderId: message.sender?._id || message.sender || message.senderId,
        text: message.content || message.text,
      };
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === normalized._id);
        if (exists) return prev;
        return [...prev, normalized];
      });
    }

    function handleTyping(data) {
      if (data.roomId === activeConvId && data.userId === receiverId) {
        setIsTyping(true);
      }
    }

    function handleStopTyping(data) {
      if (data.roomId === activeConvId && data.userId === receiverId) {
        setIsTyping(false);
      }
    }

    socket.on("receive-message", handleMessage);
    socket.on("user-typing", handleTyping);
    socket.on("user-stop-typing", handleStopTyping);

    return () => {
      socket.emit("leave", activeConvId);
      socket.off("receive-message", handleMessage);
      socket.off("user-typing", handleTyping);
      socket.off("user-stop-typing", handleStopTyping);
    };
  }, [activeConvId, userId, receiverId, fetchMessages]);

  // ── SEND ──
  const sendMessage = useCallback(
    async (text, image = null) => {
      if ((!text?.trim() && !image) || sending) return;
      setSending(true);

      let convoId = activeConvId;

      if (!convoId) {
        try {
          const res = await authFetch(API_URL + "/api/messages/conversations", {
            method: "POST",
            body: JSON.stringify({ participantId: receiverId }),
          });
          const json = await res.json();
          const convo = json.data || json;
          convoId = convo._id;
          setActiveConvId(convoId);
        } catch (err) {
          console.error("[useChat] Create convo error:", err);
          setSending(false);
          return;
        }
      }

      // Save via REST API
      try {
        const res = await authFetch(API_URL + "/api/messages", {
          method: "POST",
          body: JSON.stringify({
            conversationId: convoId,
            text: text?.trim() || "",
            image: image || null,
          }),
        });
        const json = await res.json();
        const msg = json.data || json;

        const normalized = {
          ...msg,
          senderId: msg.sender?._id || msg.sender || msg.senderId,
          text: msg.content || msg.text,
        };

        // Add locally
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === normalized._id);
          if (exists) return prev;
          return [...prev, normalized];
        });

        // Emit via socket so the other user gets it instantly
        socket.emit("send-message", { roomId: convoId, message: normalized });
      } catch (err) {
        console.error("[useChat] Send error:", err);
      }

      setSending(false);
      return convoId;
    },
    [activeConvId, userId, receiverId, sending],
  );

  // ── TYPING ──
  const handleTypingInput = useCallback(() => {
    if (!activeConvId) return;
    socket.emit("typing", { roomId: activeConvId, userId });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop-typing", { roomId: activeConvId, userId });
    }, 2000);
  }, [activeConvId, userId]);

  return {
    messages,
    loading,
    sending,
    isTyping,
    hasMore,
    sendMessage,
    loadMore,
    handleTypingInput,
  };
}
