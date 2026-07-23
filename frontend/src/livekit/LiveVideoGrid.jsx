// import ParticipantTile from "./ParticipantTile";

// export default function LiveVideoGrid() {
//   return (
//     <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-content-entrance overflow-y-auto custom-scrollbar">

//       <ParticipantTile />

//     </div>
//   );
// }

import ParticipantTile from "./ParticipantTile";

export default function LiveVideoGrid({
    cameraOn,
}) {
    return (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-content-entrance overflow-y-auto custom-scrollbar">

            {/* LiveKit Participants */}
            <ParticipantTile />

            {/* AI Summary Tile */}
            {/* <div className="relative rounded-xl overflow-hidden bg-primary-container p-6 flex flex-col justify-between shadow-lg ring-1 ring-primary/20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <span
                            className="material-symbols-outlined text-white"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            bolt
                        </span>
                    </div>

                    <span className="font-label-md text-label-md text-white/90 tracking-wider">
                        AI REAL-TIME SUMMARY
                    </span>
                </div>

                <div className="space-y-4">
                    <p className="font-headline-md text-headline-md text-white leading-tight">
                        Decided: Move the launch date to Nov 15th to accommodate the new
                        security audit requirements.
                    </p>

                    <div className="flex gap-2">
                        <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded border border-white/20 uppercase font-bold tracking-tighter">
                            Task
                        </span>

                        <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded border border-white/20 uppercase font-bold tracking-tighter">
                            Timeline
                        </span>
                    </div>
                </div>
            </div> */}

            {/* Camera Off Tile */}
            {!cameraOn && (
                <div className="relative rounded-xl overflow-hidden bg-on-background flex items-center justify-center shadow-lg ring-1 ring-outline-variant/10">
                    <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center">
                        <span className="text-headline-xl font-headline-xl text-on-primary-container">
                            YU
                        </span>
                    </div>

                    <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-on-background/40 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/10">
                        <span className="material-symbols-outlined text-[16px]">
                            mic_off
                        </span>

                        <span className="font-label-md text-label-md">
                            You (camera off)
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}