export function formatPrice(cents, currency) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(cents / 100);
}

export function timeAgo(date) {
  var s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  if (s < 604800) return Math.floor(s / 86400) + "d";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(date));
}

export function getInitials(name) {
  return (name || "?").split(" ").filter(Boolean).map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase();
}

export function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export function truncate(str, max) {
  max = max || 100;
  return str.length <= max ? str : str.slice(0, max).trimEnd() + "…";
}
