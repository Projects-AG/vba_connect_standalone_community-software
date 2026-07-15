// import { useParams } from "react-router-dom";
// import { useState } from "react";

// import { useMeetingContext } from "../context/MeetingContext";
// import { useVideoRoom } from "../../video/hooks/useVideoRoom";
// import VideoCall from "../../video/components/VideoCall";

// export default function JoinMeetingPage() {

//     const { meetingId } = useParams();

//     const { getMeetingById } = useMeetingContext();

//     const meeting = getMeetingById(meetingId);

//     const {
//         token,
//         loading,
//         joinRoom,
//         leaveRoom,
//     } = useVideoRoom();

//     const [participantName, setParticipantName] = useState("");

//     if (!meeting) {

//         return (
//             <div className="flex h-screen items-center justify-center">
//                 <h1 className="text-3xl font-bold">
//                     Meeting Not Found
//                 </h1>
//             </div>
//         );

//     }

//     if (token) {

//         return (

//             <VideoCall
//                 token={token}
//                 leaveRoom={leaveRoom}
//             />

//         );

//     }

//     return (

//         <div className="flex min-h-screen items-center justify-center bg-gray-100">

//             <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

//                 <h1 className="mb-6 text-3xl font-bold">

//                     {meeting.meetingTitle}

//                 </h1>

//                 <p className="mb-2">

//                     <strong>Leader:</strong>

//                     {" "}

//                     {meeting.leaderName}

//                 </p>

//                 <p className="mb-6">

//                     <strong>Status:</strong>

//                     {" "}

//                     {meeting.status}

//                 </p>

//                 <input
//                     className="mb-4 w-full rounded-lg border p-3"
//                     placeholder="Enter your name"
//                     value={participantName}
//                     onChange={(e) =>
//                         setParticipantName(e.target.value)
//                     }
//                 />

//                 <button

//                     disabled={loading}

//                     onClick={() =>
//                         joinRoom(
//                             meeting.roomName,
//                             participantName
//                         )
//                     }

//                     className="w-full rounded-lg bg-violet-600 py-3 font-semibold text-white"

//                 >

//                     {loading
//                         ? "Joining..."
//                         : "Join Meeting"}

//                 </button>

//             </div>

//         </div>

//     );

// }

import { useNavigate } from "react-router-dom";
import MeetingCard from "../components/MeetingCard";
import { useMeetingContext } from "../context/MeetingContext";

export default function MeetingDashboard() {

    const navigate = useNavigate();

    const { meeting } = useMeetingContext();

    if (!meeting) {

        return (

            <div className="flex min-h-screen items-center justify-center">

                <h1 className="text-3xl font-bold text-gray-500">
                    No Active Meeting
                </h1>

            </div>

        );

    }

    const handleCopy = async () => {

        await navigator.clipboard.writeText(
            meeting.meetingLink
        );

        alert("Meeting Link Copied");

    };

    const handleJoin = () => {

        navigate(`/join/${meeting.meetingId}`);

    };

    return (

        <div className="min-h-screen bg-slate-100 p-8">

            <div className="mx-auto max-w-5xl">

                <h1 className="mb-8 text-4xl font-bold">

                    Meetings Dashboard

                </h1>

                <MeetingCard
                    meeting={meeting}
                    onCopy={handleCopy}
                    onJoin={handleJoin}
                />

            </div>

        </div>

    );

}