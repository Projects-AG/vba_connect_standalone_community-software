export default function MeetingCard({
    meeting,
    onCopy,
    onJoin,
}) {
    return (
        <div className="rounded-2xl bg-white p-6 shadow">

            <div className="flex items-center justify-between">

                <div>

                    <h2 className="text-2xl font-bold">
                        {meeting.meetingTitle}
                    </h2>

                    <p className="mt-1 text-gray-500">
                        {meeting.callType === "group"
                            ? "👥 Group Meeting"
                            : "👤 One to One"}
                    </p>

                </div>

                <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${meeting.status === "Live"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}
                >
                    {meeting.status}
                </span>

            </div>

            <div className="mt-6 space-y-2">

                <p>
                    <strong>Host :</strong> {meeting.host}
                </p>

                <p>
                    <strong>Participants :</strong>{" "}
                    {meeting.participantCount}
                </p>

            </div>

            {meeting.callType === "group" && (

                <div className="mt-6">

                    <div className="flex items-center justify-between mb-4">

                        <h3 className="text-lg font-semibold">
                            Invited Participants
                        </h3>

                        <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
                            {meeting.participantCount} Members
                        </span>

                    </div>

                    <div className="space-y-3">

                        {meeting.participants.map((participant, index) => (

                            <div
                                key={index}
                                className="flex items-center justify-between rounded-xl border bg-gray-50 px-4 py-3"
                            >

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 font-bold text-white">

                                        {participant.charAt(0)}

                                    </div>

                                    <div>

                                        <p className="font-semibold">
                                            {participant}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            Invited
                                        </p>

                                    </div>

                                </div>

                                <span className="text-green-600 font-semibold">
                                    ●
                                </span>

                            </div>

                        ))}

                    </div>

                </div>

            )}

            <div className="mt-8 flex gap-4">

                <button
                    onClick={onCopy}
                    className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white"
                >
                  Copy Meeting Link
                </button>

                <button
                    onClick={onJoin}
                    className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white"
                >
                     Join Group Meeting
                </button>

            </div>

        </div>
    );
}