import { createContext, useContext, useEffect, useState } from "react";

import { notificationApi } from "../services/notificationApi";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {

    const [notifications, setNotifications] = useState([]);

    const loadNotifications = async () => {

        try {

            const response =
                await notificationApi.getNotifications();

            setNotifications(
                response.notifications || []
            );

        } catch (error) {

            console.error(error);

        }

    };

    const addNotification = async (notification) => {

        try {

            await notificationApi.notify(notification);

            await loadNotifications();

        } catch (error) {

            console.error(error);

        }

    };

    const clearNotifications = async () => {

        try {

            await notificationApi.clearNotifications();

            setNotifications([]);

        } catch (error) {

            console.error(error);

        }

    };

    useEffect(() => {

        loadNotifications();

    }, []);

    return (

        <NotificationContext.Provider
            value={{
                notifications,
                loadNotifications,
                addNotification,
                clearNotifications,
            }}
        >

            {children}

        </NotificationContext.Provider>

    );

}

export function useNotificationContext() {

    return useContext(NotificationContext);

}