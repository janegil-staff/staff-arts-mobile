import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors, rad, fs, fw, sp } from "../../constants/theme";

export default function FollowButton(props) {
  var following = props.following;
  return (
    <TouchableOpacity
      onPress={props.onPress}
      activeOpacity={0.7}
      style={[s.btn, following ? s.btnOn : s.btnOff, props.size === "sm" && s.sm, props.style]}
    >
      <Text style={[s.txt, following ? s.txtOn : s.txtOff, props.size === "sm" && s.txtSm]}>
        {following ? "Following" : "Follow"}
      </Text>
    </TouchableOpacity>
  );
}

var s = StyleSheet.create({
  btn: { paddingHorizontal: sp.lg, paddingVertical: sp.sm, borderRadius: rad.md },
  btnOff: { backgroundColor: colors.accent },
  btnOn: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.accent },
  sm: { paddingHorizontal: sp.md, paddingVertical: sp.xs + 2 },
  txt: { fontWeight: fw.semibold, textAlign: "center" },
  txtOff: { color: colors.textInverse, fontSize: fs.sm },
  txtOn: { color: colors.accent, fontSize: fs.sm },
  txtSm: { fontSize: fs.xs },
});
