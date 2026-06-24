const API_BASE_URL = import.meta.env.VITE_API_URL;

export const videoApi = {
    async createRoom(roomName) {
        const response = await fetch(
            `${API_BASE_URL}/video/create-room`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    roomName,
                }),
            }
        );

        return await response.json();
    },

    async generateToken(roomName, participantName) {
        const response = await fetch(
            `${API_BASE_URL}/video/generate-token`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    roomName,
                    participantName,
                }),
            }
        );

        return await response.json();
    },

    async getParticipants(roomName) {
        const response = await fetch(
            `${API_BASE_URL}/video/participants/${roomName}`
        );

        return await response.json();
    },

    async endRoom(roomName) {
        const response = await fetch(
            `${API_BASE_URL}/video/end-room/${roomName}`,
            {
                method: "DELETE",
            }
        );

        return await response.json();
    },
};