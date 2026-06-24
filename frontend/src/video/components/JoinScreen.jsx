import { useState } from "react";

export default function JoinScreen({
    onJoin,
    loading,
}) {

    const [roomName, setRoomName] = useState("");
    const [participantName, setParticipantName] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!roomName.trim() || !participantName.trim()) {
            alert("Please enter Room Name and Participant Name");
            return;
        }

        onJoin(roomName, participantName);
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "#f5f5f5",
            }}
        >
            <form
                onSubmit={handleSubmit}
                style={{
                    width: 400,
                    background: "#ffffff",
                    padding: 30,
                    borderRadius: 10,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 15,
                }}
            >
                <h2>Join Video Room</h2>

                <input
                    type="text"
                    placeholder="Room Name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    style={{
                        padding: 10,
                        fontSize: 16,
                    }}
                />

                <input
                    type="text"
                    placeholder="Participant Name"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    style={{
                        padding: 10,
                        fontSize: 16,
                    }}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: 12,
                        cursor: "pointer",
                    }}
                >
                    {loading ? "Joining..." : "Join Room"}
                </button>
            </form>
        </div>
    );
}