import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_BASE_URL = "http://localhost:8080/ws";

let stompClient = null;
let connectPromise = null;

function createClient() {
  return new Client({
    webSocketFactory: () => new SockJS(WS_BASE_URL),
    reconnectDelay: 3000,
    debug: () => {},
    onStompError: (frame) => {
      console.error("STOMP ERROR:", frame);
    },
    onWebSocketError: (event) => {
      console.error("WebSocket error:", event);
    },
  });
}

export async function ensureSocketConnected() {
  if (stompClient?.connected) {
    return stompClient;
  }

  if (connectPromise) {
    return connectPromise;
  }

  stompClient = createClient();

  connectPromise = new Promise((resolve, reject) => {
    stompClient.onConnect = () => {
      resolve(stompClient);
    };

    stompClient.onWebSocketClose = () => {
      connectPromise = null;
    };

    stompClient.onDisconnect = () => {
      connectPromise = null;
    };

    try {
      stompClient.activate();
    } catch (error) {
      connectPromise = null;
      reject(error);
    }
  });

  return connectPromise;
}

export async function subscribeToTopic(destination, handler) {
  const client = await ensureSocketConnected();

  const subscription = client.subscribe(destination, (message) => {
    try {
      const body = message?.body ? JSON.parse(message.body) : null;
      handler(body);
    } catch (error) {
      console.error(`Failed to parse message from ${destination}`, error);
    }
  });

  return () => {
    try {
      subscription.unsubscribe();
    } catch (error) {
      console.error(`Failed to unsubscribe from ${destination}`, error);
    }
  };
}

export async function disconnectSocket() {
  if (stompClient) {
    try {
      await stompClient.deactivate();
    } catch (error) {
      console.error("Failed to deactivate socket", error);
    } finally {
      stompClient = null;
      connectPromise = null;
    }
  }
}