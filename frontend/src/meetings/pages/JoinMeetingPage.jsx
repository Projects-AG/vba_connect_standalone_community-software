import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMeetingContext } from "../context/MeetingContext";
import { useVideoRoom } from "../../video/hooks/useVideoRoom";
import VideoCall from "../../video/components/VideoCall";

export default function JoinMeetingPage() {

    const { meetingId } = useParams();

    const { getMeetingById } = useMeetingContext();

    const meeting = getMeetingById(meetingId);

    const [participantName, setParticipantName] = useState("");

    const {
        loading,
        token,
        roomName,
        joinRoom,
        leaveRoom,
    } = useVideoRoom();

    if (!meeting) {

        return (
            <div className="flex min-h-screen items-center justify-center">
                <h1 className="text-3xl font-bold">
                    Meeting Not Found
                </h1>
            </div>
        );

    }

    if (token) {

        return (
            <VideoCall
                token={token}
                roomName={roomName}
                leaveRoom={leaveRoom}
            />
        );

    }

    return (

        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">

            <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">

                <h1 className="text-3xl font-bold">
                    {meeting.meetingTitle}
                </h1>

                <p className="mt-2 text-gray-500">
                    {meeting.callType === "group"
                        ? "👥 Group Meeting"
                        : "👤 One-to-One Meeting"}
                </p>

                <div className="mt-6 space-y-2">

                    <p>
                        <strong>Host:</strong> {meeting.host}
                    </p>

                    <p>
                        <strong>Status:</strong> {meeting.status}
                    </p>

                    <p>
                        <strong>Participants:</strong> {meeting.participantCount}
                    </p>

                </div>

                {meeting.callType === "group" && (

                    <div className="mt-8">

                        <h2 className="mb-3 text-xl font-semibold">
                            Invited Members
                        </h2>

                        <div className="space-y-2">

                            {meeting.participants.map((member) => (

                                <div
                                    key={member}
                                    className="rounded-lg border bg-gray-50 px-4 py-3"
                                >
                                    👤 {member}
                                </div>

                            ))}

                        </div>

                    </div>

                )}

                <div className="mt-8">

                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={participantName}
                        onChange={(e) =>
                            setParticipantName(e.target.value)
                        }
                        className="w-full rounded-xl border px-4 py-3"
                    />

                </div>

                <button
                    disabled={loading}
                    onClick={() =>
                        joinRoom(
                            meeting.roomName,
                            participantName
                        )
                    }
                    className="mt-6 w-full rounded-xl bg-violet-600 py-3 font-semibold text-white"
                >
                    {loading
                        ? "Joining..."
                        : "Join Meeting"}
                </button>

            </div>

        </div>

    );

}