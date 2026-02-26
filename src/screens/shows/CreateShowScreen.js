import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { exhibitions, events, upload } from "../../services/data";
import { useAuth } from "../../store/authStore";
import { colors as c, sp, rad, fs, fw } from "../../constants/theme";

var SHOW_TYPES = [
  { key: "exhibition", label: "Exhibition" },
  { key: "event", label: "Event" },
];

var EVENT_TYPES = [
  { key: "opening", label: "Opening" },
  { key: "workshop", label: "Workshop" },
  { key: "talk", label: "Talk" },
  { key: "fair", label: "Fair" },
  { key: "other", label: "Other" },
];

var CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "NOK", symbol: "kr", label: "NOK (kr)" },
  { code: "SEK", symbol: "kr", label: "SEK (kr)" },
  { code: "CAD", symbol: "$", label: "CAD ($)" },
  { code: "AUD", symbol: "$", label: "AUD ($)" },
  { code: "JPY", symbol: "¥", label: "JPY (¥)" },
  { code: "CHF", symbol: "Fr", label: "CHF (Fr)" },
];

export default function CreateShowScreen({ navigation }) {
  var { user } = useAuth();

  // Common fields
  var [showType, setShowType] = useState("exhibition");
  var [title, setTitle] = useState("");
  var [description, setDescription] = useState("");
  var [coverImage, setCoverImage] = useState(null);
  var [location, setLocation] = useState("");
  var [isOnline, setIsOnline] = useState(false);
  var [link, setLink] = useState("");
  var [isFree, setIsFree] = useState(true);
  var [price, setPrice] = useState("");
  var [currency, setCurrency] = useState("NOK");

  var activeCurrency = CURRENCIES.find(function (cur) {
    return cur.code === currency;
  });

  // Date fields
  var [startDate, setStartDate] = useState(new Date());
  var [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );
  var [showStartPicker, setShowStartPicker] = useState(false);
  var [showEndPicker, setShowEndPicker] = useState(false);

  // Event-specific
  var [eventType, setEventType] = useState("other");
  var [maxAttendees, setMaxAttendees] = useState("");

  // State
  var [submitting, setSubmitting] = useState(false);
  var [progress, setProgress] = useState("");

  var isExhibition = showType === "exhibition";

  async function pickCover() {
    var perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to add a cover image",
      );
      return;
    }
    var result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      setCoverImage(result.assets[0].uri);
    }
  }

  function removeCover() {
    setCoverImage(null);
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function onStartDateChange(e, selected) {
    setShowStartPicker(Platform.OS === "ios");
    if (selected) {
      setStartDate(selected);
      if (selected > endDate) {
        setEndDate(new Date(selected.getTime() + 24 * 60 * 60 * 1000));
      }
    }
  }

  function onEndDateChange(e, selected) {
    setShowEndPicker(Platform.OS === "ios");
    if (selected) {
      setEndDate(selected);
    }
  }

  async function onSubmit() {
    if (!title.trim()) return Alert.alert("Required", "Enter a title");
    if (!location.trim() && !isOnline)
      return Alert.alert("Required", "Enter a location or mark as online");
    if (!isFree && (!price || isNaN(parseFloat(price)))) {
      return Alert.alert("Required", "Enter a valid price");
    }

    setSubmitting(true);

    try {
      // Upload cover image if provided
      var uploadedCover = null;
      if (coverImage) {
        setProgress("Uploading cover image...");
        var result = await upload.image(
          coverImage,
          showType === "exhibition" ? "exhibitions" : "events",
        );
        uploadedCover = { url: result.url, publicId: result.publicId };
      }

      setProgress(
        isExhibition ? "Creating exhibition..." : "Creating event...",
      );

      if (isExhibition) {
        await exhibitions.create({
          title: title.trim(),
          description: description.trim(),
          coverImage: uploadedCover,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          location: location.trim(),
          isVirtual: isOnline,
          virtualUrl: isOnline ? link.trim() : "",
          isFree: isFree,
          ticketPrice: isFree ? 0 : parseFloat(price),
          currency: currency,
        });
      } else {
        await events.create({
          title: title.trim(),
          description: description.trim(),
          type: eventType,
          coverImage: uploadedCover,
          date: startDate.toISOString(),
          endDate: endDate.toISOString(),
          location: location.trim(),
          isOnline: isOnline,
          link: isOnline ? link.trim() : "",
          isFree: isFree,
          price: isFree ? 0 : parseFloat(price),
          currency: currency,
          maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
        });
      }

      setSubmitting(false);
      setProgress("");

      // goBack() returns to the list screen which uses useFocusEffect to reload
      Alert.alert(
        "Success",
        (isExhibition ? "Exhibition" : "Event") + " created!",
        [
          {
            text: "OK",
            onPress: function () {
              navigation.goBack();
            },
          },
        ],
      );
    } catch (e) {
      setSubmitting(false);
      setProgress("");
      Alert.alert("Failed", e.message || "Something went wrong");
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={function () {
            navigation.goBack();
          }}
        >
          <Text style={{ fontSize: fs.xl, color: c.textSecondary }}>✕</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Create Show</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Show Type Toggle */}
        <Text style={s.label}>Type</Text>
        <View style={s.toggleRow}>
          {SHOW_TYPES.map(function (t) {
            var active = showType === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[s.toggleBtn, active && s.toggleBtnActive]}
                onPress={function () {
                  setShowType(t.key);
                }}
              >
                <Text style={[s.toggleText, active && s.toggleTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Event Type (events only) */}
        {!isExhibition ? (
          <View>
            <Text style={s.label}>Event Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: sp.sm, paddingBottom: sp.sm }}
            >
              {EVENT_TYPES.map(function (et) {
                var active = eventType === et.key;
                return (
                  <TouchableOpacity
                    key={et.key}
                    style={[s.chip, active && s.chipActive]}
                    onPress={function () {
                      setEventType(et.key);
                    }}
                  >
                    <Text style={[s.chipText, active && s.chipTextActive]}>
                      {et.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* Cover Image */}
        <Text style={s.label}>Cover Image</Text>
        {coverImage ? (
          <View style={s.coverWrap}>
            <Image source={{ uri: coverImage }} style={s.coverImg} />
            <TouchableOpacity style={s.coverRemove} onPress={removeCover}>
              <View style={s.removeCircle}>
                <Text style={s.removeX}>✕</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={s.coverAdd} onPress={pickCover}>
            <Text style={{ fontSize: 28, color: c.teal }}>+</Text>
            <Text style={{ fontSize: fs.xs, color: c.teal, marginTop: 2 }}>
              Add Cover
            </Text>
          </TouchableOpacity>
        )}

        {/* Title */}
        <Text style={s.label}>Title</Text>
        <TextInput
          style={s.input}
          value={title}
          onChangeText={setTitle}
          placeholder={isExhibition ? "Exhibition title" : "Event title"}
          placeholderTextColor={c.textMuted}
        />

        {/* Description */}
        <Text style={s.label}>Description</Text>
        <TextInput
          style={[s.input, { minHeight: 100, textAlignVertical: "top" }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Tell people about this show..."
          placeholderTextColor={c.textMuted}
          multiline
        />

        {/* Dates */}
        <Text style={s.label}>{isExhibition ? "Start Date" : "Date"}</Text>
        <TouchableOpacity
          style={s.dateBtn}
          onPress={function () {
            setShowStartPicker(true);
          }}
        >
          <Text style={s.dateText}>{formatDate(startDate)}</Text>
          <Text style={{ color: c.textMuted }}>📅</Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={onStartDateChange}
          />
        )}

        <Text style={s.label}>End Date</Text>
        <TouchableOpacity
          style={s.dateBtn}
          onPress={function () {
            setShowEndPicker(true);
          }}
        >
          <Text style={s.dateText}>{formatDate(endDate)}</Text>
          <Text style={{ color: c.textMuted }}>📅</Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            minimumDate={startDate}
            onChange={onEndDateChange}
          />
        )}

        {/* Location / Online */}
        <View style={s.saleRow}>
          <View>
            <Text
              style={{ fontSize: fs.md, color: c.text, fontWeight: fw.medium }}
            >
              {isExhibition ? "Virtual Exhibition" : "Online Event"}
            </Text>
            <Text style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 2 }}>
              No physical location needed
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: c.border, true: c.accentMuted || c.tealBg }}
            thumbColor={isOnline ? c.teal : c.textMuted}
          />
        </View>

        {isOnline ? (
          <View>
            <Text style={s.label}>Link / URL</Text>
            <TextInput
              style={s.input}
              value={link}
              onChangeText={setLink}
              placeholder="https://..."
              placeholderTextColor={c.textMuted}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        ) : (
          <View>
            <Text style={s.label}>Location</Text>
            <TextInput
              style={s.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Venue name or address"
              placeholderTextColor={c.textMuted}
            />
          </View>
        )}

        {/* Max Attendees (events only) */}
        {!isExhibition ? (
          <View>
            <Text style={s.label}>Max Attendees</Text>
            <TextInput
              style={s.input}
              value={maxAttendees}
              onChangeText={setMaxAttendees}
              placeholder="Unlimited"
              placeholderTextColor={c.textMuted}
              keyboardType="numeric"
            />
          </View>
        ) : null}

        {/* Pricing */}
        <View style={s.saleRow}>
          <View>
            <Text
              style={{ fontSize: fs.md, color: c.text, fontWeight: fw.medium }}
            >
              Free Entry
            </Text>
            <Text style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 2 }}>
              Toggle off to set a ticket price
            </Text>
          </View>
          <Switch
            value={isFree}
            onValueChange={setIsFree}
            trackColor={{ false: c.border, true: c.accentMuted || c.tealBg }}
            thumbColor={isFree ? c.teal : c.textMuted}
          />
        </View>

        {!isFree ? (
          <View>
            {/* Currency */}
            <Text style={s.label}>Currency</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: sp.sm, paddingBottom: sp.md }}
            >
              {CURRENCIES.map(function (cur) {
                var active = currency === cur.code;
                return (
                  <TouchableOpacity
                    key={cur.code}
                    style={[s.chip, active && s.chipActive]}
                    onPress={function () {
                      setCurrency(cur.code);
                    }}
                  >
                    <Text style={[s.chipText, active && s.chipTextActive]}>
                      {cur.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Price */}
            <Text style={s.label}>
              Ticket Price ({activeCurrency ? activeCurrency.symbol : currency})
            </Text>
            <View style={s.priceRow}>
              <Text style={s.priceSymbol}>
                {activeCurrency ? activeCurrency.symbol : "$"}
              </Text>
              <TextInput
                style={s.priceInput}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor={c.textMuted}
                keyboardType="decimal-pad"
              />
              <Text style={s.priceCurrency}>{currency}</Text>
            </View>
          </View>
        ) : null}

        {/* Submit */}
        <View style={{ height: sp.lg }} />
        <TouchableOpacity
          style={[s.btn, submitting && { opacity: 0.6 }]}
          onPress={onSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: sp.sm }}
            >
              <ActivityIndicator color={c.textInverse} size="small" />
              <Text style={s.btnText}>{progress || "Creating..."}</Text>
            </View>
          ) : (
            <Text style={s.btnText}>
              {isExhibition ? "Create Exhibition" : "Create Event"}
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: sp.xxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

var s = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: sp.lg,
    paddingVertical: sp.md,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  headerTitle: { fontSize: fs.lg, fontWeight: fw.bold, color: c.text },
  scroll: { paddingHorizontal: sp.lg, paddingBottom: 40 },
  label: {
    fontSize: fs.sm,
    color: c.textSecondary,
    fontWeight: fw.medium,
    marginBottom: sp.sm,
    marginTop: sp.md,
  },
  input: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: rad.md,
    paddingHorizontal: sp.md,
    paddingVertical: 14,
    fontSize: fs.md,
    color: c.text,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: c.surface,
    borderRadius: rad.md,
    borderWidth: 1,
    borderColor: c.border,
    overflow: "hidden",
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: c.teal,
  },
  toggleText: {
    fontSize: fs.md,
    fontWeight: fw.semi,
    color: c.textSecondary,
  },
  toggleTextActive: {
    color: c.textInverse,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: c.surface,
    borderRadius: rad.full,
    borderWidth: 1,
    borderColor: c.border,
  },
  chipActive: { backgroundColor: c.teal, borderColor: c.teal },
  chipText: { fontSize: fs.sm, color: c.textSecondary, fontWeight: fw.medium },
  chipTextActive: { color: c.textInverse },
  coverAdd: {
    width: "100%",
    height: 160,
    borderRadius: rad.md,
    borderWidth: 1.5,
    borderColor: c.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  coverWrap: {
    width: "100%",
    height: 200,
    borderRadius: rad.md,
    overflow: "hidden",
  },
  coverImg: {
    width: "100%",
    height: "100%",
    borderRadius: rad.md,
  },
  coverRemove: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  removeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: c.error,
    alignItems: "center",
    justifyContent: "center",
  },
  removeX: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginTop: -1,
  },
  dateBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: rad.md,
    paddingHorizontal: sp.md,
    paddingVertical: 14,
  },
  dateText: {
    fontSize: fs.md,
    color: c.text,
  },
  saleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: c.surface,
    borderRadius: rad.md,
    padding: sp.md,
    marginTop: sp.md,
    borderWidth: 1,
    borderColor: c.border,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: rad.md,
    paddingHorizontal: sp.md,
  },
  priceSymbol: {
    fontSize: fs.lg,
    color: c.textMuted,
    fontWeight: fw.semi,
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: fs.md,
    color: c.text,
  },
  priceCurrency: {
    fontSize: fs.sm,
    color: c.textMuted,
    fontWeight: fw.medium,
    marginLeft: sp.sm,
  },
  btn: {
    backgroundColor: c.teal,
    paddingVertical: 20,
    alignItems: "center",
    borderRadius: rad.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnText: {
    color: c.textInverse,
    fontSize: fs.lg,
    fontWeight: fw.bold,
    letterSpacing: 0.5,
  },
});
