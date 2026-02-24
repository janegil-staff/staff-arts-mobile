import * as SecureStore from "expo-secure-store";
import { API_URL } from "../constants/api";

function request(endpoint, options) {
  var opts = options || {};
  var method = opts.method || "GET";
  var body = opts.body;
  var custom = opts.headers || {};
  var skipAuth = opts.skipAuth || false;

  var headers = { "Content-Type": "application/json" };
  var keys = Object.keys(custom);
  for (var i = 0; i < keys.length; i++) {
    headers[keys[i]] = custom[keys[i]];
  }

  function doFetch(authHeaders) {
    var config = { method: method, headers: authHeaders };
    if (body && method !== "GET") config.body = JSON.stringify(body);

    return fetch(API_URL + endpoint, config).then(function (res) {
      var status = res.status;

      if (status === 401 && !skipAuth) {
        return SecureStore.deleteItemAsync("token").then(function () {
          var err = new Error("Session expired");
          err.status = 401;
          throw err;
        });
      }

      return res.text().then(function (text) {
        var data;
        try { data = text ? JSON.parse(text) : {}; } catch (e) { data = {}; }

        if (!res.ok) {
          var err = new Error(data.error || data.message || "Request failed");
          err.status = status;
          throw err;
        }
        return data;
      });
    });
  }

  if (skipAuth) {
    return doFetch(headers);
  }

  return SecureStore.getItemAsync("token").then(function (token) {
    if (token) headers["Authorization"] = "Bearer " + token;
    return doFetch(headers);
  });
}

var api = {
  get: function (ep, opts) {
    var o = opts || {};
    o.method = "GET";
    return request(ep, o);
  },
  post: function (ep, body, opts) {
    var o = opts || {};
    o.method = "POST";
    o.body = body;
    return request(ep, o);
  },
  put: function (ep, body, opts) {
    var o = opts || {};
    o.method = "PUT";
    o.body = body;
    return request(ep, o);
  },
  patch: function (ep, body, opts) {
    var o = opts || {};
    o.method = "PATCH";
    o.body = body;
    return request(ep, o);
  },
  del: function (ep, opts) {
    var o = opts || {};
    o.method = "DELETE";
    return request(ep, o);
  },
};

export default api;
