import { useNotifications } from "../hooks/useNotifications";

export default function NotificationCenter() {

    const {
        notifications,
        clearNotifications,
    } = useNotifications();

    return (

        <div
            style={{
                maxWidth: "600px",
                margin: "20px auto",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "8px",
            }}
        >

            <h2>
                🔔 Notifications
            </h2>

            <button
                onClick={clearNotifications}
                style={{
                    marginBottom: "15px",
                }}
            >
                Clear All
            </button>

            {
                notifications.length === 0 ? (

                    <p>
                        No notifications found
                    </p>

                ) : (

                    notifications.map(
                        (notification, index) => (

                            <div
                                key={index}
                                style={{
                                    border: "1px solid #eee",
                                    padding: "12px",
                                    marginBottom: "10px",
                                    borderRadius: "6px",
                                }}
                            >

                                <h4>
                                    {notification.title}
                                </h4>

                                <p>
                                    {notification.message}
                                </p>

                                <small>
                                    Type: {notification.type}
                                </small>

                            </div>

                        ),
                    )

                )
            }

        </div>

    );

}