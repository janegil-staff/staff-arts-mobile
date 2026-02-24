import { useState, useEffect } from "react";
import { Keyboard, Platform } from "react-native";

export default function useKeyboard() {
  var [visible, setVisible] = useState(false);
  var [height, setHeight] = useState(0);

  useEffect(function () {
    var showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    var hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    var showSub = Keyboard.addListener(showEvent, function (e) {
      setVisible(true);
      setHeight(e.endCoordinates.height);
    });
    var hideSub = Keyboard.addListener(hideEvent, function () {
      setVisible(false);
      setHeight(0);
    });

    return function () {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  function dismiss() { Keyboard.dismiss(); }

  return { visible, height, dismiss };
}
