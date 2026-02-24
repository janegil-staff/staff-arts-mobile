import { constructFromSymbol } from "date-fns/constants";
import * as SecureStore from "expo-secure-store";

var BASE = "http://localhost:3000";

// ── Token helpers ──

async function getToken() {
  try { return await SecureStore.getItemAsync("token"); } catch (e) { return null; }
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

// ── Auth ──

export var auth = {
  login: async function (email, password) {
    var res = await fetch(BASE + "/api/mobile/auth/login", {
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
    var res = await fetch(BASE + "/api/mobile/auth/register", {
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
    var res = await fetch(BASE + "/api/mobile/me", { headers: await authHeaders() });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },

  check: async function () {
    return !!(await getToken());
  },

  logout: function () {
    return clearTokens();
  },

  updateProfile: async function (data) {
    var res = await fetch(BASE + "/api/mobile/auth/profile", {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },
};

// ── Artworks ──

export var artworks = {
  list: async function (params) {
    var res = await fetch(BASE + "/api/artworks" + toQuery(params), { headers: await authHeaders() });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },

  get: async function (id) {
    var res = await fetch(BASE + "/api/artworks/" + id, { headers: await authHeaders() });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },

  like: async function (id) {
    var res = await fetch(BASE + "/api/artworks/" + id + "/like", {
      method: "POST",
      headers: await authHeaders(),
    });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },

  create: async function (data) {
    console.log("DATA. --->", data);
    var res = await fetch(BASE + "/api/artworks", {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },
};

// ── Upload ──

export var upload = {
  image: async function (uri, folder) {
    var sigRes = await fetch(BASE + "/api/upload/signature", {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ folder: folder || "staff-arts" }),
    });
    var sigJson = await sigRes.json();
    console.log("sigJson", sigJson)
    if (!sigRes.ok) throw new Error(sigJson.error || "Signature failed");
    var sig = sigJson.data;

    // Step 2: Upload to Cloudinary
    var filename = uri.split("/").pop();
    var ext = filename.split(".").pop().toLowerCase();
    var mime = ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : "image/jpeg";
    console.log(mime);

    var form = new FormData();
    form.append("file", { uri: uri, type: mime, name: filename });
    form.append("signature", sig.signature);
    form.append("timestamp", String(sig.timestamp));
    form.append("api_key", sig.apiKey);
    form.append("folder", sig.folder);

    var upRes = await fetch(sig.uploadUrl, { method: "POST", body: form });
    var upJson = await upRes.json();
    if (!upRes.ok || upJson.error) throw new Error((upJson.error && upJson.error.message) || "Upload failed");

    return {
      url: upJson.secure_url,
      publicId: upJson.public_id,
      width: upJson.width,
      height: upJson.height,
    };
  },
};

// ── Users ──

export var users = {
  get: async function (username) {
    var res = await fetch(BASE + "/api/users/" + username, { headers: await authHeaders() });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },

  follow: async function (id) {
    var res = await fetch(BASE + "/api/mobile/users/" + id + "/follow", {
      method: "POST",
      headers: await authHeaders(),
    });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },
};

// ── Posts / Feed ──

export var posts = {
  list: async function () {
    var res = await fetch(BASE + "/api/mobile/posts", { headers: await authHeaders() });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },

  like: async function (id) {
    var res = await fetch(BASE + "/api/mobile/posts/" + id + "/like", {
      method: "POST",
      headers: await authHeaders(),
    });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },

  comment: async function (id, text) {
    var res = await fetch(BASE + "/api/mobile/posts/" + id + "/comment", {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ text: text }),
    });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },
};

// ── Events ──

export var events = {
  list: async function () {
    var res = await fetch(BASE + "/api/events", { headers: await authHeaders() });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },

  get: async function (id) {
    var res = await fetch(BASE + "/api/events/" + id, { headers: await authHeaders() });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },
};

// ── Exhibitions ──

export var exhibitions = {
  list: async function () {
    var res = await fetch(BASE + "/api/exhibitions", { headers: await authHeaders() });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },

  get: async function (id) {
    var res = await fetch(BASE + "/api/exhibitions/" + id, { headers: await authHeaders() });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },
};

// ── Orders ──

export var orders = {
  list: async function () {
    var res = await fetch(BASE + "/api/orders", { headers: await authHeaders() });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },

  get: async function (id) {
    var res = await fetch(BASE + "/api/orders/" + id, { headers: await authHeaders() });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },
};

// ── Commissions ──

export var commissions = {
  list: async function () {
    var res = await fetch(BASE + "/api/commissions", { headers: await authHeaders() });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },

  get: async function (id) {
    var res = await fetch(BASE + "/api/commissions/" + id, { headers: await authHeaders() });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },

  update: async function (id, data) {
    var res = await fetch(BASE + "/api/commissions/" + id, {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },
};

// ── Messages ──

export var msgs = {
  conversations: async function () {
    var res = await fetch(BASE + "/api/messages/conversations", { headers: await authHeaders() });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },

  list: async function (conversationId) {
    var res = await fetch(BASE + "/api/messages?conversationId=" + conversationId, { headers: await authHeaders() });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },

  send: async function (conversationId, text) {
    var res = await fetch(BASE + "/api/messages", {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ conversationId: conversationId, text: text }),
    });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },
};

// ── Music ──

export var music = {
  list: async function () {
    var res = await fetch(BASE + "/api/music", { headers: await authHeaders() });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },

  play: async function (id) {
    var res = await fetch(BASE + "/api/music/" + id + "/play", {
      method: "POST",
      headers: await authHeaders(),
    });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },
};

// ── Notifications ──

export var notifs = {
  list: async function () {
    var res = await fetch(BASE + "/api/notifications", { headers: await authHeaders() });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },

  read: async function (id) {
    var res = await fetch(BASE + "/api/notifications?id=" + id, {
      method: "PUT",
      headers: await authHeaders(),
    });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },

  readAll: async function () {
    var res = await fetch(BASE + "/api/notifications?all=true", {
      method: "PUT",
      headers: await authHeaders(),
    });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },
};

// ── Search ──

export var search = {
  query: async function (q, type) {
    var params = "?q=" + encodeURIComponent(q);
    if (type && type !== "all") params += "&type=" + type;
    var res = await fetch(BASE + params, { headers: await authHeaders() });
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    return json.data || json;
  },
};
