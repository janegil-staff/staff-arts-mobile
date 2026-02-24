import { createContext, useContext, useReducer, useEffect, useMemo } from "react";
import { auth } from "../services/data";

var AuthContext = createContext(null);

var initial = { user: null, ok: false, loading: true };

function reducer(state, action) {
  switch (action.type) {
    case "LOADING": return { user: state.user, ok: state.ok, loading: true };
    case "SIGNED_IN": return { user: action.user, ok: true, loading: false };
    case "SIGNED_OUT": return { user: null, ok: false, loading: false };
    default: return state;
  }
}

export function AuthProvider({ children }) {
  var [state, dispatch] = useReducer(reducer, initial);

  useEffect(function () {
    (async function () {
      try {
        if (await auth.check()) {
          var u = await auth.me();
          dispatch({ type: "SIGNED_IN", user: u });
        } else {
          dispatch({ type: "SIGNED_OUT" });
        }
      } catch (e) {
        await auth.logout();
        dispatch({ type: "SIGNED_OUT" });
      }
    })();
  }, []);

  var actions = useMemo(function () {
    return {
      login: async function (email, pw) {
        dispatch({ type: "LOADING" });
        try {
          var r = await auth.login(email, pw);
          dispatch({ type: "SIGNED_IN", user: r.user });
        } catch (err) {
          dispatch({ type: "SIGNED_OUT" });
          throw err;
        }
      },
      register: async function (payload) {
        dispatch({ type: "LOADING" });
        try {
          var r = await auth.register(payload);
          dispatch({ type: "SIGNED_IN", user: r.user });
        } catch (err) {
          dispatch({ type: "SIGNED_OUT" });
          throw err;
        }
      },
      logout: async function () {
        await auth.logout();
        dispatch({ type: "SIGNED_OUT" });
      },
      check: async function () {
        dispatch({ type: "LOADING" });
        try {
          if (await auth.check()) {
            var u = await auth.me();
            dispatch({ type: "SIGNED_IN", user: u });
          } else {
            dispatch({ type: "SIGNED_OUT" });
          }
        } catch (e) {
          await auth.logout();
          dispatch({ type: "SIGNED_OUT" });
        }
      },
    };
  }, []);

  var value = {
    user: state.user,
    ok: state.ok,
    loading: state.loading,
    login: actions.login,
    register: actions.register,
    logout: actions.logout,
    check: actions.check,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  var ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
