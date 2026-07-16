import {
    useLocalParticipant,
} from "@livekit/components-react";

export default function useMeetingControls() {

    const { localParticipant } = useLocalParticipant();

    const toggleMic = async () => {
        await localParticipant.setMicrophoneEnabled(
            !localParticipant.isMicrophoneEnabled
        );
    };

    const toggleCamera = async () => {
        await localParticipant.setCameraEnabled(
            !localParticipant.isCameraEnabled
        );
    };

    return {
        toggleMic,
        toggleCamera,
        micEnabled: localParticipant?.isMicrophoneEnabled,
        cameraEnabled: localParticipant?.isCameraEnabled,
    };
}