// Price formatting
export function formatPrice(amount, currency) {
  if (!currency) currency = "USD";
  if (!amount && amount !== 0) return "On request";
  return "$" + Number(amount).toLocaleString();
}

// Truncate text
export function truncate(str, max) {
  if (!max) max = 100;
  if (!str || str.length <= max) return str || "";
  return str.substring(0, max).trim() + "...";
}

// Initials from name
export function initials(name) {
  if (!name) return "?";
  return name.split(" ").map(function (w) { return w[0]; }).join("").toUpperCase().substring(0, 2);
}

// Time ago (lightweight, no dep)
export function timeAgo(date) {
  var s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  var m = Math.floor(s / 60);
  if (m < 60) return m + "m ago";
  var h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  var d = Math.floor(h / 24);
  if (d < 30) return d + "d ago";
  var mo = Math.floor(d / 30);
  if (mo < 12) return mo + "mo ago";
  return Math.floor(mo / 12) + "y ago";
}

// Compact number (1200 -> 1.2K)
export function compact(n) {
  if (!n) return "0";
  if (n < 1000) return String(n);
  if (n < 1000000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
}
