const API_BASE_URL = import.meta.env.VITE_API_URL;

export const meetingApi = {
    async createMeeting(data) {
        const res = await fetch(`${API_BASE_URL}/meetings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        return await res.json();
    },

    async getMeeting(meetingId) {
        const res = await fetch(
            `${API_BASE_URL}/meetings/${meetingId}`
        );

        return await res.json();
    },

    async generateToken(meetingId, participant) {
        const res = await fetch(
            `${API_BASE_URL}/meetings/${meetingId}/token`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    participant,
                }),
            }
        );

        return await res.json();
    }
};