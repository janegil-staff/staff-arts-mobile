export var API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

export var API = {
  login: "/mobile/auth/login",
  register: "/mobile/auth/register",
  google: "/mobile/google",
  me: "/mobile/me",
  artworks: "/artworks",
  users: "/users",
  posts: "/posts",
  exhibitions: "/exhibitions",
  events: "/events",
  orders: "/orders",
  commissions: "/commissions",
  conversations: "/messages/conversations",
  messages: "/messages",
  music: "/music",
  notifications: "/notifications",
  upload: "/upload",
  search: "/search",
};
