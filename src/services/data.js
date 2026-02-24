import { api, getToken, setTokens, clearTokens } from "./api";
import { BASE, EP } from "../constants/api";

// ── Auth ──
export var auth = {
  login: async function (email, password) {
    var res = await fetch(BASE + EP.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Login failed");
    var d = json.data;
    await setTokens(d.token, d.refreshToken);
    return d;
  },
  register: async function (payload) {
    var res = await fetch(BASE + EP.register, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Registration failed");
    var d = json.data;
    await setTokens(d.token, d.refreshToken);
    return d;
  },
  me: function () { return api(EP.me); },
  check: async function () { return !!(await getToken()); },
  logout: function () { return clearTokens(); },
  updateProfile: function (data) {
    return api(EP.profile, { method: "PUT", body: JSON.stringify(data) });
  },
};

// ── Artworks ──
export var artworks = {
  list: function (params) {
    var q = params ? "?" + new URLSearchParams(params).toString() : "";
    return api(EP.artworks + q);
  },
  get: function (id) { return api(EP.artworks + "/" + id); },
  like: function (id) { return api(EP.artworks + "/" + id + "/like", { method: "POST" }); },
};

// ── Users ──
export var users = {
  get: function (username) { return api(EP.users + "/" + username); },
  follow: function (id) { return api("/api/mobile/users/" + id + "/follow", { method: "POST" }); },
};

// ── Posts / Feed ──
export var posts = {
  list: function () { return api(EP.posts); },
  like: function (id) { return api(EP.posts + "/" + id + "/like", { method: "POST" }); },
  comment: function (id, text) {
    return api(EP.posts + "/" + id + "/comment", { method: "POST", body: JSON.stringify({ text }) });
  },
};

// ── Events ──
export var events = {
  list: function () { return api(EP.events); },
  get: function (id) { return api(EP.events + "/" + id); },
};

// ── Exhibitions ──
export var exhibitions = {
  list: function () { return api(EP.exhibitions); },
  get: function (id) { return api(EP.exhibitions + "/" + id); },
};

// ── Orders ──
export var orders = {
  list: function () { return api(EP.orders); },
  get: function (id) { return api(EP.orders + "/" + id); },
};

// ── Commissions ──
export var commissions = {
  list: function () { return api(EP.commissions); },
  get: function (id) { return api(EP.commissions + "/" + id); },
  update: function (id, data) {
    return api(EP.commissions + "/" + id, { method: "PUT", body: JSON.stringify(data) });
  },
};

// ── Messages ──
export var msgs = {
  conversations: function () { return api(EP.conversations); },
  list: function (conversationId) { return api(EP.messages + "?conversationId=" + conversationId); },
  send: function (conversationId, text) {
    return api(EP.messages, { method: "POST", body: JSON.stringify({ conversationId, text }) });
  },
};

// ── Music ──
export var music = {
  list: function () { return api(EP.music); },
  play: function (id) { return api(EP.music + "/" + id + "/play", { method: "POST" }); },
};

// ── Notifications ──
export var notifs = {
  list: function () { return api(EP.notifications); },
  read: function (id) { return api(EP.notifications + "?id=" + id, { method: "PUT" }); },
  readAll: function () { return api(EP.notifications + "?all=true", { method: "PUT" }); },
};

// ── Search ──
export var search = {
  query: function (q, type) {
    var params = "?q=" + encodeURIComponent(q);
    if (type && type !== "all") params += "&type=" + type;
    return api(EP.search + params);
  },
};
