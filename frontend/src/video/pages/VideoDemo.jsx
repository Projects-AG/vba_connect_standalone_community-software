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
import {
    JoinScreen,
    VideoCall,
    useVideoRoom,
} from "../index";
import { useEffect } from "react";
import { useMeetingContext } from "../../meetings/context/MeetingContext";

export default function VideoDemo() {

    const {
        loading,
        token,
        roomName,
        participantName,
        joinRoom,
        leaveRoom,
    } = useVideoRoom();

    const { meeting, endMeeting } = useMeetingContext();

    const handleLeaveMeeting = () => {

        leaveRoom();

        endMeeting();

    };

    useEffect(() => {

        if (!meeting) return;

        joinRoom(
            meeting.roomName,
            meeting.participantName
        );

    }, [meeting]);

    if (token) {

        return (
            // <VideoCall
            //     token={token}
            //     roomName={roomName}
            //     participantName={participantName}
            //     leaveRoom={leaveRoom}
            // />
            <VideoCall
                token={token}
                leaveRoom={handleLeaveMeeting}
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