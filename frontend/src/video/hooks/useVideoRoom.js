// import { useState } from "react";
// import { Room } from "livekit-client";

// import { videoApi } from "../services/videoApi";

// const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

// export function useVideoRoom() {
//     const [room, setRoom] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [connected, setConnected] = useState(false);

//     const joinRoom = async (roomName, participantName) => {
//         try {
//             setLoading(true);

//             // Generate access token from backend
//             const response = await videoApi.generateToken(
//                 roomName,
//                 participantName
//             );

//             const token = response.token;

//             // Create LiveKit room instance
//             const livekitRoom = new Room();

//             // Connect to LiveKit server
//             await livekitRoom.connect(
//                 LIVEKIT_URL,
//                 token
//             );

//             setRoom(livekitRoom);
//             setConnected(true);

//             return livekitRoom;

//         } finally {
//             setLoading(false);
//         }
//     };

//     const leaveRoom = async () => {

//         if (!room) {
//             return;
//         }

//         room.disconnect();

//         setRoom(null);
//         setConnected(false);
//     };

//     return {
//         room,
//         loading,
//         connected,
//         joinRoom,
//         leaveRoom,
//     };
// }

import { useState } from "react";

import { videoApi } from "../services/videoApi";

export function useVideoRoom() {

    const [loading, setLoading] = useState(false);

    const [token, setToken] = useState(null);

    const [roomName, setRoomName] = useState("");

    const [participantName, setParticipantName] = useState("");

    const joinRoom = async (
        room,
        participant,
    ) => {

        try {

            setLoading(true);

            const response =
                await videoApi.generateToken(
                    room,
                    participant,
                );

            setToken(response.token);

            setRoomName(room);

            setParticipantName(participant);

        } finally {

            setLoading(false);

        }

    };

    const leaveRoom = () => {

        setToken(null);

        setRoomName("");

        setParticipantName("");

        console.log("Disconnected from room");

    };
    return {

        loading,

        token,

        roomName,

        participantName,

        joinRoom,

        leaveRoom,

    };

}