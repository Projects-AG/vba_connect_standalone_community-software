import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavRail from "../components/NavRail";
import { meetingApi } from "../services/meetingApi";

export default function JoinMeeting() {
    const { meetingId } = useParams();
    const navigate = useNavigate();

    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [participant, setParticipant] = useState("");
    const [error, setError] = useState("");

    // const participant = "Nityam";

    useEffect(() => {
        loadMeeting();
    }, []);

    async function loadMeeting() {
        try {
            const res = await meetingApi.getMeeting(meetingId);

            if (!res.success) {
                setError("Meeting not found.");
                return;
            }

            setMeeting(res.data);
            setParticipant(res.data.participants[0] || "");
        } catch (err) {
            setError("Unable to load meeting.");
        } finally {
            setLoading(false);
        }
    }

    function handleCopyLink() {
        const link = `${window.location.origin}${meeting.meetingLink}`;

        navigator.clipboard.writeText(link);

        alert("Meeting link copied successfully.");
    }

    async function handleJoin() {
        console.log("Button Clicked");
        try {
            setJoining(true);

            const tokenRes = await meetingApi.generateToken(
                meeting.meetingId,
                participant
            );

            console.log("Meeting");
            console.log(meeting);

            console.log("Token Response");
            console.log(JSON.stringify(tokenRes, null, 2));

            console.log("Navigate State");
            console.log({
                meeting,
                token: tokenRes.data?.token,
                participant,
            });
            navigate("/calls/active", {
                state: {
                    meeting,
                    token: tokenRes.token,
                    participant,
                },
            });
        } catch (err) {
            console.log(err);
            alert("Unable to join meeting.");
        } finally {
            setJoining(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen bg-surface items-center justify-center">
                <div className="text-on-surface text-lg">
                    Loading meeting...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen bg-surface items-center justify-center">
                <div className="bg-error-container text-on-error-container px-8 py-6 rounded-2xl shadow-xl">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-surface overflow-hidden">

            <NavRail />

           <main className="ml-20 flex-1 overflow-y-auto p-8">
               <div className="w-full max-w-6xl mx-auto bg-surface-container-low rounded-3xl shadow-2xl ring-1 ring-outline-variant/20 p-10">

                    <div className="flex justify-center mb-6">

                        <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center">

                            <span
                                className="material-symbols-outlined text-primary text-5xl"
                                style={{
                                    fontVariationSettings: "'FILL' 1",
                                }}
                            >
                                videocam
                            </span>

                        </div>

                    </div>

                    <h1 className="text-center font-headline-lg text-headline-lg font-black text-on-surface">
                        {meeting.meetingTitle}
                    </h1>

                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => {
                                const link = `${window.location.origin}${meeting.meetingLink}`;

                                navigator.clipboard.writeText(link);

                                alert("Meeting link copied!");
                            }}
                            className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl hover:opacity-90 transition"
                        >
                            <span className="material-symbols-outlined">
                                content_copy
                            </span>

                            Copy Meeting Link
                        </button>
                    </div>

                    <p className="text-center mt-2 text-on-surface-variant">
                        {meeting.callType === "group"
                            ? "Group Meeting"
                            : "One to One Meeting"}
                    </p>

                   <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">

                        <InfoCard
                            icon="groups"
                            label="Participants"
                            value={meeting.participantCount}
                        />

                        <InfoCard
                            icon="schedule"
                            label="Status"
                            value={meeting.status}
                        />

                        <InfoCard
                            icon="person"
                            label="Host"
                            value={meeting.host}
                        />

                        <InfoCard
                            icon="meeting_room"
                            label="Meeting Type"
                            value={meeting.meetingType}
                        />

                    </div>

                    <div className="mt-10">

                        <h2 className="font-bold text-on-surface mb-3">
                            Participants
                        </h2>

                       <div className="space-y-3 max-h-80 overflow-y-auto pr-2">

                            {meeting.participants.map((name) => (
                                <div
                                    key={name}
                                    className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">

                                        <span className="font-bold text-primary">
                                            {name
                                                .split(" ")
                                                .map((v) => v[0])
                                                .join("")}
                                        </span>

                                    </div>

                                    <span className="text-on-surface">
                                        {name}
                                    </span>

                                </div>
                            ))}

                        </div>

                    </div>

                    <div className="mt-8">
                        <label className="block mb-2 font-semibold">
                            Join As
                        </label>

                        <select
                            value={participant}
                            onChange={(e) => setParticipant(e.target.value)}
                            className="w-full border rounded-xl px-4 py-3"
                        >
                            {meeting.participants.map((name) => (
                                <option
                                    key={name}
                                    value={name}
                                >
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleJoin}
                        disabled={joining}
                        className="mt-10 w-full bg-primary text-white rounded-xl py-4 font-bold hover:opacity-90 transition"
                    >
                        {joining
                            ? "Joining..."
                            : "Join Meeting"}
                    </button>

                </div>

            </main>

        </div>
    );
}

function InfoCard({ icon, label, value }) {
    return (
        <div className="bg-surface-container rounded-2xl p-5">

            <span className="material-symbols-outlined text-primary">
                {icon}
            </span>

            <p className="text-sm text-on-surface-variant mt-2">
                {label}
            </p>

            <h3 className="font-bold text-lg text-on-surface mt-1">
                {value}
            </h3>

        </div>
    );
}