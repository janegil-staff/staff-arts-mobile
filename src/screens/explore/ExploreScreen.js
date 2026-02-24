import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity as T,
  Image,
  TextInput,
  ScrollView,
  StyleSheet as S,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { artworks } from "../../services/data";
import { colors as c, fs, fw, sp, rad } from "../../constants/theme";
var W = Dimensions.get("window").width,
  G = 10,
  CW = (W - sp.lg * 2 - G) / 2,
  MS = [
    "All",
    "Painting",
    "Sculpture",
    "Photography",
    "Digital",
    "Mixed Media",
    "Print",
    "Ceramic",
  ];
export default function Explore({ navigation: n }) {
  var [data, sD] = useState([]);
  var [ld, sL] = useState(true);
  var [med, sM] = useState("All");
  var [q, sQ] = useState("");
  useEffect(() => {
    go();
  }, [med]);
  var go = async () => {
    sL(true);
    try {
      var p = { limit: 30, status: "all" };
      if (med !== "All") p.medium = med.toLowerCase().replace(" ", "_");
      if (q) p.search = q;
      var d = await artworks.list(p);
      sD(d.artworks || []);
    } catch (e) {
      console.log(e);
    }
    sL(false);
  };
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingHorizontal: sp.lg, marginBottom: sp.md }}>
        <TextInput
          style={s.si}
          value={q}
          onChangeText={sQ}
          onSubmitEditing={go}
          placeholder="Search artworks..."
          placeholderTextColor={c.textMuted}
          returnKeyType="search"
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: sp.lg,
          gap: sp.sm,
          paddingBottom: sp.md,
        }}
      >
        {MS.map((m) => (
          <T key={m} style={[s.ch, med === m && s.cha]} onPress={() => sM(m)}>
            <Text style={[s.ct, med === m && s.cta]}>{m}</Text>
          </T>
        ))}
      </ScrollView>
      {ld ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={c.teal} />
      ) : (
        <FlatList
          data={data}
          numColumns={2}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{
            paddingHorizontal: sp.lg,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text
              style={{ textAlign: "center", color: c.textMuted, marginTop: 60 }}
            >
              No artworks found
            </Text>
          }
          renderItem={({ item: i, index: idx }) => (
            <T
              style={{
                width: CW,
                marginBottom: sp.lg,
                ...(idx % 2 === 0
                  ? { marginRight: G / 2 }
                  : { marginLeft: G / 2 }),
              }}
              onPress={() => n.navigate("ArtworkDetail", { id: i._id })}
            >
              <Image
                source={{ uri: i.images[0].url }}
                style={{
                  width: "100%",
                  aspectRatio: 0.75,
                  borderRadius: rad.md,
                  backgroundColor: c.surfaceDim,
                }}
              />
              <Text
                style={{
                  fontSize: fs.sm,
                  fontWeight: fw.semi,
                  color: c.text,
                  marginTop: sp.sm,
                }}
                numberOfLines={1}
              >
                {i.title}
              </Text>
              <Text
                style={{
                  fontSize: fs.xs,
                  color: c.textSecondary,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {i.artistId?.displayName}
              </Text>
              {i.pricing?.price > 0 && (
                <Text
                  style={{
                    fontSize: fs.xs,
                    color: c.teal,
                    fontWeight: fw.bold,
                    marginTop: sp.xs,
                  }}
                >
                  ${i.pricing.price.toLocaleString()}
                </Text>
              )}
            </T>
          )}
        />
      )}
    </View>
  );
}
var s = S.create({
  si: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: rad.md,
    paddingHorizontal: sp.md,
    paddingVertical: 14,
    fontSize: fs.md,
    color: c.text,
  },
  ch: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: rad.full,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  cha: {
    backgroundColor: c.teal,
    borderColor: c.teal,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  ct: { fontSize: fs.sm, color: c.textSecondary, fontWeight: fw.medium },
  cta: { color: c.textInverse, fontWeight: fw.semi },
});
