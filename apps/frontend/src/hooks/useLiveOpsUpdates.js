import { useEffect } from "react";
import { subscribeToTopic } from "../websocket/socket";

export default function useLiveOpsUpdates({
  onIncidentCreated,
  onIncidentStatusUpdated,
  onTaskCreated,
  onTaskStatusUpdated,
  onActivityEvent,
} = {}) {
  useEffect(() => {
    let unsubscribers = [];
    let isMounted = true;

    const setup = async () => {
      try {
        const subscriptions = await Promise.all([
          subscribeToTopic("/topic/incidents/created", (event) => {
            if (isMounted && onIncidentCreated) onIncidentCreated(event);
          }),
          subscribeToTopic("/topic/incidents/status-updated", (event) => {
            if (isMounted && onIncidentStatusUpdated) onIncidentStatusUpdated(event);
          }),
          subscribeToTopic("/topic/tasks/created", (event) => {
            if (isMounted && onTaskCreated) onTaskCreated(event);
          }),
          subscribeToTopic("/topic/tasks/status-updated", (event) => {
            if (isMounted && onTaskStatusUpdated) onTaskStatusUpdated(event);
          }),
          subscribeToTopic("/topic/activity", (event) => {
            if (isMounted && onActivityEvent) onActivityEvent(event);
          }),
        ]);

        unsubscribers = subscriptions;
      } catch (error) {
        console.error("Live ops socket setup failed:", error);
      }
    };

    setup();

    return () => {
      isMounted = false;
      unsubscribers.forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
    };
  }, [
    onIncidentCreated,
    onIncidentStatusUpdated,
    onTaskCreated,
    onTaskStatusUpdated,
    onActivityEvent,
  ]);
}