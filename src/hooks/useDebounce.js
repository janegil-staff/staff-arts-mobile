import { useState, useEffect } from "react";

export default function useDebounce(value, delay) {
  if (delay === undefined) delay = 400;
  var [debounced, setDebounced] = useState(value);

  useEffect(function () {
    var timer = setTimeout(function () {
      setDebounced(value);
    }, delay);
    return function () { clearTimeout(timer); };
  }, [value, delay]);

  return debounced;
}
