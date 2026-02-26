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
import { events as evSvc } from "../../services/data";
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

// ── Main Screen ──

export default function EventDetailScreen({ route, navigation }) {
  var { id } = route.params;
  var { user: currentUser } = useAuth();
  var [ev, setEv] = useState(null);
  var [loading, setLoading] = useState(true);

  useEffect(
    function () {
      (async function () {
        try {
          var res = await evSvc.get(id);
          setEv(res.data || res);
        } catch (e) {
          console.log("Event load error:", e.message);
        }
        setLoading(false);
      })();
    },
    [id],
  );

  function handleShare() {
    if (ev) {
      Share.share({ message: 'Check out "' + ev.title + '"' });
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

  if (!ev) {
    return (
      <View style={s.center}>
        <Text style={{ color: c.textMuted, fontSize: fs.md }}>
          Event not found
        </Text>
      </View>
    );
  }

  // ── Derived data ──

  var org = ev.organizer;

  var isOwner = false;
  if (currentUser && org) {
    var orgId = String(org._id || org);
    var userId = String(currentUser._id || currentUser.id);
    isOwner = orgId === userId;
  }

  var isMusic = ev.category === "music";
  var typeLabel = isMusic ? "Music Show" : "Event";

  var dateStr = "";
  if (ev.date || ev.startDate) {
    dateStr = format(new Date(ev.date || ev.startDate), "MMMM d, yyyy");
    if (ev.endDate) {
      dateStr += " — " + format(new Date(ev.endDate), "MMM d, yyyy");
    }
  }

  var timeStr = "";
  if (ev.startTime) {
    timeStr = ev.startTime;
    if (ev.endTime) timeStr += " – " + ev.endTime;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Cover Image ── */}
      {ev.coverImage?.url ? (
        <Image
          source={{ uri: ev.coverImage.url }}
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
          <Text style={{ fontSize: 40, color: c.textMuted }}>
            {isMusic ? "🎵" : "📅"}
          </Text>
        </View>
      )}

      {/* ── Title & Type Badge ── */}
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
            {ev.title}
          </Text>
          {ev.status ? <StatusBadge status={ev.status} /> : null}
        </View>

        {/* Event/Music type badge */}
        {ev.type ? (
          <View style={s.typeBadge}>
            <Text style={s.typeBadgeText}>
              {ev.type.replace("_", " ")}
            </Text>
          </View>
        ) : null}

        {/* ── Info Rows ── */}
        <View style={{ gap: sp.sm, marginTop: sp.md }}>
          {dateStr ? <Row label="Date" value={dateStr} /> : null}
          {timeStr ? <Row label="Time" value={timeStr} /> : null}
          {ev.location ? <Row label="Location" value={ev.location} /> : null}
          {ev.isOnline ? <Row label="Format" value="Virtual / Online" /> : null}
          {ev.link ? <Row label="Link" value={ev.link} /> : null}
          {ev.isFree ? (
            <Row label="Admission" value="Free" />
          ) : ev.price ? (
            <Row
              label="Ticket"
              value={formatPrice(ev.price, ev.currency || "NOK")}
            />
          ) : null}
          {ev.maxAttendees ? (
            <Row label="Capacity" value={String(ev.maxAttendees)} />
          ) : null}
          {isMusic ? <Row label="Category" value="Music" /> : null}
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
          {ev.link && ev.isOnline ? (
            <T
              style={[
                s.actionBtn,
                { backgroundColor: c.teal, borderColor: c.teal },
              ]}
            >
              <Text style={[s.actionBtnText, { color: c.textInverse }]}>
                Join Online
              </Text>
            </T>
          ) : null}
          <T
            style={[
              s.actionBtn,
              { backgroundColor: c.teal, borderColor: c.teal, flex: 1 },
            ]}
          >
            <Text style={[s.actionBtnText, { color: c.textInverse }]}>
              RSVP
            </Text>
          </T>
        </View>
      </View>

      {/* ── Description ── */}
      {ev.description ? (
        <Section label="ABOUT">
          <Text
            style={{
              fontSize: fs.md,
              color: c.textSecondary,
              lineHeight: 24,
            }}
          >
            {ev.description}
          </Text>
        </Section>
      ) : null}

      {/* ── Details ── */}
      <Section label="DETAILS">
        <View style={{ gap: 2 }}>
          {ev.status ? <Row label="Status" value={ev.status} /> : null}
          {ev.type ? (
            <Row label="Type" value={ev.type.replace("_", " ")} />
          ) : null}
          {ev.isOnline !== undefined ? (
            <Row label="Online" value={ev.isOnline ? "Yes" : "No"} />
          ) : null}
          {ev.rsvps?.length > 0 ? (
            <Row label="RSVPs" value={String(ev.rsvps.length)} />
          ) : null}
          {ev.maxAttendees ? (
            <Row label="Capacity" value={String(ev.maxAttendees)} />
          ) : null}
          {ev.createdAt ? (
            <Row
              label="Created"
              value={format(new Date(ev.createdAt), "MMM d, yyyy")}
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
                "Delete " + typeLabel,
                "Are you sure? This cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async function () {
                      try {
                        await evSvc.remove(id);
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
              Delete {typeLabel}
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
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: c.tealGlow || c.tealBg,
    borderRadius: rad.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: sp.sm,
  },
  typeBadgeText: {
    fontSize: fs.xxs,
    color: c.tealLight,
    fontWeight: fw.semi,
    textTransform: "capitalize",
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
