import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity as T,
  StyleSheet as S,
  Dimensions,
  FlatList,
  Alert,
  Share,
  Animated,
} from "react-native";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
import { useAuth } from "../../store/authStore";
import { artworks } from "../../services/data";

var W = Dimensions.get("window").width;
var IMG_H = W * 1.15;

// ── Skeleton Shimmer ──

function Skeleton({ width, height, style }) {
  var anim = useRef(new Animated.Value(0.3)).current;

  useEffect(function () {
    var loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return function () { loop.stop(); };
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width,
          height: height,
          backgroundColor: c.surfaceDim,
          borderRadius: rad.md,
          opacity: anim,
        },
        style,
      ]}
    />
  );
}

function ArtworkSkeleton() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      showsVerticalScrollIndicator={false}
    >
      {/* Image skeleton */}
      <Skeleton width={W} height={IMG_H} style={{ borderRadius: 0 }} />

      {/* Title & meta card */}
      <View style={s.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Skeleton width={"65%"} height={24} />
          <Skeleton width={70} height={24} style={{ borderRadius: rad.full }} />
        </View>
        <View style={{ flexDirection: "row", gap: sp.sm, marginTop: sp.md }}>
          <Skeleton width={50} height={14} />
          <Skeleton width={80} height={14} />
          <Skeleton width={60} height={14} />
        </View>

        {/* Artist row skeleton */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: sp.md,
            paddingVertical: sp.md,
            marginTop: sp.md,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: c.borderLight,
          }}
        >
          <Skeleton width={44} height={44} style={{ borderRadius: 22 }} />
          <View style={{ flex: 1 }}>
            <Skeleton width={120} height={16} />
            <Skeleton width={80} height={12} style={{ marginTop: sp.xs }} />
          </View>
        </View>

        {/* Price skeleton */}
        <View style={{ marginTop: sp.lg }}>
          <Skeleton width={50} height={10} />
          <Skeleton width={100} height={24} style={{ marginTop: sp.xs }} />
        </View>

        {/* Button skeleton */}
        <Skeleton width={"100%"} height={56} style={{ marginTop: sp.lg, borderRadius: rad.md }} />
      </View>

      {/* Description card skeleton */}
      <View style={s.card}>
        <Skeleton width={120} height={10} style={{ marginBottom: sp.md }} />
        <Skeleton width={"100%"} height={14} />
        <Skeleton width={"90%"} height={14} style={{ marginTop: sp.sm }} />
        <Skeleton width={"75%"} height={14} style={{ marginTop: sp.sm }} />
      </View>

      {/* Details card skeleton */}
      <View style={s.card}>
        <Skeleton width={60} height={10} style={{ marginBottom: sp.md }} />
        {[1, 2, 3, 4].map(function (i) {
          return (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
              <Skeleton width={80} height={14} />
              <Skeleton width={100} height={14} />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ── Error State ──

function ErrorState({ message, onRetry, onBack }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: c.bg,
        paddingHorizontal: sp.xl,
      }}
    >
      <Text style={{ fontSize: 48, marginBottom: sp.md }}>😔</Text>
      <Text
        style={{
          fontSize: fs.md,
          color: c.textSecondary,
          textAlign: "center",
          marginBottom: sp.lg,
          maxWidth: 280,
        }}
      >
        {message}
      </Text>
      <View style={{ flexDirection: "row", gap: sp.sm }}>
        {onBack ? (
          <T
            style={{
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: rad.md,
              borderWidth: 1,
              borderColor: c.border,
            }}
            onPress={onBack}
          >
            <Text style={{ fontSize: fs.sm, fontWeight: fw.semi, color: c.text }}>
              Go Back
            </Text>
          </T>
        ) : null}
        <T
          style={{
            backgroundColor: c.teal,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: rad.md,
          }}
          onPress={onRetry}
        >
          <Text style={{ fontSize: fs.sm, fontWeight: fw.semi, color: c.textInverse }}>
            Try Again
          </Text>
        </T>
      </View>
    </View>
  );
}

// ── Not Found State ──

function NotFoundState({ onBack }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: c.bg,
        paddingHorizontal: sp.xl,
      }}
    >
      <Text style={{ fontSize: 48, marginBottom: sp.md }}>🖼️</Text>
      <Text
        style={{
          fontSize: fs.lg,
          fontWeight: fw.medium,
          color: c.text,
          marginBottom: sp.xs,
        }}
      >
        Artwork not found
      </Text>
      <Text
        style={{
          fontSize: fs.sm,
          color: c.textMuted,
          textAlign: "center",
          maxWidth: 260,
          marginBottom: sp.lg,
        }}
      >
        This piece may have been removed or is no longer available
      </Text>
      {onBack ? (
        <T
          style={{
            backgroundColor: c.teal,
            paddingVertical: 12,
            paddingHorizontal: 32,
            borderRadius: rad.md,
          }}
          onPress={onBack}
        >
          <Text style={{ fontSize: fs.sm, fontWeight: fw.semi, color: c.textInverse }}>
            Go Back
          </Text>
        </T>
      ) : null}
    </View>
  );
}

