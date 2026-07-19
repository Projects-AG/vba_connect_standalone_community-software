// import {
//     useLocalParticipant,
// } from "@livekit/components-react";

// export default function useMeetingControls() {

//     const { localParticipant } = useLocalParticipant();

//     const toggleMic = async () => {
//         await localParticipant.setMicrophoneEnabled(
//             !localParticipant.isMicrophoneEnabled
//         );
//     };

//     const toggleCamera = async () => {
//         await localParticipant.setCameraEnabled(
//             !localParticipant.isCameraEnabled
//         );
//     };

//     return {
//         toggleMic,
//         toggleCamera,
//         micEnabled: localParticipant?.isMicrophoneEnabled,
//         cameraEnabled: localParticipant?.isCameraEnabled,
//     };
// }

import {
    useLocalParticipant,
    useRoomContext,
} from "@livekit/components-react";

export default function useMeetingControls({
    sharing,
    setSharing,
    setMuted,
    setCameraOn,
    leaveCall,
}) {

    const { localParticipant } = useLocalParticipant();
    const room = useRoomContext();

    const toggleMic = async () => {

        const enabled =
            !localParticipant.isMicrophoneEnabled;

        await localParticipant.setMicrophoneEnabled(enabled);

        setMuted(!enabled);
    };

    const toggleCamera = async () => {

        const enabled =
            !localParticipant.isCameraEnabled;

        await localParticipant.setCameraEnabled(enabled);

        setCameraOn(enabled);
    };

    const toggleScreenShare = async () => {

        const enabled = !sharing;

        await localParticipant.setScreenShareEnabled(enabled);

        setSharing(enabled);
    };

    const endCall = async () => {

        await room.disconnect();

        leaveCall();
    };

    return {

        toggleMic,

        toggleCamera,

        toggleScreenShare,

        endCall,

        micEnabled:
            localParticipant.isMicrophoneEnabled,

        cameraEnabled:
            localParticipant.isCameraEnabled,

    };
}