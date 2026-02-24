import api from "./api";
import { API, API_URL } from "../constants/api";

export var artworkService = {
  getAll: function (params) { return api.get(API.artworks + (params ? "?" + params : "")); },
  getById: function (id) { return api.get(API.artworks + "/" + id); },
  create: function (data) { return api.post(API.artworks, data); },
  update: function (id, data) { return api.put(API.artworks + "/" + id, data); },
  remove: function (id) { return api.del(API.artworks + "/" + id); },
  like: function (id) { return api.post(API.artworks + "/" + id + "/like"); },
  save: function (id) { return api.post(API.artworks + "/" + id + "/save"); },
  getComments: function (id, page) { return api.get(API.artworks + "/" + id + "/comments?page=" + (page || 1)); },
  addComment: function (id, content) { return api.post(API.artworks + "/" + id + "/comments", { content: content }); },
};

export var userService = {
  getById: function (id) { return api.get(API.users + "/" + id); },
  getBySlug: function (slug) { return api.get(API.users + "/slug/" + slug); },
  follow: function (id) { return api.post(API.users + "/" + id + "/follow"); },
  getArtworks: function (id, page) { return api.get(API.users + "/" + id + "/artworks?page=" + (page || 1)); },
};

export var postService = {
  getFeed: function (page) { return api.get(API.posts + "/feed?page=" + (page || 1)); },
  create: function (data) { return api.post(API.posts, data); },
  remove: function (id) { return api.del(API.posts + "/" + id); },
  like: function (id) { return api.post(API.posts + "/" + id + "/like"); },
  addComment: function (id, content) { return api.post(API.posts + "/" + id + "/comments", { content: content }); },
};

export var exhibitionService = {
  getAll: function (params) { return api.get(API.exhibitions + (params ? "?" + params : "")); },
  getById: function (id) { return api.get(API.exhibitions + "/" + id); },
  attend: function (id) { return api.post(API.exhibitions + "/" + id + "/attend"); },
};

export var eventService = {
  getAll: function (params) { return api.get(API.events + (params ? "?" + params : "")); },
  getById: function (id) { return api.get(API.events + "/" + id); },
  rsvp: function (id) { return api.post(API.events + "/" + id + "/rsvp"); },
};

export var orderService = {
  getAll: function () { return api.get(API.orders); },
  getById: function (id) { return api.get(API.orders + "/" + id); },
  create: function (artworkId) { return api.post(API.orders, { artworkId: artworkId }); },
};

export var messageService = {
  getConversations: function () { return api.get(API.conversations); },
  getMessages: function (id, page) { return api.get(API.messages + "/" + id + "?page=" + (page || 1)); },
  send: function (id, content) { return api.post(API.messages + "/" + id, { content: content }); },
  startConversation: function (userId, content) { return api.post(API.conversations, { userId: userId, content: content }); },
};

export var notificationService = {
  getAll: function (page) { return api.get(API.notifications + "?page=" + (page || 1)); },
  markAsRead: function (id) { return api.patch(API.notifications + "/" + id + "/read"); },
  markAllAsRead: function () { return api.patch(API.notifications + "/read-all"); },
};

export var uploadService = {
  image: function (uri, folder) {
    var SecureStore = require("expo-secure-store");

    return SecureStore.getItemAsync("token").then(function (token) {
      // Step 1: Get signature from backend
      return fetch(API_URL + API.upload, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? "Bearer " + token : "",
        },
        body: JSON.stringify({ folder: folder || "artworks" }),
      });
    }).then(function (res) {
      return res.json();
    }).then(function (signData) {
      if (!signData.success) throw new Error(signData.error || "Failed to get upload signature");

      var params = signData.data;
      var name = uri.split("/").pop() || "photo.jpg";
      var ext = name.split(".").pop();

      // Step 2: Upload directly to Cloudinary
      var fd = new FormData();
      fd.append("file", { uri: uri, name: name, type: "image/" + (ext === "png" ? "png" : "jpeg") });
      fd.append("api_key", params.apiKey);
      fd.append("timestamp", String(params.timestamp));
      fd.append("signature", params.signature);
      fd.append("folder", params.folder);

      return fetch(params.uploadUrl, { method: "POST", body: fd });
    }).then(function (res) {
      return res.json();
    }).then(function (cloudData) {
      if (cloudData.error) throw new Error(cloudData.error.message || "Cloudinary upload failed");
      return {
        data: {
          url: cloudData.secure_url,
          publicId: cloudData.public_id,
          width: cloudData.width,
          height: cloudData.height,
          format: cloudData.format,
          bytes: cloudData.bytes,
        },
      };
    });
  },
};

export var searchService = {
  search: function (q, type) {
    return api.get(API.search + "?q=" + encodeURIComponent(q) + (type ? "&type=" + type : ""));
  },
};
