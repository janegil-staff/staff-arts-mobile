import React, { createContext, useContext, useReducer, useEffect, useMemo } from "react";
import { authService } from "../services/auth";

var AuthContext = createContext(null);

var initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOADING":
      return { user: state.user, isAuthenticated: state.isAuthenticated, isLoading: true, error: null };
    case "LOGIN_SUCCESS":
      return { user: action.user, isAuthenticated: true, isLoading: false, error: null };
    case "LOGOUT":
      return { user: null, isAuthenticated: false, isLoading: false, error: null };
    case "ERROR":
      return { user: state.user, isAuthenticated: state.isAuthenticated, isLoading: false, error: action.error };
    case "UPDATE_USER":
      return { user: action.user, isAuthenticated: state.isAuthenticated, isLoading: false, error: null };
    case "CLEAR_ERROR":
      return { user: state.user, isAuthenticated: state.isAuthenticated, isLoading: state.isLoading, error: null };
    default:
      return state;
  }
}

export function AuthProvider(props) {
  var ref = useReducer(reducer, initialState);
  var state = ref[0];
  var dispatch = ref[1];

  useEffect(function () {
    checkAuth();
  }, []);

  function checkAuth() {
    dispatch({ type: "LOADING" });
    authService.isAuthenticated().then(function (hasToken) {
      if (hasToken) {
        return authService.getProfile().then(function (user) {
          dispatch({ type: "LOGIN_SUCCESS", user: user });
        });
      } else {
        dispatch({ type: "LOGOUT" });
      }
    }).catch(function () {
      authService.logout().catch(function () {});
      dispatch({ type: "LOGOUT" });
    });
  }

  function login(email, password) {
    dispatch({ type: "LOADING" });
    return authService.login(email, password).then(function (res) {
      dispatch({ type: "LOGIN_SUCCESS", user: res.user });
    }).catch(function (e) {
      dispatch({ type: "ERROR", error: e.message });
      throw e;
    });
  }

  function register(payload) {
    dispatch({ type: "LOADING" });
    var body = {};
    var keys = Object.keys(payload);
    for (var i = 0; i < keys.length; i++) body[keys[i]] = payload[keys[i]];
    if (body.name && !body.displayName) body.displayName = body.name;

    return authService.register(body).then(function (res) {
      dispatch({ type: "LOGIN_SUCCESS", user: res.user });
    }).catch(function (e) {
      dispatch({ type: "ERROR", error: e.message });
      throw e;
    });
  }

  function logout() {
    return authService.logout().then(function () {
      dispatch({ type: "LOGOUT" });
    });
  }

  function googleLogin(googleUser, accessToken) {
    dispatch({ type: "LOADING" });
    return authService.googleLogin(googleUser, accessToken).then(function (res) {
      var user = res.user;
      if (!user) {
        return authService.getProfile().then(function (u) {
          dispatch({ type: "LOGIN_SUCCESS", user: u });
        });
      }
      dispatch({ type: "LOGIN_SUCCESS", user: user });
    }).catch(function (e) {
      dispatch({ type: "ERROR", error: e.message });
      throw e;
    });
  }

  function updateProfile(updates) {
    return authService.updateProfile(updates).then(function (user) {
      dispatch({ type: "UPDATE_USER", user: user });
    });
  }

  function clearError() {
    dispatch({ type: "CLEAR_ERROR" });
  }

  var value = useMemo(function () {
    return {
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
      login: login,
      register: register,
      logout: logout,
      googleLogin: googleLogin,
      updateProfile: updateProfile,
      clearError: clearError,
      checkAuth: checkAuth,
    };
  }, [state]);

  return React.createElement(AuthContext.Provider, { value: value }, props.children);
}

export function useAuth() {
  var ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
