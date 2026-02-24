import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch, Image, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Button, TextInput, Chip } from "../../components/ui";
import { useAuth } from "../../store/authStore";
import { useAuthGate } from "../../hooks";
import { uploadService, artworkService } from "../../services/data";
import { haptics } from "../../utils/haptics";
import { ART_CATEGORIES } from "../../constants";
import { colors, sp, rad, fs, fw, glassCard, shadows } from "../../constants/theme";

var W = (Dimensions.get("window") || {}).width || 390;
var THUMB = (W - sp.md * 2 - sp.sm * 2) / 3;

var MEDIUMS = ["Oil", "Acrylic", "Watercolor", "Digital", "Photography", "Ink", "Charcoal", "Mixed Media", "Sculpture", "Printmaking", "Other"];

export default function UploadScreen(props) {
  var navigation = props.navigation;
  var ins = useSafeAreaInsets();
  var auth = useAuth();
  var gate = useAuthGate();

  var images = useState([]);
  var title = useState("");
  var description = useState("");
  var year = useState("");
  var category = useState("");
  var medium = useState("");
  var forSale = useState(false);
  var price = useState("");
  var uploading = useState(false);

  function pickImages() {
    ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: 8,
    }).then(function (result) {
      if (!result.canceled && result.assets) {
        var current = images[0];
        var added = result.assets.map(function (a) { return { uri: a.uri, width: a.width, height: a.height }; });
        images[1](current.concat(added).slice(0, 8));
      }
    }).catch(function () {});
  }

  function removeImage(idx) {
    images[1](images[0].filter(function (_, i) { return i !== idx; }));
  }

  function onSubmit() {
    if (!gate.require("upload")) return;

    if (images[0].length === 0) { Alert.alert("No images", "Add at least one image."); return; }
    if (!title[0].trim()) { Alert.alert("Missing title", "Give your artwork a title."); return; }
    if (!category[0]) { Alert.alert("Missing category", "Pick a category."); return; }

    uploading[1](true);
    haptics.light();

    // Upload all images to Cloudinary
    var uploadPromises = images[0].map(function (img) {
      return uploadService.image(img.uri, "artworks").then(function (res) {
        return {
          url: res.data.url,
          publicId: res.data.publicId,
          width: res.data.width || img.width,
          height: res.data.height || img.height,
        };
      });
    });

    Promise.all(uploadPromises).then(function (uploaded) {
      var body = {
        title: title[0].trim(),
        description: description[0].trim(),
        images: uploaded,
        category: category[0],
        medium: medium[0],
        year: year[0] ? parseInt(year[0], 10) : undefined,
        forSale: forSale[0],
      };
      if (forSale[0] && price[0]) {
        body.price = Math.round(parseFloat(price[0]) * 100);
        body.currency = "USD";
      }
      return artworkService.create(body);
    }).then(function (res) {
      uploading[1](false);
      haptics.success();
      Alert.alert("Published!", "Your artwork is live.", [
        { text: "View", onPress: function () { navigation.navigate("ArtworkDetail", { id: (res.data || res)._id }); } },
        { text: "OK" },
      ]);
      // Reset
      images[1]([]); title[1](""); description[1](""); year[1]("");
      category[1](""); medium[1](""); forSale[1](false); price[1]("");
    }).catch(function (err) {
      uploading[1](false);
      Alert.alert("Upload failed", err.message || "Something went wrong.");
    });
  }

  return (
    <View style={[s.c, { paddingTop: ins.top }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <Text style={s.title}>Upload Artwork</Text>
        <Text style={s.subtitle}>Share your work with the community</Text>

        {/* Images */}
        <Text style={s.label}>Images</Text>
        <View style={s.imageGrid}>
          {images[0].map(function (img, i) {
            return (
              <View key={i} style={s.thumb}>
                <Image source={{ uri: img.uri }} style={s.thumbImg} />
                <TouchableOpacity style={s.thumbRemove} onPress={function () { removeImage(i); }}>
                  <Ionicons name="close-circle" size={22} color={colors.danger} />
                </TouchableOpacity>
              </View>
            );
          })}
          {images[0].length < 8 ? (
            <TouchableOpacity style={s.addThumb} onPress={pickImages}>
              <Ionicons name="camera-outline" size={28} color={colors.textMuted} />
              <Text style={s.addTxt}>{images[0].length === 0 ? "Add photos" : "Add more"}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={s.hint}>{images[0].length}/8 images</Text>

        {/* Title */}
        <TextInput
          label="Title"
          placeholder="Name your artwork"
          value={title[0]}
          onChangeText={title[1]}
          maxLength={100}
        />

        {/* Description */}
        <TextInput
          label="Description"
          placeholder="Tell the story behind this piece..."
          value={description[0]}
          onChangeText={description[1]}
          multiline
          height={100}
          maxLength={1000}
        />

        {/* Year */}
        <TextInput
          label="Year"
          placeholder="2025"
          value={year[0]}
          onChangeText={year[1]}
          keyboardType="number-pad"
          maxLength={4}
        />

        {/* Category */}
        <Text style={s.label}>Category</Text>
        <View style={s.chips}>
          {ART_CATEGORIES.map(function (c) {
            return (
              <Chip key={c} label={c} active={category[0] === c} size="sm" onPress={function () { category[1](category[0] === c ? "" : c); }} />
            );
          })}
        </View>

        {/* Medium */}
        <Text style={s.label}>Medium</Text>
        <View style={s.chips}>
          {MEDIUMS.map(function (m) {
            return (
              <Chip key={m} label={m} active={medium[0] === m} size="sm" onPress={function () { medium[1](medium[0] === m ? "" : m); }} />
            );
          })}
        </View>

        {/* For Sale */}
        <View style={[s.saleRow, glassCard]}>
          <View style={s.saleInfo}>
            <Text style={s.saleTitle}>List for sale</Text>
            <Text style={s.saleSub}>Set a price and sell directly</Text>
          </View>
          <Switch
            value={forSale[0]}
            onValueChange={forSale[1]}
            trackColor={{ false: colors.border, true: colors.accentMuted }}
            thumbColor={forSale[0] ? colors.accent : colors.textMuted}
          />
        </View>

        {forSale[0] ? (
          <TextInput
            label="Price (USD)"
            placeholder="0.00"
            value={price[0]}
            onChangeText={price[1]}
            keyboardType="decimal-pad"
            icon="cash-outline"
          />
        ) : null}

        {/* Submit */}
        <Button
          title={uploading[0] ? "Uploading..." : "Publish"}
          onPress={onSubmit}
          loading={uploading[0]}
          size="lg"
          style={[{ marginTop: sp.md }, shadows.glow]}
        />

        <View style={{ height: sp.xxl }} />
      </ScrollView>
    </View>
  );
}

var s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: sp.md, paddingBottom: 40 },
  title: { fontSize: fs.xxl, fontWeight: fw.bold, color: colors.text, marginTop: sp.md },
  subtitle: { fontSize: fs.md, color: colors.textMuted, marginTop: sp.xs, marginBottom: sp.lg },
  label: { fontSize: fs.sm, fontWeight: fw.semibold, color: colors.textSecondary, marginBottom: sp.sm, marginTop: sp.md },
  hint: { fontSize: fs.xs, color: colors.textMuted, marginTop: sp.xs, marginBottom: sp.sm },

  imageGrid: { flexDirection: "row", flexWrap: "wrap", gap: sp.sm },
  thumb: { width: THUMB, height: THUMB, borderRadius: rad.md, overflow: "hidden", position: "relative" },
  thumbImg: { width: "100%", height: "100%" },
  thumbRemove: { position: "absolute", top: 4, right: 4 },
  addThumb: { width: THUMB, height: THUMB, borderRadius: rad.md, borderWidth: 1.5, borderColor: colors.border, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: sp.xs },
  addTxt: { fontSize: fs.xs, color: colors.textMuted },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: sp.sm },

  saleRow: { flexDirection: "row", alignItems: "center", padding: sp.md, marginTop: sp.md, marginBottom: sp.md },
  saleInfo: { flex: 1 },
  saleTitle: { fontSize: fs.md, fontWeight: fw.semibold, color: colors.text },
  saleSub: { fontSize: fs.sm, color: colors.textMuted, marginTop: 2 },
});
