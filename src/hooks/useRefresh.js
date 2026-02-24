import { useState, useCallback } from "react";

export default function useRefresh(loadFn) {
  var [refreshing, setRefreshing] = useState(false);

  var onRefresh = useCallback(async function () {
    setRefreshing(true);
    try {
      await loadFn();
    } catch (e) {
      console.log("Refresh error:", e);
    }
    setRefreshing(false);
  }, [loadFn]);

  return { refreshing, onRefresh };
}
