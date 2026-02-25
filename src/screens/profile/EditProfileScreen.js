import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../store/authStore";
import { auth, upload } from "../../services/data";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";

export default function EditProfileScreen({ navigation }) {
  var { user, updateUser } = useAuth();
  var [name, setName] = useState(user?.displayName || "");
  var [bio, setBio] = useState(user?.bio || "");
  var [loc, setLoc] = useState(user?.location || "");
  var [web, setWeb] = useState(user?.website || "");
  var [avatar, setAvatar] = useState(user?.avatar || "");
  var [avatarLocal, setAvatarLocal] = useState(null);
  var [saving, setSaving] = useState(false);

  async function pickAvatar() {
    var perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo access to change avatar");
      return;
    }
    var result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      setAvatarLocal(result.assets[0].uri);
    }
  }

  async function save() {
    setSaving(true);
    try {
      var avatarUrl = avatar;

      // Upload new avatar if picked
      if (avatarLocal) {
        var uploaded = await upload.image(avatarLocal, "avatars");
        avatarUrl = uploaded.url;
      }

      var updated = await auth.updateProfile({
        displayName: name.trim(),
        bio: bio.trim(),
        location: loc.trim(),
        website: web.trim(),
        avatar: avatarUrl,
      });

      // Update auth store immediately — no refetch needed
      updateUser(updated);

      Alert.alert("Saved", "Profile updated");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to save");
    }
    setSaving(false);
  }

  var displayAvatar = avatarLocal || avatar;
  var initials = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: sp.lg, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">

        {/* Avatar */}
        <View style={{ alignItems: "center", marginBottom: sp.xl }}>
          <TouchableOpacity onPress={pickAvatar} style={{ alignItems: "center" }}>
            {displayAvatar ? (
              <Image source={{ uri: displayAvatar }} style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: c.surface }} />
            ) : (
              <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: c.surface, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: c.border }}>
                <Text style={{ fontSize: 36, fontWeight: fw.bold, color: c.teal }}>{initials}</Text>
              </View>
            )}
            <View style={{ position: "absolute", bottom: 0, right: -4, width: 32, height: 32, borderRadius: 16, backgroundColor: c.teal, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: c.bg }}>
              <Text style={{ color: c.textInverse, fontSize: 16 }}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={{ fontSize: fs.sm, color: c.textMuted, marginTop: sp.sm }}>Tap to change photo</Text>
        </View>

        {/* Fields */}
        <View style={{ gap: sp.lg }}>
          <Field label="Display Name" value={name} onChange={setName} />
          <Field label="Bio" value={bio} onChange={setBio} multiline placeholder="Tell us about yourself..." />
          <Field label="Location" value={loc} onChange={setLoc} placeholder="City, Country" />
          <Field label="Website" value={web} onChange={setWeb} placeholder="https://..." cap="none" />
        </View>

        {/* Save */}
        <TouchableOpacity style={[s.btn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
          {saving ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: sp.sm }}>
              <ActivityIndicator color={c.textInverse} size="small" />
              <Text style={s.btnText}>Saving...</Text>
            </View>
          ) : (
            <Text style={s.btnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChange, multiline, placeholder, cap }) {
  return (
    <View style={{ gap: sp.xs }}>
      <Text style={{ fontSize: fs.sm, color: c.textSecondary, fontWeight: fw.medium }}>{label}</Text>
      <TextInput
        style={[s.input, multiline && { minHeight: 100, textAlignVertical: "top" }]}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        placeholder={placeholder || ""}
        placeholderTextColor={c.textMuted}
        autoCapitalize={cap}
      />
    </View>
  );
}

var s = {
  input: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: rad.md, paddingHorizontal: sp.md, paddingVertical: 16, fontSize: fs.md, color: c.text },
  btn: { backgroundColor: c.teal, paddingVertical: 20, alignItems: "center", borderRadius: rad.md, marginTop: sp.xl, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  btnText: { color: c.textInverse, fontSize: fs.lg, fontWeight: fw.bold },
};
