import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

export function NotificationList() {
  const notifications = useQuery(api.notifications.getNotifications) || [];
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleMarkAsRead = async (notificationId: Id<"notifications">) => {
    try {
      await markAsRead({ notificationId });
    } catch (error) {
      toast.error("Failed to mark notification as read");
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
      console.error(error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                notification.isRead 
                  ? "border-gray-200" 
                  : "border-blue-500 bg-blue-50"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">
                      {notification.type === "assignment_due" && "📝"}
                      {notification.type === "assignment_graded" && "✅"}
                      {notification.type === "new_message" && "✉️"}
                      {notification.type === "discussion_reply" && "💬"}
                      {notification.type === "course_announcement" && "📢"}
                      {notification.type === "enrollment_confirmed" && "🎓"}
                    </span>
                    <h3 className="font-medium text-gray-900">{notification.title}</h3>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{notification.message}</p>
                  <div className="text-sm text-gray-500">
                    {new Date(notification._creationTime).toLocaleString()}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Mark as read
                    </button>
                  )}
                  {notification.actionUrl && (
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                      View
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
