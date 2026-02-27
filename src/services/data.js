import * as SecureStore from "expo-secure-store";
import { API_URL, API } from "../constants/api";

// ══════════════════════════════════════════════════════════════
// Global auth failure callback
// Set by AuthProvider so data.js can trigger logout
// ══════════════════════════════════════════════════════════════

var _onAuthFailed = null;

export function setOnAuthFailed(cb) {
  _onAuthFailed = cb;
}

// ══════════════════════════════════════════════════════════════
// Token helpers
// ══════════════════════════════════════════════════════════════

async function getToken() {
  try {
    return await SecureStore.getItemAsync("token");
  } catch (e) {
    return null;
  }
}

async function saveTokens(token, refreshToken) {
  try {
    await SecureStore.setItemAsync("token", token);
    if (refreshToken) await SecureStore.setItemAsync("rtoken", refreshToken);
  } catch (e) {}
}

async function clearTokens() {
  try {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("rtoken");
  } catch (e) {}
}

async function authHeaders() {
  var token = await getToken();
  var h = { "Content-Type": "application/json" };
  if (token) h.Authorization = "Bearer " + token;
  return h;
}

async function doRefresh() {
  try {
    var rt = await SecureStore.getItemAsync("rtoken");
    if (!rt) return false;
    var res = await fetch(API_URL + API.refresh, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return false;
    var json = await res.json();
    await saveTokens(json.data.token, json.data.refreshToken);
    return true;
  } catch (e) {
    return false;
  }
}

async function fetchWithRetry(url, opts) {
  var res = await fetch(url, opts);
  if (res.status === 401) {
    var ok = await doRefresh();
    if (ok) {
      var newToken = await getToken();
      if (opts.headers && newToken) {
        opts.headers.Authorization = "Bearer " + newToken;
      }
      return await fetch(url, opts);
    }
    await clearTokens();
    if (_onAuthFailed) _onAuthFailed();
  }
  return res;
}

function toQuery(params) {
  if (!params) return "";
  var parts = [];
  var keys = Object.keys(params);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var v = params[k];
    if (v !== undefined && v !== null && v !== "") {
      parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return parts.length > 0 ? "?" + parts.join("&") : "";
}

// Helper for standard JSON responses
async function parseResponse(res) {
  var json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json.data || json;
}

// ══════════════════════════════════════════════════════════════
// Auth
// ══════════════════════════════════════════════════════════════

export var auth = {
  login: async function (email, password) {
    var res = await fetch(API_URL + API.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password }),
    });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Login failed");
    await saveTokens(json.data.token, json.data.refreshToken);
    return json.data;
  },

  register: async function (payload) {
    var res = await fetch(API_URL + API.register, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Registration failed");
    await saveTokens(json.data.token, json.data.refreshToken);
    return json.data;
  },

  me: async function () {
    var res = await fetchWithRetry(API_URL + API.me, { headers: await authHeaders() });
    return parseResponse(res);
  },

  check: async function () {
    return !!(await getToken());
  },

  logout: function () {
    return clearTokens();
  },

  updateProfile: async function (data) {
    var res = await fetchWithRetry(API_URL + API.profile, {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },
};

// ══════════════════════════════════════════════════════════════
// Artworks
// ══════════════════════════════════════════════════════════════

export var artworks = {
  list: async function (params) {
    var res = await fetchWithRetry(API_URL + API.artworks + toQuery(params), {
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },

  get: async function (id) {
    var res = await fetchWithRetry(API_URL + API.artworks + "/" + id, {
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },

  create: async function (data) {
    var res = await fetchWithRetry(API_URL + API.artworks, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },

  update: async function (id, data) {
    var res = await fetchWithRetry(API_URL + API.artworks + "/" + id, {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },

  remove: async function (id) {
    var res = await fetchWithRetry(API_URL + API.artworks + "/" + id, {
      method: "DELETE",
      headers: await authHeaders(),
    });
    if (!res.ok) {
      var text = await res.text();
      var err;
      try { err = JSON.parse(text); } catch (e) { err = {}; }
      throw new Error(err.error || "Failed to delete");
    }
    var text = await res.text();
    if (!text) return { success: true };
    return JSON.parse(text).data || { success: true };
  },

  like: async function (id) {
    var res = await fetchWithRetry(API_URL + API.artworkLike(id), {
      method: "POST",
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },

  getMine: async function (params) {
    var res = await fetchWithRetry(API_URL + API.myArtworks + toQuery(params), {
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },
};

// ══════════════════════════════════════════════════════════════
// Upload
// ══════════════════════════════════════════════════════════════

export var upload = {
  image: async function (uri, folder) {
    var sigRes = await fetchWithRetry(API_URL + API.upload + "/signature", {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ folder: folder || "staff-arts" }),
    });
    var sigJson = await sigRes.json();
    if (!sigRes.ok) throw new Error(sigJson.error || "Signature failed");
    var sig = sigJson.data;

    var filename = uri.split("/").pop();
    var ext = filename.split(".").pop().toLowerCase();
    var mime = ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : "image/jpeg";

    var form = new FormData();
    form.append("file", { uri: uri, type: mime, name: filename });
    form.append("signature", sig.signature);
    form.append("timestamp", String(sig.timestamp));
    form.append("api_key", sig.apiKey);
    form.append("folder", sig.folder);

    var upRes = await fetch(sig.uploadUrl, { method: "POST", body: form });
    var upJson = await upRes.json();
    if (!upRes.ok || upJson.error) {
      throw new Error((upJson.error && upJson.error.message) || "Upload failed");
    }

    return {
      url: upJson.secure_url,
      publicId: upJson.public_id,
      width: upJson.width,
      height: upJson.height,
    };
  },
};

// ══════════════════════════════════════════════════════════════
// Users
// ══════════════════════════════════════════════════════════════

export var users = {
  // Fetch by username — uses /api/users/:username
  get: async function (username) {
    var res = await fetchWithRetry(API_URL + API.userProfile(username), {
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },

  // Fetch by username (explicit alias)
  getByUsername: async function (username) {
    var res = await fetchWithRetry(API_URL + API.userProfile(username), {
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },

  // Fetch by MongoDB _id — uses /api/users/id/:id
  getById: async function (id) {
    var res = await fetchWithRetry(API_URL + API.userById(id), {
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },

  follow: async function (id) {
    var res = await fetchWithRetry(API_URL + API.userFollow(id), {
      method: "POST",
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },
};

// ══════════════════════════════════════════════════════════════
// Posts / Feed
// ══════════════════════════════════════════════════════════════

export var posts = {
  list: async function () {
    var res = await fetchWithRetry(API_URL + API.posts, { headers: await authHeaders() });
    return parseResponse(res);
  },

  like: async function (id) {
    var res = await fetchWithRetry(API_URL + API.postLike(id), {
      method: "POST",
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },

  comment: async function (id, text) {
    var res = await fetchWithRetry(API_URL + API.postComment(id), {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ text: text }),
    });
    return parseResponse(res);
  },
};

// ══════════════════════════════════════════════════════════════
// Events
// ══════════════════════════════════════════════════════════════

export var events = {
  list: async function (params) {
    var res = await fetchWithRetry(API_URL + API.events + toQuery(params), {
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },

  get: async function (id) {
    var res = await fetchWithRetry(API_URL + API.events + "/" + id, {
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },

  create: async function (data) {
    var res = await fetchWithRetry(API_URL + API.events, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },

  update: async function (id, data) {
    var res = await fetchWithRetry(API_URL + API.events + "/" + id, {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },

  remove: async function (id) {
    var res = await fetchWithRetry(API_URL + API.events + "/" + id, {
      method: "DELETE",
      headers: await authHeaders(),
    });
    if (!res.ok) {
      var text = await res.text();
      var err;
      try { err = JSON.parse(text); } catch (e) { err = {}; }
      throw new Error(err.error || "Failed to delete");
    }
    return { success: true };
  },

  rsvp: async function (id) {
    var res = await fetchWithRetry(API_URL + API.events + "/" + id + "/rsvp", {
      method: "POST",
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },
};

// ══════════════════════════════════════════════════════════════
// Exhibitions
// ══════════════════════════════════════════════════════════════

export var exhibitions = {
  list: async function (params) {
    var res = await fetchWithRetry(API_URL + API.exhibitions + toQuery(params), {
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },

  get: async function (id) {
    var res = await fetchWithRetry(API_URL + API.exhibitions + "/" + id, {
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },

  create: async function (data) {
    var res = await fetchWithRetry(API_URL + API.exhibitions, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },

  update: async function (id, data) {
    var res = await fetchWithRetry(API_URL + API.exhibitions + "/" + id, {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },

  remove: async function (id) {
    var res = await fetchWithRetry(API_URL + API.exhibitions + "/" + id, {
      method: "DELETE",
      headers: await authHeaders(),
    });
    if (!res.ok) {
      var text = await res.text();
      var err;
      try { err = JSON.parse(text); } catch (e) { err = {}; }
      throw new Error(err.error || "Failed to delete");
    }
    return { success: true };
  },
};

// ══════════════════════════════════════════════════════════════
// Orders
// ══════════════════════════════════════════════════════════════

export var orders = {
  list: async function (params) {
    var res = await fetchWithRetry(API_URL + API.orders + toQuery(params), {
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },

  get: async function (id) {
    var res = await fetchWithRetry(API_URL + API.orders + "/" + id, {
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },
};

// ══════════════════════════════════════════════════════════════
// Commissions
// ══════════════════════════════════════════════════════════════

export var commissions = {
  list: async function (params) {
    var res = await fetchWithRetry(API_URL + API.commissions + toQuery(params), {
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },

  get: async function (id) {
    var res = await fetchWithRetry(API_URL + API.commissions + "/" + id, {
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },

  update: async function (id, data) {
    var res = await fetchWithRetry(API_URL + API.commissions + "/" + id, {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },

  create: async function (data) {
    var res = await fetchWithRetry(API_URL + API.commissions, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },
};

// ══════════════════════════════════════════════════════════════
// Messages
// ══════════════════════════════════════════════════════════════

export var msgs = {
  conversations: async function () {
    var res = await fetchWithRetry(API_URL + API.conversations, {
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },

  list: async function (conversationId) {
    var res = await fetchWithRetry(
      API_URL + API.messages + "?conversationId=" + conversationId,
      { headers: await authHeaders() },
    );
    return parseResponse(res);
  },

  send: async function (conversationId, text) {
    var res = await fetchWithRetry(API_URL + API.messages, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ conversationId: conversationId, text: text }),
    });
    return parseResponse(res);
  },
};

// ══════════════════════════════════════════════════════════════
// Music
// ══════════════════════════════════════════════════════════════

export var music = {
  list: async function (params) {
    var res = await fetchWithRetry(API_URL + API.music + toQuery(params), {
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },

  play: async function (id) {
    var res = await fetchWithRetry(API_URL + API.music + "/" + id + "/play", {
      method: "POST",
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },
};

// ══════════════════════════════════════════════════════════════
// Notifications
// ══════════════════════════════════════════════════════════════

export var notifs = {
  list: async function () {
    var res = await fetchWithRetry(API_URL + API.notifications, {
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },

  read: async function (id) {
    var res = await fetchWithRetry(API_URL + API.notifications + "?id=" + id, {
      method: "PUT",
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },

  readAll: async function () {
    var res = await fetchWithRetry(API_URL + API.notifications + "?all=true", {
      method: "PUT",
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },
};

// ══════════════════════════════════════════════════════════════
// Search
// ══════════════════════════════════════════════════════════════

export var search = {
  query: async function (q, type) {
    var params = "?q=" + encodeURIComponent(q);
    if (type && type !== "all") params += "&type=" + type;
    var res = await fetchWithRetry(API_URL + API.search + params, {
      headers: await authHeaders(),
    });
    return parseResponse(res);
  },
};