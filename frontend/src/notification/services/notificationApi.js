const API_BASE_URL = import.meta.env.VITE_API_URL;

export const notificationApi = {

    async notify(notification) {

        const response = await fetch(
            `${API_BASE_URL}/notifications/notify`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(notification),
            }
        );

        return await response.json();
    },

    async getNotifications() {

        const response = await fetch(
            `${API_BASE_URL}/notifications`
        );

        return await response.json();
    },

    async clearNotifications() {

        const response = await fetch(
            `${API_BASE_URL}/notifications`,
            {
                method: "DELETE",
            }
        );

        return await response.json();
    },

};