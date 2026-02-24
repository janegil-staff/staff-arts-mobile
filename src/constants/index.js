export { colors, sp, rad, fs, fw, screen, glassCard, featureCard, outlineCard, premiumCard, socialCard, shadows } from "./theme";
export { API_URL, API } from "./api";

export var ART_CATEGORIES = [
  "Painting",
  "Photography",
  "Sculpture",
  "Digital Art",
  "Drawing",
  "Printmaking",
  "Mixed Media",
  "Textile",
  "Ceramics",
  "Installation",
];

export var USER_ROLES = [
  { value: "artist", label: "Artist", desc: "Showcase and sell your work" },
  { value: "gallery", label: "Gallery", desc: "Curate exhibitions" },
  { value: "collector", label: "Collector", desc: "Discover and collect" },
];

export var SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "popular", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export var MEDIUMS = [
  "Oil",
  "Acrylic",
  "Watercolor",
  "Digital",
  "Photography",
  "Ink",
  "Charcoal",
  "Mixed Media",
  "Sculpture",
  "Printmaking",
  "Other",
];

export var EVENT_TYPES = [
  "Opening",
  "Workshop",
  "Talk",
  "Fair",
  "Performance",
  "Screening",
];

export var ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "warning" },
  { value: "paid", label: "Paid", color: "accent" },
  { value: "shipped", label: "Shipped", color: "cyan" },
  { value: "delivered", label: "Delivered", color: "success" },
  { value: "cancelled", label: "Cancelled", color: "danger" },
];

export var COMMISSION_STATUSES = [
  { value: "pending", label: "Pending", color: "warning" },
  { value: "accepted", label: "Accepted", color: "accent" },
  { value: "in_progress", label: "In Progress", color: "cyan" },
  { value: "review", label: "Under Review", color: "gold" },
  { value: "completed", label: "Completed", color: "success" },
  { value: "declined", label: "Declined", color: "danger" },
];

export var NOTIFICATION_TYPES = {
  like: { icon: "heart", color: "coral" },
  comment: { icon: "chatbubble", color: "cyan" },
  follow: { icon: "person-add", color: "accent" },
  sale: { icon: "cash", color: "success" },
  commission: { icon: "brush", color: "gold" },
  exhibition: { icon: "calendar", color: "accent" },
  message: { icon: "mail", color: "cyan" },
};

export var REPORT_REASONS = [
  "Spam",
  "Inappropriate content",
  "Harassment",
  "Copyright violation",
  "Misleading",
  "Other",
];
