import { useAuth } from "../store/authStore";
import { useNavigation } from "@react-navigation/native";

export function useAuthGate() {
  var auth = useAuth();
  var nav = useNavigation();

  function require(action) {
    if (auth.isAuthenticated) return true;
    nav.navigate("AuthModal", { action: action || "continue" });
    return false;
  }

  return {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    require: require,
  };
}
