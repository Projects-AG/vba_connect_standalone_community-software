// import { useEffect, useState } from "react";

// import { notificationApi } from "../services/notificationApi";

// export function useNotifications() {

//     const [notifications, setNotifications] = useState([]);

//     const loadNotifications = async () => {

//         const response =
//             await notificationApi.getNotifications();

//         setNotifications(
//             response.notifications || []
//         );

//     };

//     const clearNotifications = async () => {

//         await notificationApi.clearNotifications();

//         setNotifications([]);

//     };

//     useEffect(() => {

//         // Load notifications immediately
//         loadNotifications();

//         // Auto refresh every 10 seconds
//         const interval = setInterval(() => {

//             loadNotifications();

//         }, 10000);

//         // Cleanup on unmount
//         return () => clearInterval(interval);

//     }, []);

//     return {

//         notifications,

//         loadNotifications,

//         clearNotifications,

//     };

// }
import { useNotificationContext } from "../context/NotificationContext";

export function useNotifications() {
    return useNotificationContext();
}