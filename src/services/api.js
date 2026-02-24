import * as SecureStore from "expo-secure-store";
import { BASE, EP } from "../constants/api";

async function getToken() {
  try { return await SecureStore.getItemAsync("token"); } catch { return null; }
}

async function setTokens(token, refresh) {
  await SecureStore.setItemAsync("token", token);
  if (refresh) await SecureStore.setItemAsync("rtoken", refresh);
}

async function clearTokens() {
  await SecureStore.deleteItemAsync("token");
  await SecureStore.deleteItemAsync("rtoken");
}

async function refreshToken() {
  try {
    var rt = await SecureStore.getItemAsync("rtoken");
    if (!rt) return false;
    var res = await fetch(BASE + EP.refresh, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return false;
    var data = await res.json();
    await setTokens(data.data.token, data.data.refreshToken);
    return true;
  } catch { return false; }
}

export async function api(path, opts) {
  var token = await getToken();
  var headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = "Bearer " + token;
  if (opts && opts.headers) Object.assign(headers, opts.headers);

  var res = await fetch(BASE + path, Object.assign({}, opts, { headers }));

  if (res.status === 401 && token) {
    var refreshed = await refreshToken();
    if (refreshed) {
      headers.Authorization = "Bearer " + (await getToken());
      res = await fetch(BASE + path, Object.assign({}, opts, { headers }));
    }
  }

  var json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json.data || json;
}

export { getToken, setTokens, clearTokens };
