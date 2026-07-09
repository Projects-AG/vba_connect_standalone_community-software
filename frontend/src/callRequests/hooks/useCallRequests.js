// import { useEffect, useState } from "react";

// import { callRequestApi } from "../services/callRequestApi";

// export default function useCallRequests() {

//     const [requests, setRequests] = useState([]);

//     const [loading, setLoading] = useState(true);

//     const loadRequests = async () => {

//         try {

//             const response =
//                 await callRequestApi.getRequests();

//             setRequests(
//                 response.requests || []
//             );

//         } catch (error) {

//             console.error(error);

//         } finally {

//             setLoading(false);

//         }

//     };

//     const createRequest = async (request) => {

//         await callRequestApi.createRequest(request);

//         loadRequests();

//     };

//     const approveRequest = async (id) => {

//         await callRequestApi.approveRequest(id);

//         loadRequests();

//     };

//     const rejectRequest = async (id) => {

//         await callRequestApi.rejectRequest(id);

//         loadRequests();

//     };

//     useEffect(() => {

//         loadRequests();

//     }, []);

//     return {

//         requests,

//         loading,

//         loadRequests,

//         createRequest,

//         approveRequest,

//         rejectRequest,

//     };

// }

import { useEffect, useState } from "react";

export default function useCallRequests() {

    const [loading, setLoading] = useState(true);

    const [requests, setRequests] = useState([]);

    useEffect(() => {

        setTimeout(() => {

            setRequests([

                {
                    id: 1,
                    leaderName: "National President",
                    designation: "Party President",
                    purpose: "Election Planning",
                    priority: "High",
                    status: "Pending",
                    date: "09 Jul 2026",
                },

                {
                    id: 2,
                    leaderName: "State President",
                    designation: "State Committee",
                    purpose: "Membership Drive",
                    priority: "Medium",
                    status: "Approved",
                    date: "08 Jul 2026",
                },

                {
                    id: 3,
                    leaderName: "District President",
                    designation: "District Committee",
                    purpose: "General Discussion",
                    priority: "Low",
                    status: "Rejected",
                    date: "07 Jul 2026",
                },

                {
                    id: 4,
                    leaderName: "Booth Coordinator",
                    designation: "Booth Level",
                    purpose: "Complaint",
                    priority: "Medium",
                    status: "Completed",
                    date: "05 Jul 2026",
                },

            ]);

            setLoading(false);

        }, 600);

    }, []);

    const approveRequest = (id) => {

        setRequests((previous) =>
            previous.map((request) =>
                request.id === id
                    ? { ...request, status: "Approved" }
                    : request
            )
        );

    };

    const rejectRequest = (id) => {

        setRequests((previous) =>
            previous.map((request) =>
                request.id === id
                    ? { ...request, status: "Rejected" }
                    : request
            )
        );

    };

    return {

        requests,

        loading,

        approveRequest,

        rejectRequest,

    };

}