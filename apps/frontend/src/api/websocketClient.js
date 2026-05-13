import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;

export function connectWebSocket(onConnected, onError) {
  if (stompClient && stompClient.active) {
    return stompClient;
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
    reconnectDelay: 5000,
    debug: () => {},
    onConnect: () => {
      if (onConnected) {
        onConnected(stompClient);
      }
    },
    onStompError: (frame) => {
      console.error("STOMP error:", frame);
      if (onError) {
        onError(frame);
      }
    },
    onWebSocketError: (error) => {
      console.error("WebSocket error:", error);
      if (onError) {
        onError(error);
      }
    }
  });

  stompClient.activate();
  return stompClient;
}

export function disconnectWebSocket() {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
}

export function getStompClient() {
  return stompClient;
}