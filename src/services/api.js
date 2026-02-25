import * as SecureStore from "expo-secure-store";
import { API_URL, API } from "../constants/api";
async function request(ep, opts = {}) {
  var { method = "GET", body, skipAuth = false } = opts;
  var h = { "Content-Type": "application/json" };
  if (!skipAuth) {
    var t = await SecureStore.getItemAsync("accessToken");
    if (t) h["Authorization"] = `Bearer ${t}`;
  }
  var res = await fetch(`${API_URL}${ep}`, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  });
  var data = await res.json();
  if (
    res.status === 401 &&
    !skipAuth &&
    ![API.login, API.register, API.refresh].some((r) => ep.includes(r))
  ) {
    var ok = await refresh();
    if (ok) {
      var t2 = await SecureStore.getItemAsync("accessToken");
      h["Authorization"] = `Bearer ${t2}`;
      var r2 = await fetch(`${API_URL}${ep}`, {
        method,
        headers: h,
        body: body ? JSON.stringify(body) : undefined,
      });
      data = await r2.json();
      if (!r2.ok) throw { response: { status: r2.status, data } };
      return data;
    }
    throw { response: { status: 401, data } };
  }
  if (!res.ok) throw { response: { status: res.status, data } };
  return data;
}
async function refresh() {
  try {
    var rt = await SecureStore.getItemAsync("refreshToken");
    if (!rt) return false;
    var r = await fetch(`${API_URL}${API.refresh}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!r.ok) return false;
    var d = await r.json();
    await SecureStore.setItemAsync("accessToken", d.data.token);
    await SecureStore.setItemAsync("refreshToken", d.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}
export default {
  get: (e, s) => request(e, { skipAuth: s }),
  post: (e, b, s) => request(e, { method: "POST", body: b, skipAuth: s }),
  put: (e, b) => request(e, { method: "PUT", body: b }),
  delete: (e) => request(e, { method: "DELETE" }),
};
