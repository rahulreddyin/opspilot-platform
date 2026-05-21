import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function useLiveComments({ entityType, entityId, onCommentCreated }) {
  useEffect(() => {
    if (!entityType || !entityId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://98.94.8.79:8080/ws"),
      reconnectDelay: 5000,
      debug: () => {},
    });

    let subscription = null;

    client.onConnect = () => {
      subscription = client.subscribe(
        `/topic/comments/${entityType}/${entityId}`,
        (message) => {
          const payload = JSON.parse(message.body);
          if (onCommentCreated) {
            onCommentCreated(payload);
          }
        }
      );
    };

    client.onStompError = (frame) => {
      console.error("Comment STOMP error:", frame);
    };

    client.onWebSocketError = (error) => {
      console.error("Comment WebSocket error:", error);
    };

    client.activate();

    return () => {
      try {
        if (subscription) {
          subscription.unsubscribe();
        }
      } catch (error) {
        console.error("Comment cleanup error:", error);
      }

      client.deactivate();
    };
  }, [entityType, entityId, onCommentCreated]);
}