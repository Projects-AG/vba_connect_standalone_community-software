import axios from "axios";

const API_URL = "http://localhost:3000/call-request";

export const callRequestApi = {

    async getRequests() {

        const { data } = await axios.get(API_URL);

        return data;

    },

    async createRequest(request) {

        const { data } = await axios.post(API_URL, request);

        return data;

    },

    async approveRequest(id) {

        const { data } = await axios.patch(
            `${API_URL}/${id}/approve`
        );

        return data;

    },

    async rejectRequest(id) {

        const { data } = await axios.patch(
            `${API_URL}/${id}/reject`
        );

        return data;

    },

};