import React, { createContext, useContext, useReducer, useMemo } from "react";
import { artworkService } from "../services/data";

var ExploreContext = createContext(null);

var initialState = {
  artworks: [],
  featured: [],
  isLoading: false,
  hasMore: true,
  page: 1,
  sort: "recent",
  filters: {},
};

function reducer(state, action) {
  switch (action.type) {
    case "LOADING":
      return { artworks: state.artworks, featured: state.featured, isLoading: true, hasMore: state.hasMore, page: state.page, sort: state.sort, filters: state.filters };
    case "SET_ARTWORKS":
      return { artworks: action.reset ? action.list : state.artworks.concat(action.list), featured: state.featured, isLoading: false, hasMore: action.list.length >= 20, page: (action.reset ? 1 : state.page) + 1, sort: state.sort, filters: state.filters };
    case "SET_FEATURED":
      return { artworks: state.artworks, featured: action.list, isLoading: state.isLoading, hasMore: state.hasMore, page: state.page, sort: state.sort, filters: state.filters };
    case "LIKE":
      return {
        artworks: state.artworks.map(function (a) {
          if (a._id !== action.id) return a;
          var copy = {};
          for (var k in a) copy[k] = a[k];
          copy.isLiked = !a.isLiked;
          copy.likesCount = (a.likesCount || 0) + (a.isLiked ? -1 : 1);
          return copy;
        }),
        featured: state.featured, isLoading: state.isLoading, hasMore: state.hasMore, page: state.page, sort: state.sort, filters: state.filters,
      };
    case "SET_SORT":
      return { artworks: state.artworks, featured: state.featured, isLoading: state.isLoading, hasMore: state.hasMore, page: state.page, sort: action.sort, filters: state.filters };
    case "SET_FILTER":
      var f = {};
      for (var k in state.filters) f[k] = state.filters[k];
      f[action.key] = action.val;
      return { artworks: state.artworks, featured: state.featured, isLoading: state.isLoading, hasMore: state.hasMore, page: state.page, sort: state.sort, filters: f };
    case "CLEAR_FILTERS":
      return { artworks: state.artworks, featured: state.featured, isLoading: state.isLoading, hasMore: state.hasMore, page: state.page, sort: state.sort, filters: {} };
    default:
      return state;
  }
}

export function ExploreProvider(props) {
  var ref = useReducer(reducer, initialState);
  var state = ref[0];
  var dispatch = ref[1];

  function fetchArtworks(reset) {
    dispatch({ type: "LOADING" });
    var p = reset ? 1 : state.page;
    var params = "page=" + p + "&limit=20&sort=" + state.sort;
    var keys = Object.keys(state.filters);
    for (var i = 0; i < keys.length; i++) {
      if (state.filters[keys[i]]) params += "&" + keys[i] + "=" + state.filters[keys[i]];
    }
    return artworkService.getAll(params).then(function (res) {
      var data = res.data || res;
      var list = data.artworks || data || [];
      dispatch({ type: "SET_ARTWORKS", list: list, reset: !!reset });
    }).catch(function () { dispatch({ type: "SET_ARTWORKS", list: [], reset: !!reset }); });
  }

  function fetchFeatured() {
    return artworkService.getAll("featured=true&limit=10").then(function (res) {
      var data = res.data || res;
      dispatch({ type: "SET_FEATURED", list: data.artworks || data || [] });
    }).catch(function () {});
  }

  function likeArtwork(id) {
    dispatch({ type: "LIKE", id: id });
    artworkService.like(id).catch(function () {});
  }

  function setSort(sort) { dispatch({ type: "SET_SORT", sort: sort }); }
  function setFilter(key, val) { dispatch({ type: "SET_FILTER", key: key, val: val }); }
  function clearFilters() { dispatch({ type: "CLEAR_FILTERS" }); }

  var value = useMemo(function () {
    return {
      artworks: state.artworks,
      featured: state.featured,
      isLoading: state.isLoading,
      hasMore: state.hasMore,
      fetchArtworks: fetchArtworks,
      fetchFeatured: fetchFeatured,
      likeArtwork: likeArtwork,
      setSort: setSort,
      setFilter: setFilter,
      clearFilters: clearFilters,
    };
  }, [state]);

  return React.createElement(ExploreContext.Provider, { value: value }, props.children);
}

export function useExplore() {
  var ctx = useContext(ExploreContext);
  if (!ctx) throw new Error("useExplore must be used within ExploreProvider");
  return ctx;
}
