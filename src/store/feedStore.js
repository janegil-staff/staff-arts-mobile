import React, { createContext, useContext, useReducer, useMemo } from "react";
import { postService } from "../services/data";

var FeedContext = createContext(null);

var initialState = {
  posts: [],
  isLoading: false,
  hasMore: true,
  page: 1,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOADING":
      return { posts: state.posts, isLoading: true, hasMore: state.hasMore, page: state.page };
    case "SET_POSTS":
      return { posts: action.reset ? action.list : state.posts.concat(action.list), isLoading: false, hasMore: action.list.length >= 20, page: (action.reset ? 1 : state.page) + 1 };
    case "PREPEND":
      return { posts: [action.post].concat(state.posts), isLoading: false, hasMore: state.hasMore, page: state.page };
    case "LIKE":
      return {
        posts: state.posts.map(function (p) {
          if (p._id !== action.id) return p;
          var copy = {};
          for (var k in p) copy[k] = p[k];
          copy.isLiked = !p.isLiked;
          copy.likesCount = (p.likesCount || 0) + (p.isLiked ? -1 : 1);
          return copy;
        }),
        isLoading: state.isLoading, hasMore: state.hasMore, page: state.page,
      };
    default:
      return state;
  }
}

export function FeedProvider(props) {
  var ref = useReducer(reducer, initialState);
  var state = ref[0];
  var dispatch = ref[1];

  function fetchFeed(reset) {
    dispatch({ type: "LOADING" });
    var p = reset ? 1 : state.page;
    return postService.getFeed(p).then(function (res) {
      var data = res.data || res;
      var list = data.posts || data || [];
      dispatch({ type: "SET_POSTS", list: list, reset: !!reset });
    }).catch(function () { dispatch({ type: "SET_POSTS", list: [], reset: !!reset }); });
  }

  function likePost(id) {
    dispatch({ type: "LIKE", id: id });
    postService.like(id).catch(function () {});
  }

  function createPost(data) {
    return postService.create(data).then(function (res) {
      dispatch({ type: "PREPEND", post: res.data });
    });
  }

  var value = useMemo(function () {
    return {
      posts: state.posts,
      isLoading: state.isLoading,
      hasMore: state.hasMore,
      fetchFeed: fetchFeed,
      likePost: likePost,
      createPost: createPost,
    };
  }, [state]);

  return React.createElement(FeedContext.Provider, { value: value }, props.children);
}

export function useFeed() {
  var ctx = useContext(FeedContext);
  if (!ctx) throw new Error("useFeed must be used within FeedProvider");
  return ctx;
}
