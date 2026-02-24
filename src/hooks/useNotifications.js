import { useState, useEffect, useRef } from "react";
import { notifs } from "../services/data";

export default function useNotifications(opts) {
  var interval = (opts && opts.interval) || 30000; // 30s default
  var [unreadCount, setUnreadCount] = useState(0);
  var timer = useRef(null);

  async function check() {
    try {
      var data = await notifs.list(true);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      // silently fail
    }
  }

  useEffect(function () {
    check();
    timer.current = setInterval(check, interval);
    return function () {
      if (timer.current) clearInterval(timer.current);
    };
  }, [interval]);

  function refresh() { check(); }

  return { unreadCount, refresh };
}
