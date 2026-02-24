// ── Price ──

export function formatPrice(cents, currency) {
  var cur = currency || "USD";
  var val = (cents || 0) / 100;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(val);
  } catch (e) {
    return "$" + val.toFixed(2);
  }
}

export function formatPriceDollars(dollars, currency) {
  var cur = currency || "USD";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(dollars || 0);
  } catch (e) {
    return "$" + (dollars || 0).toFixed(2);
  }
}

// ── Time ──

export function timeAgo(date) {
  if (!date) return "";
  var s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 0) return "just now";
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  if (s < 604800) return Math.floor(s / 86400) + "d";
  if (s < 2592000) return Math.floor(s / 604800) + "w";
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(date));
  } catch (e) {
    return new Date(date).toLocaleDateString();
  }
}

export function formatDate(date, options) {
  if (!date) return "";
  var opts = options || { month: "long", day: "numeric", year: "numeric" };
  try {
    return new Intl.DateTimeFormat("en-US", opts).format(new Date(date));
  } catch (e) {
    return new Date(date).toLocaleDateString();
  }
}

export function formatTime(date) {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(date));
  } catch (e) {
    return new Date(date).toLocaleTimeString();
  }
}

export function formatDateTime(date) {
  if (!date) return "";
  return formatDate(date, { month: "short", day: "numeric" }) + " at " + formatTime(date);
}

// ── Numbers ──

export function formatCount(n) {
  if (!n && n !== 0) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

// ── Text ──

export function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase();
}

export function truncate(str, max) {
  if (!str) return "";
  max = max || 100;
  return str.length <= max ? str : str.slice(0, max).trimEnd() + "\u2026";
}

export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str) {
  if (!str) return "";
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : (plural || singular + "s");
}
