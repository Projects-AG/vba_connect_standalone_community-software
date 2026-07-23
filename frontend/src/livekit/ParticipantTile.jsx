import { useEffect } from "react";
import {
    ParticipantTile as LKParticipantTile,
    useTracks,
} from "@livekit/components-react";

import { Track } from "livekit-client";

export default function ParticipantTile() {
    const tracks = useTracks(
        [
            {
                source: Track.Source.Camera,
                withPlaceholder: true,
            },
        ],
        {
            onlySubscribed: false,
        }
    );

    useEffect(() => {
        console.log("========== TRACKS ==========");
        console.log(tracks);
    }, [tracks]);

    return (
        <>
            {tracks.map((track, index) => {
                console.log("========== TRACK ==========");
                console.log(track);

                console.log("Participant Identity:");
                console.log(track.participant?.identity);

                console.log("Participant Name:");
                console.log(track.participant?.name);

                console.log("Participant SID:");
                console.log(track.participant?.sid);

                console.log("Is Local:");
                console.log(track.participant?.isLocal);

                console.log("Track SID:");
                console.log(track.publication?.trackSid);

                return (
                    <div
                        key={track.publication?.trackSid || index}
                        className="relative rounded-xl overflow-hidden bg-on-background shadow-lg ring-1 ring-outline-variant/10"
                    >
                        <LKParticipantTile
                            trackRef={track}
                            className="w-full h-full"
                        />

                        {track.participant?.isSpeaking && (
                            <div className="absolute top-3 right-3 bg-primary text-white text-[10px] px-2 py-1 rounded font-bold uppercase">
                                Speaking
                            </div>
                        )}

                        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-on-background/40 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/10">
                            <span className="material-symbols-outlined text-[16px]">
                                {track.participant?.isMicrophoneEnabled
                                    ? "mic"
                                    : "mic_off"}
                            </span>

                            <span className="font-label-md text-label-md">
                               {track.participant?.name || track.participant?.identity}
                            </span>
                        </div>
                    </div>
                );
            })}
        </>
    );
}