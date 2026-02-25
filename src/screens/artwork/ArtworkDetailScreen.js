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

var W = Dimensions.get("window").width;
var IMG_H = W * 1.15;

function ImageSlider({ images }) {
  var [idx, setIdx] = useState(0);
  var ref = useRef(null);
  if (!images?.length)
    return (
      <View
        style={{ width: W, height: IMG_H, backgroundColor: c.surfaceDim }}
      />
    );
  if (images.length === 1)
    return (
      <Image
        source={{ uri: images[0].url }}
        style={{ width: W, height: IMG_H, backgroundColor: c.surfaceDim }}
        resizeMode="cover"
      />
    );
  return (
    <View>
      <FlatList
        ref={ref}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) =>
          setIdx(Math.round(e.nativeEvent.contentOffset.x / W))
        }
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.url }}
            style={{ width: W, height: IMG_H, backgroundColor: c.surfaceDim }}
            resizeMode="cover"
          />
        )}
      />
      <View style={sl.dots}>
        {images.map((_, i) => (
          <View key={i} style={[sl.dot, i === idx && sl.dotActive]} />
        ))}
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
      <Text style={{ fontSize: fs.xs, color, fontWeight: fw.medium }}>
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
    return `$${price.toLocaleString()}`;
  }
}

export default function Detail({ route, navigation: n }) {
  var { id } = route.params;
  const { user: currentUser } = useAuth();
  var [a, sA] = useState(null);
  var [ld, sL] = useState(true);
  var [lk, sLk] = useState(false);
  var [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        var res = await fetch(`http://localhost:3000/api/artworks/${id}`);
        var json = await res.json();
        if (json.success) sA(json.data);
        else console.log(json.error);
      } catch (e) {
        console.log(e);
      }
      sL(false);
    })();
  }, [id]);

  var handleDelete = () => {
    Alert.alert("Delete Artwork", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            var res = await fetch(`http://localhost:3000/api/artworks/${id}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: currentUser._id }),
            });
            var json = await res.json();
            if (json.success) n.goBack();
          } catch (e) {
            console.log(e);
          }
          setDeleting(false);
        },
      },
    ]);
  };

  if (ld)
    return (
      <View style={s.ctr}>
        <ActivityIndicator color={c.teal} />
      </View>
    );
  if (!a)
    return (
      <View style={s.ctr}>
        <Text style={{ color: c.textMuted }}>Not found</Text>
      </View>
    );

  var ar = a.artist,
    d = a.dimensions;
  var isOwner = a.artist?.name === currentUser?.name;
  var created = a.createdAt
    ? new Date(a.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  var updated = a.updatedAt
    ? new Date(a.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  var typeBadges = [];
  if (a.isOriginal) typeBadges.push("Original");
  if (a.isPrint) typeBadges.push("Print");
  if (a.isDigital) typeBadges.push("Digital");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <ImageSlider images={a.images} />

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
            {a.title}
          </Text>
          {a.status && <StatusBadge status={a.status} />}
        </View>

        {a.isFeatured && (
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
          {a.year && (
            <Text style={{ fontSize: fs.sm, color: c.textMuted }}>
              {a.year}
            </Text>
          )}
          {a.medium && (
            <Text
              style={{
                fontSize: fs.sm,
                color: c.tealLight,
                fontWeight: fw.medium,
                textTransform: "capitalize",
              }}
            >
              {a.medium.replace(/_/g, " ")}
            </Text>
          )}
          {a.subject && (
            <Text
              style={{
                fontSize: fs.sm,
                color: c.textMuted,
                textTransform: "capitalize",
              }}
            >
              {a.subject.replace(/_/g, " ")}
            </Text>
          )}
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
            {typeBadges.map((b) => (
              <Tag key={b} label={b} color={c.teal} bg={c.tealBg} />
            ))}
          </View>
        )}

        {/* ── Artist Row ── */}
        {ar && (
          <T
            style={s.aRow}
            onPress={() =>
              n.navigate("ArtistProfile", { username: ar.username })
            }
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
                  {ar.displayName}
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
                {a.forSale && a.price > 0
                  ? formatPrice(a.price, a.currency)
                  : a.forSale
                    ? "On request"
                    : "Not for sale"}
              </Text>
              {a.forSale &&
                a.price > 0 &&
                a.currency &&
                a.currency !== "USD" && (
                  <Text style={{ fontSize: fs.xs, color: c.textMuted }}>
                    {a.currency}
                  </Text>
                )}
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: sp.sm }}>
            <T
              style={s.iconBtn}
              onPress={async () => {
                try {
                  var res = await fetch(
                    `http://localhost:3000/api/artworks/${id}/like`,
                    { method: "POST" },
                  );
                  var json = await res.json();
                  if (json.success) sLk(json.liked);
                } catch {}
              }}
            >
              <Text style={{ fontSize: 20, color: lk ? c.rose : c.textMuted }}>
                {lk ? "♥" : "♡"}
              </Text>
            </T>
            <T
              style={s.iconBtn}
              onPress={() => Share.share({ message: `Check out "${a.title}"` })}
            >
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
        ) : (
          a.status === "available" &&
          a.forSale && (
            <T style={s.buyBtn}>
              <Text style={s.btnText}>Inquire to Purchase</Text>
            </T>
          )
        )}
      </View>

      {/* ── Description ── */}
      {(a.description || a.aiDescription) && (
        <Section label="ABOUT THIS WORK">
          {a.description ? (
            <Text
              style={{
                fontSize: fs.md,
                color: c.textSecondary,
                lineHeight: 24,
              }}
            >
              {a.description}
            </Text>
          ) : null}
          {a.aiDescription && a.aiDescription !== a.description ? (
            <View style={{ marginTop: a.description ? sp.md : 0 }}>
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
                {a.aiDescription}
              </Text>
            </View>
          ) : null}
        </Section>
      )}

      {/* ── Artwork Details ── */}
      <Section label="DETAILS">
        <View style={{ gap: 2 }}>
          {a.medium && <Row l="Medium" v={a.medium.replace(/_/g, " ")} />}
          {a.style && <Row l="Style" v={a.style.replace(/_/g, " ")} />}
          {a.subject && <Row l="Subject" v={a.subject.replace(/_/g, " ")} />}
          {a.mood && <Row l="Mood" v={a.mood} />}
          {d?.width && d?.height && (
            <Row
              l="Dimensions"
              v={`${d.width} × ${d.height}${d.depth ? ` × ${d.depth}` : ""} ${d.unit || "in"}`}
            />
          )}
          {a.year && <Row l="Year" v={String(a.year)} />}
          {a.edition && <Row l="Edition" v={a.edition} />}
          {a.isOriginal && <Row l="Type" v="Original" />}
          {a.isPrint && <Row l="Print" v="Yes" />}
          {a.isDigital && <Row l="Digital" v="Yes" />}
          {a.currency && <Row l="Currency" v={a.currency} />}
          {a.shippingInfo && <Row l="Shipping" v={a.shippingInfo} />}
        </View>
      </Section>

      {/* ── Materials ── */}
      {a.materials?.length > 0 && (
        <Section label="MATERIALS">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: sp.sm }}>
            {a.materials.map((m) => (
              <Tag key={m} label={m} color={c.text} bg={c.surfaceDim} />
            ))}
          </View>
        </Section>
      )}

      {/* ── Categories ── */}
      {a.categories?.length > 0 && (
        <Section label="CATEGORIES">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: sp.sm }}>
            {a.categories.map((cat) => (
              <Tag
                key={cat}
                label={cat.replace(/_/g, " ")}
                color={c.tealLight}
                bg={c.tealBg}
              />
            ))}
          </View>
        </Section>
      )}

      {/* ── Dominant Colors ── */}
      {a.dominantColors?.length > 0 && (
        <Section label="COLOR PALETTE">
          <View style={{ flexDirection: "row", gap: sp.sm, flexWrap: "wrap" }}>
            {a.dominantColors.map((hex, i) => (
              <ColorDot key={i} hex={hex} />
            ))}
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
          <StatBlock label="Views" value={a.views || 0} />
          <StatBlock label="Likes" value={a.likesCount || 0} />
          <StatBlock label="Saves" value={a.savesCount || 0} />
          <StatBlock label="Comments" value={a.commentsCount || 0} />
        </View>
      </Section>

      {/* ── Tags ── */}
      {a.tags?.length > 0 && (
        <Section label="TAGS">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: sp.sm }}>
            {a.tags.map((t) => (
              <Tag key={t} label={t} color={c.teal} bg={c.tealBg} />
            ))}
          </View>
        </Section>
      )}

      {/* ── AI Tags ── */}
      {a.aiTags?.length > 0 && (
        <Section label="AI TAGS">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: sp.sm }}>
            {a.aiTags.map((t) => (
              <Tag key={t} label={t} color={c.textMuted} bg={c.surfaceDim} />
            ))}
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