// ── Image Slider ──

function ImageSlider({ images }) {
  var [idx, setIdx] = useState(0);
  var ref = useRef(null);

  if (!images?.length) {
    return (
      <View
        style={{ width: W, height: IMG_H, backgroundColor: c.surfaceDim }}
      />
    );
  }

  if (images.length === 1) {
    return (
      <Image
        source={{ uri: images[0].url }}
        style={{ width: W, height: IMG_H, backgroundColor: c.surfaceDim }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View>
      <FlatList
        ref={ref}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={function (_, i) {
          return String(i);
        }}
        onMomentumScrollEnd={function (e) {
          setIdx(Math.round(e.nativeEvent.contentOffset.x / W));
        }}
        renderItem={function ({ item }) {
          return (
            <Image
              source={{ uri: item.url }}
              style={{ width: W, height: IMG_H, backgroundColor: c.surfaceDim }}
              resizeMode="cover"
            />
          );
        }}
      />
      <View style={sl.dots}>
        {images.map(function (_, i) {
          return <View key={i} style={[sl.dot, i === idx && sl.dotActive]} />;
        })}
      </View>
      <View style={sl.counter}>
        <Text style={sl.counterText}>
          {idx + 1}/{images.length}
        </Text>
      </View>
    </View>
  );
}

var sl = S.create({
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: { backgroundColor: "#fff", width: 20 },
  counter: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: rad.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  counterText: { color: "#fff", fontSize: fs.xs, fontWeight: fw.medium },
});

// ── Reusable Components ──

function StatusBadge({ status }) {
  var colors = {
    available: { bg: "#0d3b2e", text: "#2dd4a0" },
    sold: { bg: "#3b1c1c", text: "#f87171" },
    draft: { bg: "#1e1e2e", text: "#94a3b8" },
    archived: { bg: "#1e1e2e", text: "#94a3b8" },
    published: { bg: "#0d3b2e", text: "#2dd4a0" },
  };
  var col = colors[status] || colors.published;
  return (
    <View
      style={{
        backgroundColor: col.bg,
        borderRadius: rad.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          fontSize: fs.xxs,
          fontWeight: fw.semi,
          color: col.text,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {status?.replace(/_/g, " ")}
      </Text>
    </View>
  );
}

function Section({ label, children }) {
  return (
    <View style={s.card}>
      <Text style={s.secL}>{label}</Text>
      {children}
    </View>
  );
}

function Tag({ label, color, bg }) {
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: rad.full,
        paddingHorizontal: 12,
        paddingVertical: 6,
      }}
    >
      <Text style={{ fontSize: fs.xs, color: color, fontWeight: fw.medium }}>
        {label}
      </Text>
    </View>
  );
}

function StatBlock({ label, value }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={{ fontSize: fs.xl, fontWeight: fw.bold, color: c.text }}>
        {value}
      </Text>
      <Text
        style={{
          fontSize: fs.xxs,
          color: c.textMuted,
          marginTop: 2,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function ColorDot({ hex }) {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: hex,
        borderWidth: 2,
        borderColor: c.borderLight,
      }}
    />
  );
}

function Row({ l, v }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
      }}
    >
      <Text style={{ fontSize: fs.sm, color: c.textMuted }}>{l}</Text>
      <Text
        style={{
          fontSize: fs.sm,
          color: c.text,
          textTransform: "capitalize",
          textAlign: "right",
          flex: 1,
          marginLeft: sp.lg,
        }}
      >
        {v}
      </Text>
    </View>
  );
}

