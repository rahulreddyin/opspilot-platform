import { useEffect } from "react";
import { getToken } from "../utils/auth";
import { subscribeToTopic } from "../websocket/socket";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function getCurrentUserEmail() {
  const token = getToken();
  if (!token) return null;
  const payload = parseJwt(token);
  return payload?.sub || payload?.email || null;
}

export default function useLiveNotifications({ onNotification } = {}) {
  useEffect(() => {
    let unsubscribe = null;
    let mounted = true;

    const email = getCurrentUserEmail();
    if (!email) return;

    const setup = async () => {
      try {
        unsubscribe = await subscribeToTopic(
          `/topic/notifications/${email.toLowerCase()}`,
          (event) => {
            if (mounted && onNotification) {
              onNotification(event);
            }
          }
        );
      } catch (error) {
        console.error("Notification WebSocket error:", error);
      }
    };

    setup();

    return () => {
      mounted = false;
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [onNotification]);
}