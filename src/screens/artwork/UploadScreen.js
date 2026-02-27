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
import * as ImagePicker from "expo-image-picker";
import { artworks, upload } from "../../services/data";
import { useAuth } from "../../store/authStore";
import { colors as c, sp, rad, fs, fw } from "../../constants/theme";

var CATEGORIES = [
  "Painting",
  "Sculpture",
  "Photography",
  "Digital",
  "Drawing",
  "Print",
  "Mixed Media",
  "Installation",
  "Textile",
  "Ceramic",
];
var MEDIUMS = [
  "Oil",
  "Acrylic",
  "Watercolor",
  "Charcoal",
  "Ink",
  "Pastel",
  "Graphite",
  "Digital",
  "Photography",
  "Bronze",
  "Clay",
  "Wood",
  "Mixed Media",
  "Other",
];
var STYLES = [
  "Abstract",
  "Realism",
  "Impressionism",
  "Minimalism",
  "Surrealism",
  "Pop Art",
  "Contemporary",
  "Expressionism",
  "Cubism",
  "Street Art",
  "Folk Art",
  "Figurative",
  "Conceptual",
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
var UNITS = [
  { code: "cm", label: "cm" },
  { code: "in", label: "inches" },
  { code: "mm", label: "mm" },
];
var DEPTH_CATEGORIES = [
  "Sculpture",
  "Installation",
  "Ceramic",
  "Mixed Media",
  "Textile",
];

export default function UploadScreen({ navigation }) {
  var { user } = useAuth();
  var [images, setImages] = useState([]);
  var [title, setTitle] = useState("");
  var [desc, setDesc] = useState("");
  var [category, setCategory] = useState("");
  var [medium, setMedium] = useState("");
  var [style, setStyle] = useState("");
  var [year, setYear] = useState("");
  var [dimHeight, setDimHeight] = useState("");
  var [dimWidth, setDimWidth] = useState("");
  var [dimDepth, setDimDepth] = useState("");
  var [dimUnit, setDimUnit] = useState("cm");
  var [forSale, setForSale] = useState(false);
  var [price, setPrice] = useState("");
  var [currency, setCurrency] = useState("USD");
  var [uploading, setUploading] = useState(false);
  var [progress, setProgress] = useState("");

  var activeCurrency = CURRENCIES.find(function (cur) {
    return cur.code === currency;
  });

  var showDepth = DEPTH_CATEGORIES.indexOf(category) !== -1;

  async function pickImages() {
    var perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to upload artwork",
      );
      return;
    }
    var result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 8 - images.length,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      var uris = result.assets.map(function (a) {
        return a.uri;
      });
      setImages(images.concat(uris).slice(0, 8));
    }
  }

  function removeImage(idx) {
    setImages(
      images.filter(function (_, i) {
        return i !== idx;
      }),
    );
  }

  function buildDimensions() {
    var h = parseFloat(dimHeight);
    var w = parseFloat(dimWidth);
    if (!h && !w) return undefined;
    var dims = { unit: dimUnit };
    if (h) dims.height = h;
    if (w) dims.width = w;
    if (showDepth) {
      var d = parseFloat(dimDepth);
      if (d) dims.depth = d;
    }
    return dims;
  }

  async function onSubmit() {
    if (!title.trim()) return Alert.alert("Required", "Enter a title");
    if (images.length === 0)
      return Alert.alert("Required", "Add at least one image");
    if (forSale && (!price || isNaN(parseFloat(price))))
      return Alert.alert("Required", "Enter a valid price");

    setUploading(true);

    try {
      var uploadedUrls = [];
      for (var i = 0; i < images.length; i++) {
        setProgress(
          "Uploading image " + (i + 1) + " of " + images.length + "...",
        );
        var result = await upload.image(images[i], "artworks");
        uploadedUrls.push({
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
        });
      }

      setProgress("Saving artwork...");
      await artworks.create({
        title: title.trim(),
        description: desc.trim(),
        images: uploadedUrls,
        category: category,
        medium: medium,
        style: style,
        year: year ? parseInt(year) : undefined,
        dimensions: buildDimensions(),
        forSale: forSale,
        price: forSale ? parseFloat(price) : 0,
        currency: currency,
      });

      setUploading(false);
      setProgress("");
      setImages([]);
      setTitle("");
      setDesc("");
      setCategory("");
      setMedium("");
      setStyle("");
      setYear("");
      setDimHeight("");
      setDimWidth("");
      setDimDepth("");
      setDimUnit("cm");
      setForSale(false);
      setPrice("");
      setCurrency("USD");
      Alert.alert("Success", "Artwork uploaded!", [
        {
          text: "View",
          onPress: function () {
            navigation.navigate("Home");
          },
        },
      ]);
    } catch (e) {
      setUploading(false);
      setProgress("");
      Alert.alert("Upload failed", e.message || "Something went wrong");
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={s.header}>
        <TouchableOpacity
          onPress={function () {
            navigation.goBack();
          }}
        >
          <Text style={{ fontSize: fs.xl, color: c.textSecondary }}>✕</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>New Artwork</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Images */}
        <Text style={s.label}>Images</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: sp.sm, paddingBottom: sp.sm }}
        >
          <TouchableOpacity style={s.addImg} onPress={pickImages}>
            <Text style={{ fontSize: 28, color: c.teal }}>+</Text>
            <Text style={{ fontSize: fs.xs, color: c.teal, marginTop: 2 }}>
              Add
            </Text>
          </TouchableOpacity>
          {images.map(function (uri, i) {
            return (
              <View key={i} style={s.thumb}>
                <Image source={{ uri: uri }} style={s.thumbImg} />
                <TouchableOpacity
                  style={s.thumbRemove}
                  onPress={function () {
                    removeImage(i);
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: c.error,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: "700",
                        marginTop: -1,
                      }}
                    >
                      ✕
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        {/* Title */}
        <Text style={s.label}>Title</Text>
        <TextInput
          style={s.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Artwork title"
          placeholderTextColor={c.textMuted}
        />

        {/* Description */}
        <Text style={s.label}>Description</Text>
        <TextInput
          style={[s.input, { minHeight: 80, textAlignVertical: "top" }]}
          value={desc}
          onChangeText={setDesc}
          placeholder="Tell us about this piece..."
          placeholderTextColor={c.textMuted}
          multiline
        />

        {/* Year */}
        <Text style={s.label}>Year</Text>
        <TextInput
          style={s.input}
          value={year}
          onChangeText={setYear}
          placeholder="2025"
          placeholderTextColor={c.textMuted}
          keyboardType="numeric"
        />

        {/* Category */}
        <Text style={s.label}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: sp.sm, paddingBottom: sp.md }}
        >
          {CATEGORIES.map(function (cat) {
            var active = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[s.chip, active && s.chipActive]}
                onPress={function () {
                  setCategory(active ? "" : cat);
                }}
              >
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Medium */}
        <Text style={s.label}>Medium</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: sp.sm, paddingBottom: sp.md }}
        >
          {MEDIUMS.map(function (m) {
            var active = medium === m;
            return (
              <TouchableOpacity
                key={m}
                style={[s.chip, active && s.chipActive]}
                onPress={function () {
                  setMedium(active ? "" : m);
                }}
              >
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {m}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Style */}
        <Text style={s.label}>Style</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: sp.sm, paddingBottom: sp.md }}
        >
          {STYLES.map(function (st) {
            var active = style === st;
            return (
              <TouchableOpacity
                key={st}
                style={[s.chip, active && s.chipActive]}
                onPress={function () {
                  setStyle(active ? "" : st);
                }}
              >
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {st}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Dimensions */}
        <Text style={s.label}>Dimensions</Text>
        <Text style={s.sublabel}>
          Optional — helps collectors assess the piece
        </Text>

        {/* Unit selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: sp.sm, paddingBottom: sp.sm }}
        >
          {UNITS.map(function (u) {
            var active = dimUnit === u.code;
            return (
              <TouchableOpacity
                key={u.code}
                style={[s.chip, s.chipSmall, active && s.chipActive]}
                onPress={function () {
                  setDimUnit(u.code);
                }}
              >
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {u.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* H × W (× D) inputs */}
        <View style={s.dimRow}>
          <View style={s.dimField}>
            <Text style={s.dimLabel}>H</Text>
            <TextInput
              style={s.dimInput}
              value={dimHeight}
              onChangeText={setDimHeight}
              placeholder="0"
              placeholderTextColor={c.textMuted}
              keyboardType="decimal-pad"
            />
            <Text style={s.dimUnit}>{dimUnit}</Text>
          </View>

          <Text style={s.dimSeparator}>×</Text>

          <View style={s.dimField}>
            <Text style={s.dimLabel}>W</Text>
            <TextInput
              style={s.dimInput}
              value={dimWidth}
              onChangeText={setDimWidth}
              placeholder="0"
              placeholderTextColor={c.textMuted}
              keyboardType="decimal-pad"
            />
            <Text style={s.dimUnit}>{dimUnit}</Text>
          </View>

          {showDepth ? (
            <>
              <Text style={s.dimSeparator}>×</Text>
              <View style={s.dimField}>
                <Text style={s.dimLabel}>D</Text>
                <TextInput
                  style={s.dimInput}
                  value={dimDepth}
                  onChangeText={setDimDepth}
                  placeholder="0"
                  placeholderTextColor={c.textMuted}
                  keyboardType="decimal-pad"
                />
                <Text style={s.dimUnit}>{dimUnit}</Text>
              </View>
            </>
          ) : null}
        </View>

        {/* For Sale */}
        <View style={s.saleRow}>
          <View>
            <Text
              style={{ fontSize: fs.md, color: c.text, fontWeight: fw.medium }}
            >
              List for sale
            </Text>
            <Text style={{ fontSize: fs.xs, color: c.textMuted, marginTop: 2 }}>
              Set a price for collectors
            </Text>
          </View>
          <Switch
            value={forSale}
            onValueChange={setForSale}
            trackColor={{ false: c.border, true: c.accentMuted || c.tealBg }}
            thumbColor={forSale ? c.teal : c.textMuted}
          />
        </View>

        {forSale ? (
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
              Price ({activeCurrency ? activeCurrency.symbol : currency})
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
          style={[s.btn, uploading && { opacity: 0.6 }]}
          onPress={onSubmit}
          disabled={uploading}
        >
          {uploading ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: sp.sm,
              }}
            >
              <ActivityIndicator color={c.textInverse} size="small" />
              <Text style={s.btnText}>{progress || "Uploading..."}</Text>
            </View>
          ) : (
            <Text style={s.btnText}>Upload Artwork</Text>
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
  sublabel: {
    fontSize: fs.xs,
    color: c.textMuted,
    marginBottom: sp.sm,
    marginTop: -4,
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
  addImg: {
    width: 100,
    height: 100,
    borderRadius: rad.md,
    borderWidth: 1.5,
    borderColor: c.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: {
    width: 100,
    height: 100,
    borderRadius: rad.md,
    overflow: "hidden",
  },
  thumbImg: { width: "100%", height: "100%", borderRadius: rad.md },
  thumbRemove: { position: "absolute", top: 4, right: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: c.surface,
    borderRadius: rad.full,
    borderWidth: 1,
    borderColor: c.border,
  },
  chipSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: c.teal, borderColor: c.teal },
  chipText: {
    fontSize: fs.sm,
    color: c.textSecondary,
    fontWeight: fw.medium,
  },
  chipTextActive: { color: c.textInverse },
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
  dimRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: sp.sm,
  },
  dimField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: rad.md,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  dimLabel: {
    fontSize: fs.xs,
    color: c.textMuted,
    fontWeight: fw.bold,
    marginRight: 4,
    width: 14,
  },
  dimInput: {
    flex: 1,
    fontSize: fs.md,
    color: c.text,
    paddingVertical: 0,
    textAlign: "center",
  },
  dimUnit: {
    fontSize: fs.xs,
    color: c.textMuted,
    marginLeft: 2,
  },
  dimSeparator: {
    fontSize: fs.md,
    color: c.textMuted,
    fontWeight: fw.medium,
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