function formatPrice(price, currency) {
  try {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  } catch {
    return "$" + price.toLocaleString();
  }
}

function formatDimensions(d) {
  if (!d) return null;
  if (!d.width && !d.height) return null;
  var unit = d.unit || "in";
  var parts = [];
  if (d.height) parts.push(d.height);
  if (d.width) parts.push(d.width);
  if (d.depth) parts.push(d.depth);
  return parts.join(" × ") + " " + unit;
}

// ── Main Screen ──

export default function ArtworkDetailScreen({ route, navigation }) {
  var { id } = route.params;
  var { user: currentUser } = useAuth();
  var [artwork, setArtwork] = useState(null);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState(null);
  var [liked, setLiked] = useState(false);
  var [deleting, setDeleting] = useState(false);

  function fetchArtwork() {
    setLoading(true);
    setError(null);
    setArtwork(null);
    (async function () {
      try {
        var data = await artworks.get(id);
        setArtwork(data);
        if (currentUser && data.likes) {
          setLiked(
            data.likes.some(function (uid) {
              return uid === currentUser._id || uid._id === currentUser._id;
            }),
          );
        }
      } catch (e) {
        console.log("Failed to load artwork:", e.message);
        setError("Couldn't load this artwork. Check your connection and try again.");
      }
      setLoading(false);
    })();
  }

  useEffect(function () {
    fetchArtwork();
  }, [id]);

  function navigateToProfile(profileObj) {
    if (!profileObj) return;
    var profileId = String(profileObj._id || profileObj);
    var myId = String(currentUser?._id || currentUser?.id || "");

    // If it's the current user, go to their own profile tab
    if (myId && profileId === myId) {
      navigation.navigate("Tabs", { screen: "Profile" });
      return;
    }

    if (profileObj.username) {
      navigation.push("ArtistProfile", { username: profileObj.username });
    } else if (profileObj._id) {
      navigation.push("ArtistProfile", { id: profileObj._id });
    }
  }

  async function handleLike() {
    try {
      var data = await artworks.like(id);
      setLiked(data.liked);
      setArtwork(function (prev) {
        if (!prev) return prev;
        return Object.assign({}, prev, {
          likesCount:
            data.likesCount !== undefined ? data.likesCount : prev.likesCount,
        });
      });
    } catch (e) {
      console.log("Like failed:", e.message);
    }
  }

  function handleDelete() {
    Alert.alert("Delete Artwork", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async function () {
          setDeleting(true);
          try {
            await artworks.remove(id);
            navigation.goBack();
          } catch (e) {
            Alert.alert("Error", e.message || "Failed to delete");
          }
          setDeleting(false);
        },
      },
    ]);
  }

  function handleShare() {
    Share.share({ message: 'Check out "' + artwork.title + '"' });
  }

  function handleInquire() {
    var ar = artwork.artist;
    navigation.navigate("Messages", {
      screen: "Chat",
      params: {
        conversationId: null,
        participantId: ar?._id,
        name: ar?.displayName || ar?.name,
        listingId: artwork._id,
        listingTitle: artwork.title,
        listingPrice: artwork.price,
        listingCurrency: artwork.currency,
        listingImage: artwork.images?.[0]?.url,
      },
    });
  }

  // ── Loading / Error / Not Found states ──

  if (loading) {
    return <ArtworkSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={fetchArtwork}
        onBack={function () { navigation.goBack(); }}
      />
    );
  }

  if (!artwork) {
    return (
      <NotFoundState
        onBack={function () { navigation.goBack(); }}
      />
    );
  }

  // ── Derived data ──

  var ar = artwork.artist;
  var d = artwork.dimensions;
  var dimStr = formatDimensions(d);

  var isOwner = false;
  if (currentUser && ar) {
    var artistId = String(ar._id || ar);
    var userId = String(currentUser._id || currentUser.id);
    isOwner = artistId === userId;
  }

  var created = artwork.createdAt
    ? new Date(artwork.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  var updated = artwork.updatedAt
    ? new Date(artwork.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  var typeBadges = [];
  if (artwork.isOriginal) typeBadges.push("Original");
  if (artwork.isPrint) typeBadges.push("Print");
  if (artwork.isDigital) typeBadges.push("Digital");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <ImageSlider images={artwork.images} />

      {/* ── Title, Status & Meta ── */}
      <View style={s.card}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: sp.sm,
          }}
        >
          <Text
            style={{
              fontSize: fs.xxl,
              fontWeight: fw.light,
              color: c.text,
              flex: 1,
            }}
          >
            {artwork.title}
          </Text>
          {artwork.status && <StatusBadge status={artwork.status} />}
        </View>

        {artwork.isFeatured && (
          <Text
            style={{
              fontSize: fs.xs,
              color: c.amber,
              fontWeight: fw.semi,
              marginTop: 4,
            }}
          >
            ★ Featured
          </Text>
        )}

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: sp.sm,
            marginTop: sp.xs,
            marginBottom: sp.lg,
          }}
        >
          {artwork.year ? (
            <Text style={{ fontSize: fs.sm, color: c.textMuted }}>
              {artwork.year}
            </Text>
          ) : null}
          {artwork.medium ? (
            <Text
              style={{
                fontSize: fs.sm,
                color: c.tealLight,
                fontWeight: fw.medium,
                textTransform: "capitalize",
              }}
            >
              {artwork.medium.replace(/_/g, " ")}
            </Text>
          ) : null}
          {artwork.subject ? (
            <Text
              style={{
                fontSize: fs.sm,
                color: c.textMuted,
                textTransform: "capitalize",
              }}
            >
              {artwork.subject.replace(/_/g, " ")}
            </Text>
          ) : null}
          {dimStr ? (
            <Text style={{ fontSize: fs.sm, color: c.textMuted }}>
              {dimStr}
            </Text>
          ) : null}
        </View>

        {/* Type badges */}
        {typeBadges.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              gap: sp.sm,
              marginBottom: sp.md,
            }}
          >
            {typeBadges.map(function (b) {
              return <Tag key={b} label={b} color={c.teal} bg={c.tealBg} />;
            })}
          </View>
        )}

        {/* ── Artist Row ── */}
        {ar && typeof ar === "object" && (
          <T
            style={s.aRow}
            onPress={function () {
              navigateToProfile(ar);
            }}
          >
            {ar.avatar ? (
              <Image source={{ uri: ar.avatar }} style={s.av} />
            ) : (
              <View style={[s.av, { backgroundColor: c.surfaceDim }]} />
            )}
            <View style={{ flex: 1 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Text
                  style={{
                    fontSize: fs.md,
                    fontWeight: fw.semi,
                    color: c.text,
                  }}
                >
                  {ar.displayName || ar.name}
                </Text>
                {ar.verified && (
                  <Text style={{ fontSize: 14, color: c.teal }}>✓</Text>
                )}
              </View>
              {ar.location && (
                <Text
                  style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 2 }}
                >
                  {ar.location}
                </Text>
              )}
            </View>
            <Text style={{ fontSize: fs.sm, color: c.textMuted }}>→</Text>
          </T>
        )}

        {/* ── Price & Actions ── */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: sp.md,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: fs.xxs,
                letterSpacing: 1,
                color: c.textMuted,
                fontWeight: fw.semi,
              }}
            >
              PRICE
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                gap: 6,
              }}
            >
              <Text
                style={{
                  fontSize: fs.xl,
                  fontWeight: fw.bold,
                  color: c.amber,
                  marginTop: 2,
                }}
              >
                {artwork.forSale && artwork.price > 0
                  ? formatPrice(artwork.price, artwork.currency)
                  : artwork.forSale
                    ? "On request"
                    : "Not for sale"}
              </Text>
              {artwork.forSale &&
                artwork.price > 0 &&
                artwork.currency &&
                artwork.currency !== "USD" && (
                  <Text style={{ fontSize: fs.xs, color: c.textMuted }}>
                    {artwork.currency}
                  </Text>
                )}
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: sp.sm }}>
            <T style={s.iconBtn} onPress={handleLike}>
              <Text
                style={{ fontSize: 20, color: liked ? c.rose : c.textMuted }}
              >
                {liked ? "♥" : "♡"}
              </Text>
            </T>
            <T style={s.iconBtn} onPress={handleShare}>
              <Text style={{ fontSize: 18, color: c.textMuted }}>↗</Text>
            </T>
          </View>
        </View>

        {/* ── Action Button ── */}
        {isOwner ? (
          <T
            style={[s.buyBtn, { backgroundColor: c.rose }]}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <View style={{ height: 22 }}>
                <Text style={[s.btnText, { opacity: 0.6 }]}>Deleting...</Text>
              </View>
            ) : (
              <Text style={s.btnText}>Delete Artwork</Text>
            )}
          </T>
        ) : artwork.status === "available" && artwork.forSale ? (
          <T style={s.buyBtn} onPress={handleInquire}>
            <Text style={s.btnText}>Inquire to Purchase</Text>
          </T>
        ) : null}
      </View>

      {/* ── Description ── */}
      {(artwork.description || artwork.aiDescription) && (
        <Section label="ABOUT THIS WORK">
          {artwork.description ? (
            <Text
              style={{
                fontSize: fs.md,
                color: c.textSecondary,
                lineHeight: 24,
              }}
            >
              {artwork.description}
            </Text>
          ) : null}
          {artwork.aiDescription &&
          artwork.aiDescription !== artwork.description ? (
            <View style={{ marginTop: artwork.description ? sp.md : 0 }}>
              <Text
                style={{
                  fontSize: fs.xxs,
                  color: c.textMuted,
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                AI ANALYSIS
              </Text>
              <Text
                style={{
                  fontSize: fs.sm,
                  color: c.textSecondary,
                  lineHeight: 22,
                  fontStyle: "italic",
                }}
              >
                {artwork.aiDescription}
              </Text>
            </View>
          ) : null}
        </Section>
      )}

      {/* ── Artwork Details ── */}
      <Section label="DETAILS">
        <View style={{ gap: 2 }}>
          {artwork.medium ? (
            <Row l="Medium" v={artwork.medium.replace(/_/g, " ")} />
          ) : null}
          {artwork.style ? (
            <Row l="Style" v={artwork.style.replace(/_/g, " ")} />
          ) : null}
          {artwork.subject ? (
            <Row l="Subject" v={artwork.subject.replace(/_/g, " ")} />
          ) : null}
          {artwork.mood ? <Row l="Mood" v={artwork.mood} /> : null}
          {dimStr ? <Row l="Dimensions" v={dimStr} /> : null}
          {artwork.year ? <Row l="Year" v={String(artwork.year)} /> : null}
          {artwork.edition ? <Row l="Edition" v={artwork.edition} /> : null}
          {artwork.isOriginal ? <Row l="Type" v="Original" /> : null}
          {artwork.isPrint ? <Row l="Print" v="Yes" /> : null}
          {artwork.isDigital ? <Row l="Digital" v="Yes" /> : null}
          {artwork.currency ? <Row l="Currency" v={artwork.currency} /> : null}
          {artwork.shippingInfo ? (
            <Row l="Shipping" v={artwork.shippingInfo} />
          ) : null}
        </View>
      </Section>

      {/* ── Materials ── */}
      {artwork.materials?.length > 0 && (
        <Section label="MATERIALS">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: sp.sm }}>
            {artwork.materials.map(function (m) {
              return <Tag key={m} label={m} color={c.text} bg={c.surfaceDim} />;
            })}
          </View>
        </Section>
      )}

      {/* ── Categories ── */}
      {artwork.categories?.length > 0 && (
        <Section label="CATEGORIES">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: sp.sm }}>
            {artwork.categories.map(function (cat) {
              return (
                <Tag
                  key={cat}
                  label={cat.replace(/_/g, " ")}
                  color={c.tealLight}
                  bg={c.tealBg}
                />
              );
            })}
          </View>
        </Section>
      )}

      {/* ── Dominant Colors ── */}
      {artwork.dominantColors?.length > 0 && (
        <Section label="COLOR PALETTE">
          <View style={{ flexDirection: "row", gap: sp.sm, flexWrap: "wrap" }}>
            {artwork.dominantColors.map(function (hex, i) {
              return <ColorDot key={i} hex={hex} />;
            })}
          </View>
        </Section>
      )}

      {/* ── Engagement ── */}
      <Section label="ENGAGEMENT">
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            paddingVertical: sp.sm,
          }}
        >
          <StatBlock label="Views" value={artwork.views || 0} />
          <StatBlock label="Likes" value={artwork.likesCount || 0} />
          <StatBlock label="Saves" value={artwork.savesCount || 0} />
          <StatBlock label="Comments" value={artwork.commentsCount || 0} />
        </View>
      </Section>

      {/* ── Tags ── */}
      {artwork.tags?.length > 0 && (
        <Section label="TAGS">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: sp.sm }}>
            {artwork.tags.map(function (tag) {
              return <Tag key={tag} label={tag} color={c.teal} bg={c.tealBg} />;
            })}
          </View>
        </Section>
      )}

      {/* ── AI Tags ── */}
      {artwork.aiTags?.length > 0 && (
        <Section label="AI TAGS">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: sp.sm }}>
            {artwork.aiTags.map(function (tag) {
              return (
                <Tag
                  key={tag}
                  label={tag}
                  color={c.textMuted}
                  bg={c.surfaceDim}
                />
              );
            })}
          </View>
        </Section>
      )}

      {/* ── Timestamps ── */}
      <View style={[s.card, { marginBottom: sp.lg }]}>
        {created && (
          <Text style={{ fontSize: fs.xs, color: c.textMuted }}>
            Listed {created}
          </Text>
        )}
        {updated && updated !== created && (
          <Text style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 4 }}>
            Updated {updated}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

var s = S.create({
  ctr: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: c.bg,
  },
  card: {
    marginHorizontal: sp.md,
    marginTop: sp.md,
    backgroundColor: c.surface,
    borderRadius: rad.lg,
    padding: sp.lg,
    borderWidth: 1,
    borderColor: c.borderLight,
  },
  aRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: sp.md,
    paddingVertical: sp.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: c.borderLight,
    marginBottom: sp.lg,
  },
  av: { width: 44, height: 44, borderRadius: 22 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.bg,
    borderWidth: 1,
    borderColor: c.border,
    justifyContent: "center",
    alignItems: "center",
  },
  buyBtn: {
    backgroundColor: c.teal,
    paddingVertical: 20,
    alignItems: "center",
    borderRadius: rad.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  btnText: {
    color: c.textInverse,
    fontSize: fs.lg,
    fontWeight: fw.bold,
    letterSpacing: 0.5,
  },
  secL: {
    fontSize: fs.xxs,
    letterSpacing: 2,
    color: c.textMuted,
    fontWeight: fw.semi,
    marginBottom: sp.md,
  },
});