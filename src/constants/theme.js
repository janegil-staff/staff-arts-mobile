import { Dimensions } from "react-native";

// ── DARKROOM ──
//
// The feeling of developing a print.
// Deep warm blacks. Safelight amber. Chemical cyan.
// Your art glows against the dark like a slide on a lightbox.
// Intimate. Focused. Every pixel of your work pops.
//
// Inspired by: darkrooms, lightboxes, gallery openings at night,
// the glow of a screen in a dim studio at 1am.

var _dim = Dimensions.get("window") || {};
export var screen = { width: _dim.width || 390, height: _dim.height || 844 };

// ── Raw palette ──

var void0 = "#0C0C0E";        // near-black with warmth
var cave = "#141416";          // primary surface
var smoke = "#1C1C20";         // elevated cards
var ash = "#26262B";           // input backgrounds
var fog = "#3A3A42";           // subtle borders
var stone = "#5C5C66";         // muted text
var cloud = "#8E8E99";         // secondary text
var bone = "#C8C8D0";          // primary text — not pure white, easier on eyes
var snow = "#EDEDF0";          // headings, emphasis
var pure = "#FFFFFF";          // inverse, button labels

var safelight = "#F0A830";     // amber — warm, inviting, the red-orange glow
var safeSoft = "rgba(240,168,48,0.10)";
var safeGlow = "rgba(240,168,48,0.20)";
var chemical = "#3EC9D1";      // cyan — cool contrast, discovery, tags
var chemSoft = "rgba(62,201,209,0.10)";
var fixer = "#E85D75";         // rose-red — likes, hearts, alerts
var fixerSoft = "rgba(232,93,117,0.10)";
var developer = "#4ADE80";     // green — success, available, online
var devSoft = "rgba(74,222,128,0.10)";

export var colors = {
  // Foundations
  bg: void0,
  surface: cave,
  surfaceDim: void0,
  surfaceElevated: smoke,
  elevated: smoke,
  hover: ash,
  overlay: "rgba(0,0,0,0.6)",
  scrim: "rgba(0,0,0,0.4)",
  shimmer: "rgba(240,168,48,0.03)",

  // Text hierarchy
  text: snow,
  textSecondary: bone,
  textMuted: cloud,
  textDim: stone,
  textInverse: void0,

  // Primary accent — safelight amber
  accent: safelight,
  accentLight: "#F5BF5E",
  accentDark: "#D4922A",
  accentMuted: safeSoft,
  accentGlow: safeGlow,

  // Secondary — chemical cyan for tags, discovery, filters
  cyan: chemical,
  cyanMuted: chemSoft,
  teal: chemical,
  tealBg: chemSoft,

  // Warm — rose for social, likes
  coral: fixer,
  coralMuted: fixerSoft,
  rose: fixer,

  // Premium — gold is the accent itself
  gold: safelight,
  goldMuted: safeSoft,
  amber: safelight,
  amberBg: safeSoft,

  // Status
  success: developer,
  successMuted: devSoft,
  danger: "#EF4444",
  error: "#EF4444",
  warning: "#F59E0B",

  // Borders — barely visible, just enough structure
  border: fog,
  borderLight: ash,
  borderAccent: safeGlow,
  borderFocus: safelight,

  white: pure,
  black: "#000000",
};

// ── Spacing — generous for artwork breathing room ──

export var sp = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// ── Radii — sharp-ish, architectural ──

export var rad = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

// ── Type scale ──

export var fs = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 34,
  hero: 40,
  display: 48,
};

export var fw = {
  light: "300",
  regular: "400",
  medium: "500",
  semi: "600",
  semibold: "600",
  bold: "700",
  heavy: "800",
};

// ── Cards — lightbox panels ──

export var glassCard = {
  backgroundColor: cave,
  borderWidth: 1,
  borderColor: fog,
  borderRadius: rad.lg,
};

export var featureCard = {
  backgroundColor: smoke,
  borderWidth: 0,
  borderRadius: rad.xl,
  overflow: "hidden",
};

export var outlineCard = {
  backgroundColor: "transparent",
  borderWidth: 1,
  borderColor: fog,
  borderRadius: rad.md,
};

export var premiumCard = {
  backgroundColor: cave,
  borderWidth: 1,
  borderColor: safeGlow,
  borderRadius: rad.lg,
};

export var socialCard = {
  backgroundColor: smoke,
  borderWidth: 0,
  borderRadius: rad.lg,
};

// ── Shadows — subtle glow, not drop shadows ──

export var shadows = {
  sm: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  glow: {
    shadowColor: safelight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
};
