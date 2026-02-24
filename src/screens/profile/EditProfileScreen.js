import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Avatar, Button, TextInput } from "../../components/ui";
import { useAuth } from "../../store/authStore";
import { uploadService } from "../../services/data";
import { colors, sp, fs, fw } from "../../constants/theme";

export default function EditProfileScreen(props) {
  var navigation = props.navigation;
  var auth = useAuth();
  var user = auth.user || {};

  var name = useState(user.name || user.displayName || "");
  var bio = useState(user.bio || "");
  var location = useState(user.location || "");
  var website = useState(user.website || "");
  var avatar = useState(user.avatar || "");
  var saving = useState(false);

  function pickAvatar() {
    ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 })
      .then(function (result) {
        if (!result.canceled && result.assets && result.assets[0]) {
          uploadService.image(result.assets[0].uri, "avatars").then(function (uploaded) {
            if (uploaded.data && uploaded.data.url) avatar[1](uploaded.data.url);
          }).catch(function () { Alert.alert("Error", "Failed to upload image"); });
        }
      }).catch(function () {});
  }

  function onSave() {
    if (!name[0].trim()) { Alert.alert("Error", "Name is required"); return; }
    saving[1](true);
    auth.updateProfile({ name: name[0].trim(), bio: bio[0].trim(), location: location[0].trim(), website: website[0].trim(), avatar: avatar[0] })
      .then(function () { saving[1](false); Alert.alert("Saved", "Profile updated", [{ text: "OK", onPress: function () { navigation.goBack(); } }]); })
      .catch(function (e) { saving[1](false); Alert.alert("Error", e.message || "Failed to save"); });
  }

  return (
    <View style={s.c}>
      <View style={s.header}>
        <TouchableOpacity onPress={function () { navigation.goBack(); }}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
        <Text style={s.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={onSave} disabled={saving[0]}><Text style={[s.saveTxt, saving[0] && { opacity: 0.5 }]}>Save</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={s.avatarWrap} onPress={pickAvatar}>
          <Avatar name={name[0]} imageUrl={avatar[0]} size={90} />
          <View style={s.avatarBadge}><Ionicons name="camera" size={14} color={colors.text} /></View>
        </TouchableOpacity>
        <TextInput label="Name" placeholder="Your name" value={name[0]} onChangeText={name[1]} />
        <TextInput label="Bio" placeholder="Tell us about yourself..." value={bio[0]} onChangeText={bio[1]} multiline height={100} maxLength={300} />
        <TextInput label="Location" placeholder="City, Country" value={location[0]} onChangeText={location[1]} icon="location-outline" />
        <TextInput label="Website" placeholder="https://yoursite.com" value={website[0]} onChangeText={website[1]} icon="link-outline" autoCapitalize="none" keyboardType="url" />
        <View style={{ height: sp.lg }} />
        <Button title="Save Changes" onPress={onSave} loading={saving[0]} size="lg" />
        <View style={{ height: sp.xxl }} />
      </ScrollView>
    </View>
  );
}

var s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: sp.md, paddingVertical: sp.md },
  headerTitle: { fontSize: fs.lg, fontWeight: fw.bold, color: colors.text },
  saveTxt: { fontSize: fs.md, fontWeight: fw.semibold, color: colors.accent },
  scroll: { paddingHorizontal: sp.md, paddingBottom: 40 },
  avatarWrap: { alignSelf: "center", marginVertical: sp.lg, position: "relative" },
  avatarBadge: { position: "absolute", bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.elevated, borderWidth: 2, borderColor: colors.bg, alignItems: "center", justifyContent: "center" },
});
