import { useAppDispatch, useAppSelector } from "./../../state";
import { clearAllNotificationsAction } from "./notifiactionReducer";

export const useNotification = () => {
  const { notifications } = useAppSelector((state) => state.notification);
  const dispatch = useAppDispatch();

  const clearAllNotifications = () => {
    dispatch(clearAllNotificationsAction());
  };

  return {
    clearAllNotifications,
    notifications,
    errors: notifications.filter((n) => n.type === "error"),
    success: notifications.filter((n) => n.type === "success"),
    loading: notifications.filter((n) => n.type === "loading"),
    info: notifications.filter((n) => n.type === "info"),
    warning: notifications.filter((n) => n.type === "warning"),
  };
};
