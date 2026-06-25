import { useEffect, useState } from "react";

import { notificationApi } from "../services/notificationApi";

export function useNotifications() {

    const [notifications, setNotifications] = useState([]);

    const loadNotifications = async () => {

        const response =
            await notificationApi.getNotifications();

        setNotifications(
            response.notifications || []
        );

    };

    const clearNotifications = async () => {

        await notificationApi.clearNotifications();

        setNotifications([]);

    };

    useEffect(() => {

        loadNotifications();

    }, []);

    return {

        notifications,

        loadNotifications,

        clearNotifications,

    };

}