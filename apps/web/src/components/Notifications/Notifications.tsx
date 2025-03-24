import NotiCheck from "@beratrax/core/src/assets/images/noti_check.png";
import NotiCross from "@beratrax/core/src/assets/images/noti_cross.png";
import { useApp } from "@beratrax/core/src/hooks";
import React from "react";
import NotificationsSystem, { atalhoTheme, baseTheme, Notification, Theme, useNotifications } from "reapop";
import styles from "./Notifications.module.css";

interface IProps {}

function getTheme(isLight: boolean) {
  const bgColor = "var(--new-background_dark)";
  const txtColor = "var(--new-color_white)";
  const borderColor = "var(--new-button-primary-light)";

  const customTheme: Theme = {
    ...baseTheme,
    ...atalhoTheme,

    notification: (notification: Notification) => ({
      ...atalhoTheme.notification(notification),
      borderRadius: "12px",
      width: "auto",
      minWidth: "300px",
      backgroundColor: bgColor,
      border: `1px solid ${borderColor}`,
      boxShadow: "none",
    }),
    notificationMeta: (notification: Notification) => ({
      ...atalhoTheme.notificationMeta(notification),
      verticalAlign: "top",
      padding: "10px 16px",
      paddingBottom: 12,
      paddingLeft: 0,
      width: notification.buttons.length > 0 ? 187 : notification.dismissible ? 200 : 238,
    }),
    notificationTitle: (notification: Notification) => ({
      ...atalhoTheme.notificationMessage(notification),
      margin: notification.message ? "0 0 10px" : 0,
      fontSize: "16px",
      color: txtColor,
      marginBottom: 0,
      fontFamily: "League Spartan, sans-serif",
      fontWeight: 600,
    }),
    notificationMessage: (notification: Notification) => ({
      ...atalhoTheme.notificationMessage(notification),
      fontSize: "12px",
      color: txtColor,
      fontFamily: "League Spartan, sans-serif",
      wordBreak: "break-word",
    }),
    notificationButton: (notification, position, state) => ({
      ...atalhoTheme.notificationButton(notification, position, state),
      background: "transparent",
      borderColor: borderColor,
    }),
    notificationDismissIcon: (notification) => ({
      ...atalhoTheme.notificationDismissIcon(notification),
      background: txtColor,
      color: bgColor,
      padding: 3,
      fontWeight: 200,
      borderRadius: "50%",
      marginTop: "auto",
      marginBottom: "auto",
      zoom: 0.8,
      marginRight: 20,
    }),
    notificationButtonText: (notification, position, state) => ({
      ...atalhoTheme.notificationButtonText(notification, position, state),
      color: txtColor,
      padding: 0,
      minWidth: 0,
      width: 50,
    }),
  };

  return customTheme;
}

const Notifications: React.FC<IProps> = () => {
  // 1. Retrieve the notifications to display, and the function used to dismiss a notification.
  const { notifications, dismissNotification } = useNotifications();
  const { lightMode } = useApp();
  return (
    <NotificationsSystem
      // 2. Pass the notifications you want Reapop to display.
      notifications={notifications}
      // 3. Pass the function used to dismiss a notification.
      dismissNotification={(id) => dismissNotification(id)}
      // 4. Pass a builtIn theme or a custom theme.
      theme={getTheme(lightMode)}
      components={{
        NotificationIcon,
      }}
    />
  );
};

export default Notifications;

function NotificationIcon({ notification }: { notification: Notification }) {
  let src = "";
  if (notification.status === "success") src = NotiCheck;
  else if (notification.status === "error") src = NotiCross;
  return (
    <div className="mx-4 my-auto">
      {src ? (
        <img src={src} width={30} height={30} />
      ) : (
        <div className="bg-buttonPrimary w-[30px] h-[30px] rounded flex justify-center items-center">
          <div className={styles.loader} />
        </div>
      )}
    </div>
  );
}
