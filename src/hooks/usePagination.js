import { useState, useCallback } from "react";

export default function usePagination(fetchFn, opts) {
  var pageSize = (opts && opts.pageSize) || 20;
  var dataKey = (opts && opts.dataKey) || "items";

  var [data, setData] = useState([]);
  var [page, setPage] = useState(1);
  var [loading, setLoading] = useState(true);
  var [loadingMore, setLoadingMore] = useState(false);
  var [hasMore, setHasMore] = useState(true);
  var [error, setError] = useState(null);

  var loadFirst = useCallback(async function () {
    setLoading(true);
    setError(null);
    try {
      var result = await fetchFn(1, pageSize);
      var items = result[dataKey] || result.data || result || [];
      setData(items);
      setPage(1);
      setHasMore(items.length >= pageSize);
    } catch (e) {
      setError(e);
      console.log("Pagination error:", e);
    }
    setLoading(false);
  }, [fetchFn, pageSize, dataKey]);

  var loadMore = useCallback(async function () {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      var nextPage = page + 1;
      var result = await fetchFn(nextPage, pageSize);
      var items = result[dataKey] || result.data || result || [];
      if (items.length > 0) {
        setData(function (prev) { return prev.concat(items); });
        setPage(nextPage);
      }
      setHasMore(items.length >= pageSize);
    } catch (e) {
      console.log("Load more error:", e);
    }
    setLoadingMore(false);
  }, [fetchFn, page, pageSize, dataKey, loadingMore, hasMore]);

  return { data, setData, loading, loadingMore, hasMore, error, loadFirst, loadMore };
}
