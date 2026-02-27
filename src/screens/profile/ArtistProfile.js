import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity as T,
  Image,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { users, artworks as artSvc, events as evSvc, exhibitions as exSvc } from "../../services/data";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
import { format } from "date-fns";

var W = Dimensions.get("window").width,
  G = 8,
  CW = (W - sp.lg * 2 - G) / 2;

// ── Section Header ──

function SectionLabel({ label }) {
  return (
    <Text
      style={{
        fontSize: fs.xxs,
        letterSpacing: 2,
        color: c.textMuted,
        fontWeight: fw.semi,
        marginTop: sp.xl,
        marginBottom: sp.md,
      }}
    >
      {label}
    </Text>
  );
}

// ── Event / Exhibition Card ──

function ListingCard({ item, onPress, emoji }) {
  var dateStr = "";
  if (item.startDate || item.date) {
    try {
      dateStr = format(new Date(item.startDate || item.date), "MMM d, yyyy");
    } catch {}
  }

  return (
    <T
      style={{
        width: 200,
        marginRight: sp.sm,
        backgroundColor: c.surface,
        borderRadius: rad.lg,
        borderWidth: 1,
        borderColor: c.borderLight,
        overflow: "hidden",
      }}
      onPress={onPress}
    >
      {item.coverImage?.url ? (
        <Image
          source={{ uri: item.coverImage.url }}
          style={{ width: "100%", height: 110, backgroundColor: c.surfaceDim }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: 110,
            backgroundColor: c.surfaceDim,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 24, color: c.textMuted }}>{emoji}</Text>
        </View>
      )}
      <View style={{ padding: sp.sm }}>
        <Text
          style={{
            fontSize: fs.sm,
            fontWeight: fw.semi,
            color: c.text,
          }}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        {dateStr ? (
          <Text style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 4 }}>
            {dateStr}
          </Text>
        ) : null}
        {item.location ? (
          <Text
            style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 2 }}
            numberOfLines={1}
          >
            📍 {item.location}
          </Text>
        ) : null}
        {item.status ? (
          <Text
            style={{
              fontSize: fs.xxs,
              color:
                item.status === "upcoming"
                  ? "#2dd4a0"
                  : item.status === "ongoing"
                    ? "#60a5fa"
                    : c.textMuted,
              fontWeight: fw.semi,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginTop: 4,
            }}
          >
            {item.status}
          </Text>
        ) : null}
      </View>
    </T>
  );
}

// ── Main Screen ──

