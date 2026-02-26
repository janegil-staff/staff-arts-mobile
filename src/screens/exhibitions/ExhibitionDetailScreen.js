import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity as T,
  ActivityIndicator,
  StyleSheet,
  Share,
  Alert,
} from "react-native";
import { exhibitions as exSvc } from "../../services/data";
import { useAuth } from "../../store/authStore";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
import { format } from "date-fns";

// ── Helpers ──

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

function StatusBadge({ status }) {
  var configs = {
    upcoming: { bg: "#0d3b2e", text: "#2dd4a0" },
    ongoing: { bg: "#1e2d4a", text: "#60a5fa" },
    past: { bg: "#1e1e2e", text: "#94a3b8" },
    cancelled: { bg: "#3b1c1c", text: "#f87171" },
  };
  var col = configs[status] || configs.upcoming;
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
        {status}
      </Text>
    </View>
  );
}

function Section({ label, children }) {
  return (
    <View style={s.card}>
      <Text style={s.secLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
      }}
    >
      <Text style={{ fontSize: fs.sm, color: c.textMuted }}>{label}</Text>
      <Text
        style={{
          fontSize: fs.sm,
          color: c.text,
          textAlign: "right",
          flex: 1,
          marginLeft: sp.lg,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function ArtistChip({ artist, onPress }) {
  return (
    <T style={s.artistChip} onPress={onPress}>
      {artist.avatar ? (
        <Image source={{ uri: artist.avatar }} style={s.artistAvatar} />
      ) : (
        <View style={[s.artistAvatar, { backgroundColor: c.surfaceDim }]} />
      )}
      <Text
        style={{
          fontSize: fs.sm,
          color: c.text,
          fontWeight: fw.medium,
        }}
        numberOfLines={1}
      >
        {artist.displayName || artist.name}
      </Text>
    </T>
  );
}

function ArtworkThumb({ artwork, onPress }) {
  var img = artwork.images?.[0]?.url;
  return (
    <T style={s.artworkThumb} onPress={onPress}>
      {img ? (
        <Image source={{ uri: img }} style={s.artworkImg} />
      ) : (
        <View style={[s.artworkImg, { backgroundColor: c.surfaceDim }]} />
      )}
      <Text
        style={{
          fontSize: fs.xs,
          color: c.text,
          fontWeight: fw.medium,
          marginTop: sp.xs,
        }}
        numberOfLines={1}
      >
        {artwork.title}
      </Text>
    </T>
  );
}

// ── Main Screen ──

export default function ExhibitionDetailScreen({ route, navigation }) {
  var { id } = route.params;
  var { user: currentUser } = useAuth();
  var [ex, setEx] = useState(null);
  var [loading, setLoading] = useState(true);

  useEffect(
    function () {
      (async function () {
        try {
          var res = await exSvc.get(id);
          setEx(res.data || res);
        } catch (e) {
          console.log("Exhibition load error:", e.message);
        }
        setLoading(false);
      })();
    },
    [id],
  );

  function handleShare() {
    if (ex) {
      Share.share({ message: 'Check out "' + ex.title + '"' });
    }
  }

  // ── Loading / Error ──

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={c.teal} />
      </View>
    );
  }

  if (!ex) {
    return (
      <View style={s.center}>
        <Text style={{ color: c.textMuted, fontSize: fs.md }}>
          Exhibition not found
        </Text>
      </View>
    );
  }

  // ── Derived data ──

  var org = ex.organizer;

  var isOwner = false;
  if (currentUser && org) {
    var orgId = String(org._id || org);
    var userId = String(currentUser._id || currentUser.id);
    isOwner = orgId === userId;
  }

  var hasArtists = ex.artists && ex.artists.length > 0;
  var hasArtworks = ex.artworks && ex.artworks.length > 0;

  var dateStr = "";
  if (ex.startDate) {
    dateStr = format(new Date(ex.startDate), "MMM d");
    if (ex.endDate) {
      dateStr += " — " + format(new Date(ex.endDate), "MMM d, yyyy");
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Cover Image ── */}
      {ex.coverImage?.url ? (
        <Image
          source={{ uri: ex.coverImage.url }}
          style={{ width: "100%", height: 260 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: 180,
            backgroundColor: c.surfaceDim,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 40, color: c.textMuted }}>🖼️</Text>
        </View>
      )}

      {/* ── Title & Status ── */}
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
            {ex.title}
          </Text>
          {ex.status ? <StatusBadge status={ex.status} /> : null}
        </View>

        {ex.isFeatured ? (
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
        ) : null}

        {/* ── Info Rows ── */}
        <View style={{ gap: sp.sm, marginTop: sp.md }}>
          {dateStr ? <Row label="Dates" value={dateStr} /> : null}
          {ex.location ? <Row label="Location" value={ex.location} /> : null}
          {ex.isVirtual ? <Row label="Format" value="Virtual / Online" /> : null}
          {ex.virtualUrl ? <Row label="Link" value={ex.virtualUrl} /> : null}
          {ex.isFree ? (
            <Row label="Admission" value="Free" />
          ) : ex.ticketPrice ? (
            <Row
              label="Ticket"
              value={formatPrice(ex.ticketPrice, ex.currency || "NOK")}
            />
          ) : null}
        </View>

        {/* ── Organizer ── */}
        {org && typeof org === "object" ? (
          <T
            style={s.organizerRow}
            onPress={function () {
              if (org.username) {
                navigation.navigate("ArtistProfile", {
                  username: org.username,
                });
              }
            }}
          >
            {org.avatar ? (
              <Image source={{ uri: org.avatar }} style={s.orgAvatar} />
            ) : (
              <View style={[s.orgAvatar, { backgroundColor: c.surfaceDim }]} />
            )}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: fs.xxs,
                  color: c.textMuted,
                  letterSpacing: 1,
                  marginBottom: 2,
                }}
              >
                ORGANIZER
              </Text>
              <Text
                style={{
                  fontSize: fs.md,
                  fontWeight: fw.semi,
                  color: c.text,
                }}
              >
                {org.displayName || org.name}
              </Text>
            </View>
            <Text style={{ fontSize: fs.sm, color: c.textMuted }}>→</Text>
          </T>
        ) : null}

        {/* ── Actions ── */}
        <View
          style={{
            flexDirection: "row",
            gap: sp.sm,
            marginTop: sp.md,
          }}
        >
          <T style={s.actionBtn} onPress={handleShare}>
            <Text style={s.actionBtnText}>Share</Text>
          </T>
          {ex.virtualUrl && ex.isVirtual ? (
            <T
              style={[
                s.actionBtn,
                { backgroundColor: c.teal, borderColor: c.teal },
              ]}
            >
              <Text style={[s.actionBtnText, { color: c.textInverse }]}>
                Visit Online
              </Text>
            </T>
          ) : null}
          {!ex.isFree && ex.ticketPrice ? (
            <T
              style={[
                s.actionBtn,
                { backgroundColor: c.teal, borderColor: c.teal, flex: 1 },
              ]}
            >
              <Text style={[s.actionBtnText, { color: c.textInverse }]}>
                Get Tickets
              </Text>
            </T>
          ) : null}
        </View>
      </View>

      {/* ── Description ── */}
      {ex.description ? (
        <Section label="ABOUT">
          <Text
            style={{
              fontSize: fs.md,
              color: c.textSecondary,
              lineHeight: 24,
            }}
          >
            {ex.description}
          </Text>
        </Section>
      ) : null}

      {/* ── Featured Artists ── */}
      {hasArtists ? (
        <Section label="ARTISTS">
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: sp.sm,
            }}
          >
            {ex.artists.map(function (artist) {
              var artistId = artist._id || artist;
              var artistObj =
                typeof artist === "object" ? artist : { _id: artist };
              return (
                <ArtistChip
                  key={artistId}
                  artist={artistObj}
                  onPress={function () {
                    if (artistObj.username) {
                      navigation.navigate("ArtistProfile", {
                        username: artistObj.username,
                      });
                    }
                  }}
                />
              );
            })}
          </View>
        </Section>
      ) : null}

      {/* ── Artworks ── */}
      {hasArtworks ? (
        <Section label="ARTWORKS">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: sp.sm }}
          >
            {ex.artworks.map(function (artwork) {
              var artId = artwork._id || artwork;
              var artObj =
                typeof artwork === "object" ? artwork : { _id: artwork };
              return (
                <ArtworkThumb
                  key={artId}
                  artwork={artObj}
                  onPress={function () {
                    navigation.navigate("ArtworkDetail", { id: artId });
                  }}
                />
              );
            })}
          </ScrollView>
        </Section>
      ) : null}

      {/* ── Details ── */}
      <Section label="DETAILS">
        <View style={{ gap: 2 }}>
          {ex.status ? <Row label="Status" value={ex.status} /> : null}
          {ex.isVirtual !== undefined ? (
            <Row label="Virtual" value={ex.isVirtual ? "Yes" : "No"} />
          ) : null}
          {ex.attendees?.length > 0 ? (
            <Row label="Attendees" value={String(ex.attendees.length)} />
          ) : null}
          {ex.views ? <Row label="Views" value={String(ex.views)} /> : null}
          {ex.createdAt ? (
            <Row
              label="Created"
              value={format(new Date(ex.createdAt), "MMM d, yyyy")}
            />
          ) : null}
        </View>
      </Section>

      {/* ── Owner Actions ── */}
      {isOwner ? (
        <View style={{ marginHorizontal: sp.md, marginTop: sp.md, marginBottom: sp.lg }}>
          <T
            style={{
              backgroundColor: "#2a1515",
              borderColor: "#5c2020",
              borderWidth: 1,
              borderRadius: rad.md,
              paddingVertical: 16,
              alignItems: "center",
            }}
            onPress={function () {
              Alert.alert(
                "Delete Exhibition",
                "Are you sure? This cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async function () {
                      try {
                        await exSvc.remove(id);
                        navigation.goBack();
                      } catch (e) {
                        Alert.alert("Error", e.message || "Failed to delete");
                      }
                    },
                  },
                ],
              );
            }}
          >
            <Text
              style={{ fontSize: fs.md, color: "#f87171", fontWeight: fw.semi }}
            >
              Delete Exhibition
            </Text>
          </T>
        </View>
      ) : null}
    </ScrollView>
  );
}

// ── Styles ──

var s = StyleSheet.create({
  center: {
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
  secLabel: {
    fontSize: fs.xxs,
    letterSpacing: 2,
    color: c.textMuted,
    fontWeight: fw.semi,
    marginBottom: sp.md,
  },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: sp.md,
    paddingVertical: sp.md,
    borderTopWidth: 1,
    borderColor: c.borderLight,
    marginTop: sp.md,
  },
  orgAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  artistChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: sp.sm,
    backgroundColor: c.bg,
    borderRadius: rad.full,
    paddingRight: 14,
    paddingLeft: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: c.borderLight,
  },
  artistAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  artworkThumb: {
    width: 120,
  },
  artworkImg: {
    width: 120,
    height: 150,
    borderRadius: rad.md,
    backgroundColor: c.surfaceDim,
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: rad.md,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: "center",
  },
  actionBtnText: {
    fontSize: fs.sm,
    fontWeight: fw.semi,
    color: c.text,
  },
});
