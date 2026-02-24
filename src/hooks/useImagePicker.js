import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export default function useImagePicker(opts) {
  var maxImages = (opts && opts.max) || 5;
  var [images, setImages] = useState([]);
  var [loading, setLoading] = useState(false);

  async function pickFromLibrary() {
    var perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow access to photo library");
      return;
    }
    setLoading(true);
    try {
      var result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: maxImages - images.length,
        quality: 0.8,
      });
      if (!result.canceled && result.assets) {
        setImages(function (prev) {
          return prev.concat(result.assets.map(function (a) { return a.uri; })).slice(0, maxImages);
        });
      }
    } catch (e) {
      console.log("Pick error:", e);
    }
    setLoading(false);
  }

  async function takePhoto() {
    var perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow camera access");
      return;
    }
    setLoading(true);
    try {
      var result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });
      if (!result.canceled && result.assets) {
        setImages(function (prev) {
          return prev.concat(result.assets[0].uri).slice(0, maxImages);
        });
      }
    } catch (e) {
      console.log("Camera error:", e);
    }
    setLoading(false);
  }

  function removeImage(index) {
    setImages(function (prev) { return prev.filter(function (_, i) { return i !== index; }); });
  }

  function clear() { setImages([]); }

  return { images, loading, pickFromLibrary, takePhoto, removeImage, clear };
}
