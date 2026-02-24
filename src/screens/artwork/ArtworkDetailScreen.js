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
} from "react-native";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
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
  dotActive: {
    backgroundColor: "#fff",
    width: 20,
  },
  counter: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: rad.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  counterText: {
    color: "#fff",
    fontSize: fs.xs,
    fontWeight: fw.medium,
  },
});

export default function Detail({ route, navigation: n }) {
  var { id } = route.params;
  var [a, sA] = useState(null);
  var [ld, sL] = useState(true);
  var [lk, sLk] = useState(false);
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
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <ImageSlider images={a.images} />
      <View style={s.card}>
        <Text style={{ fontSize: fs.xxl, fontWeight: fw.light, color: c.text }}>
          {a.title}
        </Text>
        <View
          style={{
            flexDirection: "row",
            gap: sp.md,
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
              {a.medium.replace("_", " ")}
            </Text>
          )}
        </View>
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
              <Text
                style={{ fontSize: fs.md, fontWeight: fw.semi, color: c.text }}
              >
                {ar.displayName}
              </Text>
              {ar.location && (
                <Text
                  style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 2 }}
                >
                  {ar.location}
                </Text>
              )}
            </View>
          </T>
        )}
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
              Price
            </Text>
            <Text
              style={{
                fontSize: fs.xl,
                fontWeight: fw.bold,
                color: c.amber,
                marginTop: 2,
              }}
            >
              {a.price > 0 ? `$${a.price.toLocaleString()}` : "On request"}
            </Text>
          </View>
          <T
            style={s.lkBtn}
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
        </View>
        {a.status === "available" && (
          <T style={s.buyBtn}>
            <Text
              style={{
                color: c.textInverse,
                fontSize: fs.lg,
                fontWeight: fw.bold,
                letterSpacing: 0.5,
              }}
            >
              Inquire to Purchase
            </Text>
          </T>
        )}
      </View>
      <View style={s.card}>
        <Text style={s.secL}>ABOUT THIS WORK</Text>
        {a.description && (
          <Text
            style={{
              fontSize: fs.md,
              color: c.textSecondary,
              lineHeight: 24,
              marginBottom: sp.lg,
            }}
          >
            {a.description}
          </Text>
        )}
        <View style={{ gap: sp.md }}>
          {d?.width && d?.height && (
            <Row l="Dimensions" v={`${d.width}×${d.height} ${d.unit}`} />
          )}
          {a.style?.length > 0 && (
            <Row
              l="Style"
              v={Array.isArray(a.style) ? a.style.join(", ") : a.style}
            />
          )}
          <Row l="Views" v={String(a.views || 0)} />
          <Row l="Likes" v={String(a.likesCount || 0)} />
        </View>
        {a.tags?.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: sp.sm,
              marginTop: sp.lg,
            }}
          >
            {a.tags.map((t) => (
              <View
                key={t}
                style={{
                  backgroundColor: c.tealBg,
                  borderRadius: rad.full,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: fs.xs,
                    color: c.teal,
                    fontWeight: fw.medium,
                  }}
                >
                  {t}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
function Row({ l, v }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ fontSize: fs.sm, color: c.textMuted }}>{l}</Text>
      <Text
        style={{ fontSize: fs.sm, color: c.text, textTransform: "capitalize" }}
      >
        {v}
      </Text>
    </View>
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
  lkBtn: {
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
  secL: {
    fontSize: fs.xxs,
    letterSpacing: 2,
    color: c.textMuted,
    fontWeight: fw.semi,
    marginBottom: sp.md,
  },
});
