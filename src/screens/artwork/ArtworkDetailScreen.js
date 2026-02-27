import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity as T,
  StyleSheet as S,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Alert,
  Share,
} from "react-native";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
import { useAuth } from "../../store/authStore";
import { artworks } from "../../services/data";

var W = Dimensions.get("window").width;
var IMG_H = W * 1.15;

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
  var [liked, setLiked] = useState(false);
  var [deleting, setDeleting] = useState(false);

  useEffect(
    function () {
      setLoading(true);
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
        }
        setLoading(false);
      })();
    },
    [id],
  );

  function navigateToProfile(profileObj) {
    if (!profileObj) return;
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
    navigation.navigate("Chat", {
      sellerId: ar?._id,
      listingId: artwork._id,
      listingTitle: artwork.title,
      listingPrice: artwork.price,
      listingImage: artwork.images?.[0]?.url,
    });
  }

  // ── Loading / Error states ──

  if (loading) {
    return (
      <View style={s.ctr}>
        <ActivityIndicator color={c.teal} />
      </View>
    );
  }

  if (!artwork) {
    return (
      <View style={s.ctr}>
        <Text style={{ color: c.textMuted }}>Not found</Text>
      </View>
    );
  }

  // ── Derived data ──

  var ar = artwork.artist;
  var d = artwork.dimensions;
  var dimStr = formatDimensions(d);
console.log("[ArtworkDetail] artist object:", JSON.stringify(ar));
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
              <ActivityIndicator color={c.textInverse} />
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