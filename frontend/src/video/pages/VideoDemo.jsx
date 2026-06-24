// import JoinScreen from "../components/JoinScreen";
// import { useVideoRoom } from "../hooks/useVideoRoom";

// export default function VideoDemo() {

//     const {
//         loading,
//         connected,
//         joinRoom,
//     } = useVideoRoom();

//     return (

//         <JoinScreen
//             onJoin={joinRoom}
//             loading={loading}
//         />

//     );

// }

// import JoinScreen from "../components/JoinScreen";
// import VideoCall from "../components/VideoCall";

// import { useVideoRoom } from "../hooks/useVideoRoom";

// export default function VideoDemo() {

//     const {
//         loading,
//         connected,
//         joinRoom,
//         leaveRoom,
//     } = useVideoRoom();

//     if (connected) {

//         return (

//             <VideoCall
//                 leaveRoom={leaveRoom}
//             />

//         );

//     }

//     return (

//         <JoinScreen
//             onJoin={joinRoom}
//             loading={loading}
//         />

//     );

// }

import JoinScreen from "../components/JoinScreen";
import VideoCall from "../components/VideoCall";

import { useVideoRoom } from "../hooks/useVideoRoom";

export default function VideoDemo() {

    const {
        loading,
        token,
        roomName,
        participantName,
        joinRoom,
        leaveRoom,
    } = useVideoRoom();

    if (token) {

        return (
            <VideoCall
                token={token}
                roomName={roomName}
                participantName={participantName}
                leaveRoom={leaveRoom}
            />
        );

    }

    return (

        <JoinScreen
            onJoin={joinRoom}
            loading={loading}
        />

    );

}