export default function ArtistProfile({ route, navigation: n }) {
  var { username, id } = route.params;
  var identifier = username || id;
  var [p, sP] = useState(null);
  var [arts, sA] = useState([]);
  var [events, sEv] = useState([]);
  var [exhibitions, sEx] = useState([]);
  var [ld, sL] = useState(true);
  var [fol, sF] = useState(false);

  useFocusEffect(
    useCallback(
      function () {
        var cancelled = false;

        sP(null);
        sA([]);
        sEv([]);
        sEx([]);
        sL(true);
        sF(false);

        (async function () {
          try {
            if (!identifier) {
              sL(false);
              return;
            }

            var d = await users.get(identifier);

            if (cancelled || !d) {
              if (!cancelled) sL(false);
              return;
            }

            sP(d);

            if (d._id) {
              var [artRes, evRes, exRes] = await Promise.all([
                artSvc.list({ artist: d._id, limit: 50 }).catch(function () { return {}; }),
                evSvc.list({ organizer: d._id, limit: 20 }).catch(function () { return {}; }),
                exSvc.list({ organizer: d._id, limit: 20 }).catch(function () { return {}; }),
              ]);

              if (cancelled) return;

              var fetchedArts = artRes.artworks || artRes.data || [];
              sA(fetchedArts.filter(function (art) {
                return String(art.artist?._id || art.artist || "") === String(d._id);
              }));

              var fetchedEvs = evRes.events || evRes.data || [];
              sEv(fetchedEvs.filter(function (ev) {
                return String(ev.organizer?._id || ev.organizer || "") === String(d._id);
              }));

              var fetchedExs = exRes.exhibitions || exRes.data || [];
              sEx(fetchedExs.filter(function (ex) {
                return String(ex.organizer?._id || ex.organizer || "") === String(d._id);
              }));
            }
          } catch (e) {
            console.log("[ArtistProfile] Error:", e.message);
          }
          if (!cancelled) sL(false);
        })();

        return function () { cancelled = true; };
      },
      [identifier],
    ),
  );

  if (ld)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: c.bg,
        }}
      >
        <ActivityIndicator color={c.teal} />
      </View>
    );

  if (!p)
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <Text
          style={{ color: c.textMuted, textAlign: "center", marginTop: 60 }}
        >
          Not found
        </Text>
      </View>
    );

  var musicShows = events.filter(function (ev) { return ev.category === "music"; });
  var regularEvents = events.filter(function (ev) { return ev.category !== "music"; });

  function navigateToProfile(profileObj) {
    if (!profileObj) return;
    var param = profileObj.username
      ? { username: profileObj.username }
      : profileObj._id
        ? { id: profileObj._id }
        : null;
    if (param) n.push("ArtistProfile", param);
  }

  return (
    <FlatList
      key={identifier}
      style={{ flex: 1, backgroundColor: c.bg }}
      data={arts}
      keyExtractor={function (i) { return i._id; }}
      numColumns={2}
      contentContainerStyle={{ paddingHorizontal: sp.lg, paddingBottom: 100 }}
      ListHeaderComponent={
        <View
          style={{
            alignItems: "center",
            paddingVertical: sp.lg,
            marginBottom: sp.md,
          }}
        >
          {p.avatar ? (
            <Image
              source={{ uri: p.avatar }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                marginBottom: sp.md,
                borderWidth: 2,
                borderColor: c.borderLight,
              }}
            />
          ) : (
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                marginBottom: sp.md,
                backgroundColor: c.surfaceDim,
                borderWidth: 2,
                borderColor: c.borderLight,
              }}
            />
          )}

          <Text
            style={{ fontSize: fs.xxl, fontWeight: fw.light, color: c.text }}
          >
            {p.displayName}
          </Text>
          {p.location && (
            <Text
              style={{ fontSize: fs.sm, color: c.textMuted, marginTop: sp.xs }}
            >
              📍 {p.location}
            </Text>
          )}
          {p.bio && (
            <Text
              style={{
                fontSize: fs.sm,
                color: c.textSecondary,
                textAlign: "center",
                marginTop: sp.md,
                lineHeight: 20,
                maxWidth: 280,
              }}
            >
              {p.bio}
            </Text>
          )}

          <View
            style={{
              flexDirection: "row",
              backgroundColor: c.surface,
              borderWidth: 1,
              borderColor: c.borderLight,
              borderRadius: rad.lg,
              marginTop: sp.lg,
              paddingVertical: sp.md,
              paddingHorizontal: sp.xxl,
            }}
          >
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={{ fontSize: fs.lg, fontWeight: fw.semi, color: c.text }}
              >
                {p.followerCount || 0}
              </Text>
              <Text style={{ fontSize: fs.xs, color: c.textMuted }}>
                Followers
              </Text>
            </View>
            <View
              style={{
                width: 1,
                backgroundColor: c.borderLight,
                marginHorizontal: sp.lg,
              }}
            />
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={{ fontSize: fs.lg, fontWeight: fw.semi, color: c.text }}
              >
                {p.artworkCount || arts.length}
              </Text>
              <Text style={{ fontSize: fs.xs, color: c.textMuted }}>Works</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: sp.sm, marginTop: sp.md }}>
            <T
              style={{
                backgroundColor: fol ? "transparent" : c.teal,
                borderWidth: 1.5,
                borderColor: c.teal,
                borderRadius: rad.md,
                paddingVertical: 12,
                paddingHorizontal: 32,
              }}
              onPress={async function () {
                try {
                  var r = await users.follow(p._id);
                  sF(r.following);
                } catch {}
              }}
            >
              <Text
                style={{
                  fontSize: fs.sm,
                  fontWeight: fw.semi,
                  color: fol ? c.teal : c.textInverse,
                }}
              >
                {fol ? "Following" : "Follow"}
              </Text>
            </T>
            <T
              style={{
                borderWidth: 1.5,
                borderColor: c.border,
                borderRadius: rad.md,
                paddingVertical: 12,
                paddingHorizontal: 32,
              }}
              onPress={function () {
                n.navigate("Messages", {
                  screen: "Chat",
                  params: {
                    conversationId: null,
                    participantId: p._id,
                    name: p.displayName,
                  },
                });
              }}
            >
              <Text
                style={{ fontSize: fs.sm, fontWeight: fw.semi, color: c.text }}
              >
                Message
              </Text>
            </T>
          </View>

          {exhibitions.length > 0 && (
            <View style={{ alignSelf: "stretch" }}>
              <SectionLabel label="EXHIBITIONS" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: sp.md }}
              >
                {exhibitions.map(function (ex) {
                  return (
                    <ListingCard
                      key={ex._id}
                      item={ex}
                      emoji="🖼️"
                      onPress={function () {
                        n.push("ExhibitionDetail", { id: ex._id });
                      }}
                    />
                  );
                })}
              </ScrollView>
            </View>
          )}

          {regularEvents.length > 0 && (
            <View style={{ alignSelf: "stretch" }}>
              <SectionLabel label="EVENTS" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: sp.md }}
              >
                {regularEvents.map(function (ev) {
                  return (
                    <ListingCard
                      key={ev._id}
                      item={ev}
                      emoji="📅"
                      onPress={function () {
                        n.push("EventDetail", { id: ev._id });
                      }}
                    />
                  );
                })}
              </ScrollView>
            </View>
          )}

          {musicShows.length > 0 && (
            <View style={{ alignSelf: "stretch" }}>
              <SectionLabel label="MUSIC" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: sp.md }}
              >
                {musicShows.map(function (ev) {
                  return (
                    <ListingCard
                      key={ev._id}
                      item={ev}
                      emoji="🎵"
                      onPress={function () {
                        n.push("EventDetail", { id: ev._id });
                      }}
                    />
                  );
                })}
              </ScrollView>
            </View>
          )}

          {arts.length > 0 && (
            <View style={{ alignSelf: "stretch" }}>
              <SectionLabel label="WORKS" />
            </View>
          )}
        </View>
      }
      renderItem={function ({ item: i, index: idx }) {
        return (
          <T
            style={{
              width: CW,
              marginBottom: sp.md,
              ...(idx % 2 === 0 ? { marginRight: G / 2 } : { marginLeft: G / 2 }),
            }}
            onPress={function () {
              n.push("ArtworkDetail", { id: i._id });
            }}
          >
            <Image
              source={{ uri: i.images?.[0]?.url || null }}
              style={{
                width: "100%",
                aspectRatio: 0.75,
                borderRadius: rad.md,
                backgroundColor: c.surfaceDim,
              }}
            />
            <Text
              style={{
                fontSize: fs.xs,
                fontWeight: fw.medium,
                color: c.text,
                marginTop: sp.xs,
              }}
              numberOfLines={1}
            >
              {i.title}
            </Text>
            {i.pricing?.price > 0 && (
              <Text
                style={{
                  fontSize: fs.xs,
                  color: c.teal,
                  fontWeight: fw.bold,
                  marginTop: 2,
                }}
              >
                ${i.pricing.price.toLocaleString()}
              </Text>
            )}
          </T>
        );
      }}
    />
  );
}