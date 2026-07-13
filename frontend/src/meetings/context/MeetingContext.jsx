// import { createContext, useContext, useState } from "react";

// const MeetingContext = createContext();

// export function MeetingProvider({ children }) {

//     const [meeting, setMeeting] = useState(null);

//     const startMeeting = (meetingData) => {

//         const meetingId = crypto.randomUUID();

//         const meeting = {

//             ...meetingData,

//             meetingId,

//             meetingLink: `${window.location.origin}/join/${meetingId}`,

//             status:
//                 meetingData.meetingType === "scheduled"
//                     ? "Scheduled"
//                     : "Live",

//         };

//         setMeeting(meeting);

//     };

//     const endMeeting = () => {
//         setMeeting(null);
//     };

//     return (
//         <MeetingContext.Provider
//             value={{
//                 meeting,
//                 startMeeting,
//                 endMeeting,
//             }}
//         >
//             {children}
//         </MeetingContext.Provider>
//     );
// }

// export function useMeetingContext() {
//     return useContext(MeetingContext);
// }

// import { createContext, useContext, useState } from "react";

// const MeetingContext = createContext();

// export function MeetingProvider({ children }) {
//     const [meeting, setMeeting] = useState(null);

//     const startMeeting = (meetingData) => {
//         const meetingId = crypto.randomUUID();

//         const roomName =
//             meetingData.roomName || `meeting-${meetingId.slice(0, 8)}`;

//         const meeting = {
//             meetingId,

//             roomName,
//             participantName: meetingData.participantName,

//             meetingTitle:
//                 meetingData.meetingTitle || "Untitled Meeting",

//             meetingType:
//                 meetingData.meetingType || "instant",

//             meetingDate:
//                 meetingData.meetingDate || "",

//             meetingTime:
//                 meetingData.meetingTime || "",

//             leaderId:
//                 meetingData.leaderId || null,

//             leaderName:
//                 meetingData.leaderName || "",

//             designation:
//                 meetingData.designation || "",

//             purpose:
//                 meetingData.purpose || "",

//             priority:
//                 meetingData.priority || "Medium",

//             notes:
//                 meetingData.notes || "",

//             host:
//                 meetingData.participantName,

//             participants: [
//                 meetingData.participantName,
//             ],

//             meetingLink: `${window.location.origin}/join/${meetingId}`,

//             status:
//                 meetingData.meetingType === "scheduled"
//                     ? "Scheduled"
//                     : "Live",

//             createdAt: new Date().toISOString(),
//         };

//         setMeeting(meeting);

//         return meeting;
//     };

//     const endMeeting = () => {
//         setMeeting(null);
//     };

//     return (
//         <MeetingContext.Provider
//             value={{
//                 meeting,
//                 startMeeting,
//                 endMeeting,
//             }}
//         >
//             {children}
//         </MeetingContext.Provider>
//     );
// }

// export function useMeetingContext() {
//     return useContext(MeetingContext);
// }

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const MeetingContext = createContext();

const STORAGE_KEY = "activeMeeting";

export function MeetingProvider({ children }) {

    const [meeting, setMeeting] = useState(null);

    useEffect(() => {

        const savedMeeting = localStorage.getItem(STORAGE_KEY);

        if (savedMeeting) {

            setMeeting(JSON.parse(savedMeeting));

        }

    }, []);

    const startMeeting = (meetingData) => {

        const meetingId = crypto.randomUUID();

        const roomName =
            meetingData.roomName ||
            `meeting-${meetingId.slice(0, 8)}`;

        const newMeeting = {

            meetingId,

            roomName,

            participantName: meetingData.participantName,

            meetingTitle:
                meetingData.meetingTitle ||
                "Untitled Meeting",

            meetingType:
                meetingData.meetingType || "instant",

            meetingDate:
                meetingData.meetingDate || "",

            meetingTime:
                meetingData.meetingTime || "",

            leaderId:
                meetingData.leaderId || null,

            leaderName:
                meetingData.leaderName || "",

            designation:
                meetingData.designation || "",

            purpose:
                meetingData.purpose || "",

            priority:
                meetingData.priority || "Medium",

            notes:
                meetingData.notes || "",

            host:
                meetingData.participantName,

            participants: [
                meetingData.participantName,
            ],

            meetingLink:
                `${window.location.origin}/join/${meetingId}`,

            status:
                meetingData.meetingType === "scheduled"
                    ? "Scheduled"
                    : "Live",

            createdAt:
                new Date().toISOString(),

        };

        setMeeting(newMeeting);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(newMeeting)
        );

        return newMeeting;

    };

    const updateMeeting = (updates) => {

        setMeeting((prev) => {

            if (!prev) return null;

            const updatedMeeting = {
                ...prev,
                ...updates,
            };

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(updatedMeeting)
            );

            return updatedMeeting;

        });

    };

    const getMeetingById = (meetingId) => {

        const savedMeeting =
            localStorage.getItem(STORAGE_KEY);

        if (!savedMeeting) return null;

        const parsedMeeting =
            JSON.parse(savedMeeting);

        return parsedMeeting.meetingId === meetingId
            ? parsedMeeting
            : null;

    };

    const endMeeting = () => {

        setMeeting(null);

        localStorage.removeItem(STORAGE_KEY);

    };

    return (

        <MeetingContext.Provider
            value={{
                meeting,
                startMeeting,
                updateMeeting,
                getMeetingById,
                endMeeting,
            }}
        >
            {children}
        </MeetingContext.Provider>

    );

}

export function useMeetingContext() {

    return useContext(MeetingContext);

}