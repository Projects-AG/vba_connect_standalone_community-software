import { leadershipData } from "../data/leadershipData";

export const leadershipApi = {
    async getLeaders() {
        return Promise.resolve({
            success: true,
            leaders: leadershipData,
        });
    },
};