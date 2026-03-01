// services/socket.js
import { io } from "socket.io-client";
import { API_URL } from "../constants/api";

// Single socket instance, autoConnect: false — we connect manually
const socket = io(API_URL, {
  transports: ["websocket"],
  autoConnect: false,
});

export default socket;