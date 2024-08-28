"use client";

import { io } from "socket.io-client";

export const socket = io(`ws://localhost:4849/socket`, {
  extraHeaders: {
    authorization: `bearer ${localStorage.getItem('token')}`
  }
});