import { createContext, useContext, useState } from "react";

const CallRequestContext = createContext();

const initialRequests = [
    {
        id: 1,
        leaderId: 1,
        leaderName: "National President",
        designation: "National President",
        purpose: "General Discussion",
        priority: "High",
        notes: "Initial mock request",
        status: "Pending",
        createdAt: new Date().toISOString(),
    },
];

export function CallRequestProvider({ children }) {

    const [requests, setRequests] = useState(initialRequests);

    const createRequest = (request) => {

        const newRequest = {
            id: Date.now(),
            ...request,
            status: "Pending",
            createdAt: new Date().toISOString(),
        };

        setRequests((prev) => [newRequest, ...prev]);

        return newRequest;

    };

    const approveRequest = (id) => {

        setRequests((prev) =>
            prev.map((request) =>
                request.id === id
                    ? {
                        ...request,
                        status: "Approved",
                    }
                    : request
            )
        );

    };

    const rejectRequest = (id) => {

        setRequests((prev) =>
            prev.map((request) =>
                request.id === id
                    ? {
                        ...request,
                        status: "Rejected",
                    }
                    : request
            )
        );

    };

    return (

        <CallRequestContext.Provider
            value={{
                requests,
                createRequest,
                approveRequest,
                rejectRequest,
            }}
        >
            {children}
        </CallRequestContext.Provider>

    );

}

export function useCallRequestsContext() {

    return useContext(CallRequestContext);

}