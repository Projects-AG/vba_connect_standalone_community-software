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
import { videoTheme } from "../theme/videoTheme";
import { videoConfig } from "../config/videoConfig";
// const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

export default function VideoCall({

    token,

    leaveRoom,

}) {

    return (

        <LiveKitRoom
            serverUrl={videoConfig.livekitUrl}
            token={token}
            connect={true}
            video={videoTheme.video}
            audio={videoTheme.audio}
            data-lk-theme={videoTheme.theme}
            onDisconnected={leaveRoom}

            style={{
                height: videoTheme.height,
            }}
        >

            <VideoConference />

        </LiveKitRoom>

    );

}