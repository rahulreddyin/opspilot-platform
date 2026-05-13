import { useEffect, useRef, useState } from "react";
import {
  getRecentNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api/notificationApi";
import useLiveNotifications from "../hooks/useLiveNotifications";

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const [recent, unread] = await Promise.all([
        getRecentNotifications(),
        getUnreadNotificationCount(),
      ]);

      setNotifications(Array.isArray(recent) ? recent : []);
      setUnreadCount(unread?.unreadCount ?? 0);
    } catch (error) {
      console.error("LOAD NOTIFICATIONS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useLiveNotifications({
    onNotification: (notification) => {
      setNotifications((prev) => {
        const exists = prev.some((item) => item.id === notification.id);
        if (exists) return prev;

        return [notification, ...prev].slice(0, 20);
      });

      setUnreadCount((prev) => prev + 1);
    },
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      await loadNotifications();
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const updated = await markNotificationAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? updated : notification
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("MARK NOTIFICATION READ ERROR:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("MARK ALL NOTIFICATIONS READ ERROR:", error);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button onClick={handleToggle} style={bellButtonStyle}>
        <span style={{ fontSize: "18px" }}>🔔</span>

        {unreadCount > 0 && (
          <span style={badgeStyle}>{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={dropdownStyle}>
          <div style={dropdownHeaderStyle}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", color: "#111827" }}>
                Notifications
              </h3>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                {unreadCount} unread
              </span>
            </div>

            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} style={markAllButtonStyle}>
                Mark all read
              </button>
            )}
          </div>

          <div style={dropdownBodyStyle}>
            {loading ? (
              <p style={emptyTextStyle}>Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p style={emptyTextStyle}>No notifications yet.</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    ...notificationCardStyle,
                    backgroundColor: notification.read ? "#ffffff" : "#eff6ff",
                    borderLeft: `4px solid ${
                      notification.read
                        ? "#e5e7eb"
                        : getTypeColor(notification.type)
                    }`,
                  }}
                >
                  <div style={notificationContentStyle}>
                    <div>
                      <div style={notificationTopRowStyle}>
                        <span style={typeDotStyle(notification.type)}></span>
                        <div style={notificationTitleStyle}>
                          {notification.title}
                        </div>
                      </div>

                      <div style={notificationMessageStyle}>
                        {notification.message}
                      </div>

                      <div style={notificationMetaStyle}>
                        {formatType(notification.type)} •{" "}
                        {formatTimestamp(notification.createdAt)}
                      </div>
                    </div>

                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        style={markReadButtonStyle}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getTypeColor(type) {
  const value = String(type || "").toUpperCase();

  if (value.includes("INCIDENT")) return "#dc2626";
  if (value.includes("TASK")) return "#d97706";
  if (value.includes("TEAM")) return "#2563eb";
  if (value.includes("ROLE")) return "#059669";
  if (value.includes("USER")) return "#7c3aed";

  return "#6b7280";
}

function formatType(type) {
  return String(type || "NOTIFICATION")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTimestamp(value) {
  if (!value) return "N/A";

  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    return new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      second
    ).toLocaleString();
  }

  if (typeof value === "number") {
    const milliseconds = value < 1000000000000 ? value * 1000 : value;
    return new Date(milliseconds).toLocaleString();
  }

  if (typeof value === "string") {
    const numericValue = Number(value);

    if (!Number.isNaN(numericValue) && value.trim() !== "") {
      const milliseconds =
        numericValue < 1000000000000 ? numericValue * 1000 : numericValue;
      return new Date(milliseconds).toLocaleString();
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-").map(Number);
      return new Date(year, month - 1, day).toLocaleDateString();
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
  }

  return String(value);
}

const bellButtonStyle = {
  position: "relative",
  backgroundColor: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  padding: "10px 12px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const badgeStyle = {
  position: "absolute",
  top: "-8px",
  right: "-8px",
  minWidth: "20px",
  height: "20px",
  borderRadius: "999px",
  backgroundColor: "#dc2626",
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: "700",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 6px",
};

const dropdownStyle = {
  position: "absolute",
  top: "48px",
  right: 0,
  width: "390px",
  maxHeight: "500px",
  overflow: "hidden",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
  zIndex: 999,
};

const dropdownHeaderStyle = {
  padding: "14px 16px",
  borderBottom: "1px solid #e5e7eb",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
};

const dropdownBodyStyle = {
  maxHeight: "430px",
  overflowY: "auto",
  padding: "10px",
  display: "grid",
  gap: "10px",
};

const notificationCardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "12px",
};

const notificationContentStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
};

const notificationTopRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "4px",
};

const notificationTitleStyle = {
  fontWeight: "800",
  color: "#111827",
};

const notificationMessageStyle = {
  color: "#374151",
  fontSize: "14px",
  marginBottom: "6px",
  lineHeight: 1.4,
};

const notificationMetaStyle = {
  color: "#6b7280",
  fontSize: "12px",
};

const markReadButtonStyle = {
  backgroundColor: "#e0e7ff",
  color: "#1d4ed8",
  border: "1px solid #c7d2fe",
  borderRadius: "8px",
  padding: "8px 10px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "12px",
  height: "fit-content",
  whiteSpace: "nowrap",
};

const markAllButtonStyle = {
  backgroundColor: "#f3f4f6",
  color: "#111827",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  padding: "8px 10px",
  cursor: "pointer",
  fontWeight: "800",
  fontSize: "12px",
  whiteSpace: "nowrap",
};

const typeDotStyle = (type) => ({
  width: "9px",
  height: "9px",
  borderRadius: "999px",
  backgroundColor: getTypeColor(type),
  flexShrink: 0,
});

const emptyTextStyle = {
  margin: 0,
  color: "#6b7280",
  padding: "12px",
};

export default NotificationBell;