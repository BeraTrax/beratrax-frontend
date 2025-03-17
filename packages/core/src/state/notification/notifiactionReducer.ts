import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "@core/state/index";

export type NotificationType = "success" | "error" | "warning" | "info" | "loading";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  timestamp: number;
  autoHideDuration?: number;
}

export interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, "id" | "timestamp">>) => {
      const id = Math.random().toString(36).substring(7);
      state.notifications.push({
        ...action.payload,
        id,
        timestamp: Date.now(),
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((notification) => notification.id !== action.payload);
    },
    clearAllNotificationsAction: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearAllNotificationsAction } = notificationSlice.actions;

export default notificationSlice.reducer;

export const addNotificationWithTimeout = (notification: Omit<Notification, "id" | "timestamp">) => {
  return (dispatch: AppDispatch) => {
    const action = addNotification(notification);
    dispatch(action);

    const notificationId = (action.payload as Notification).id;

    setTimeout(() => {
      dispatch(removeNotification(notificationId));
    }, notification.autoHideDuration ?? 500);
  };
};

export const addSuccessNotification = (message: string, title?: string, autoHideDuration = 5000) => {
  return addNotificationWithTimeout({ type: "success", message, title, autoHideDuration });
};

export const addErrorNotification = (message: string, title?: string, autoHideDuration = 7000) => {
  return addNotificationWithTimeout({ type: "error", message, title, autoHideDuration });
};

export const addWarningNotification = (message: string, title?: string, autoHideDuration = 6000) => {
  return addNotificationWithTimeout({ type: "warning", message, title, autoHideDuration });
};

export const addInfoNotification = (message: string, title?: string, autoHideDuration = 5000) => {
  return addNotificationWithTimeout({ type: "info", message, title, autoHideDuration });
};

export const addLoadingNotification = (message: string, title?: string, autoHideDuration = 5000) => {
  return addNotificationWithTimeout({ type: "loading", message, title, autoHideDuration });
};
