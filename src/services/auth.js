import api from "./api";
import * as SecureStore from "expo-secure-store";
import { API } from "../constants/api";

export var authService = {
  register: function (payload) {
    return api.post(API.register, payload, { skipAuth: true }).then(function (res) {
      var data = res.data || res;
      if (data && data.token) {
        return SecureStore.setItemAsync("token", String(data.token)).then(function () {
          if (data.refreshToken) {
            return SecureStore.setItemAsync("refreshToken", String(data.refreshToken)).then(function () { return data; });
          }
          return data;
        });
      }
      return data;
    });
  },

  login: function (email, password) {
    return api.post(API.login, { email: email, password: password }, { skipAuth: true }).then(function (res) {
      var data = res.data || res;
      if (data && data.token) {
        return SecureStore.setItemAsync("token", String(data.token)).then(function () {
          if (data.refreshToken) {
            return SecureStore.setItemAsync("refreshToken", String(data.refreshToken)).then(function () { return data; });
          }
          return data;
        });
      }
      return data;
    });
  },

  googleLogin: function (googleUser, accessToken) {
    return api.post("/mobile/google", {
      email: googleUser.email,
      name: googleUser.name,
      avatar: googleUser.picture,
      googleId: googleUser.id,
      accessToken: accessToken,
    }, { skipAuth: true }).then(function (res) {
      var data = res.data || res;
      if (data && data.token) {
        return SecureStore.setItemAsync("token", String(data.token)).then(function () { return data; });
      }
      return data;
    });
  },

  getProfile: function () {
    return api.get(API.me).then(function (res) {
      return res.data || res;
    });
  },

  updateProfile: function (updates) {
    return api.put(API.me, updates).then(function (res) {
      return res.data || res;
    });
  },

  logout: function () {
    return SecureStore.deleteItemAsync("token").then(function () {
      return SecureStore.deleteItemAsync("refreshToken").catch(function () {});
    });
  },

  isAuthenticated: function () {
    return SecureStore.getItemAsync("token").then(function (token) {
      return !!token;
    });
  },
};
