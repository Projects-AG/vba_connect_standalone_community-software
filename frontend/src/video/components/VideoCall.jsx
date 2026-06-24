// export default function VideoCall({
//     leaveRoom,
// }) {

//     return (

//         <div
//             style={{
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 height: "100vh",
//                 flexDirection: "column",
//                 gap: "20px",
//             }}
//         >

//             <h1>🎥 Connected Successfully</h1>

//             <p>
//                 LiveKit connection established.
//             </p>

//             <button
//                 onClick={leaveRoom}
//             >
//                 Leave Room
//             </button>

//         </div>

//     );

// }

import {
    LiveKitRoom,
    VideoConference,
} from "@livekit/components-react";

import "@livekit/components-styles";

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

export default function VideoCall({

    token,

    leaveRoom,

}) {

    return (

        <LiveKitRoom
            serverUrl={LIVEKIT_URL}
            token={token}
            connect={true}
            video={true}
            audio={true}
            data-lk-theme="default"
            onDisconnected={leaveRoom}
            style={{
                height: "100vh",
            }}
        >

            <VideoConference />

        </LiveKitRoom>

    );

}