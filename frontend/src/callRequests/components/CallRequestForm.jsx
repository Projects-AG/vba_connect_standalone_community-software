import { useState } from "react";

import { callRequestConfig } from "../config/callRequestConfig";

export default function CallRequestForm({
    leader,
    onSubmit,
    onCancel,
}) {

    const [purpose, setPurpose] = useState(
        callRequestConfig.purposes[0]
    );

    const [priority, setPriority] = useState("Medium");

    const [notes, setNotes] = useState("");

    const [meetingTitle, setMeetingTitle] = useState("");

    const [meetingType, setMeetingType] = useState("instant");

    const [meetingDate, setMeetingDate] = useState("");

    const [meetingTime, setMeetingTime] = useState("");

    const handleSubmit = (e) => {

        e.preventDefault();

        onSubmit({

            leaderId: leader.id,

            leaderName: leader.name,

            designation: leader.designation,

            meetingTitle:
                meetingTitle.trim() || `Meeting with ${leader.name}`,

            meetingType,

            meetingDate,

            meetingTime,

            purpose,

            priority,

            notes,

        });
    };

    return (

        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >

            <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Leader
                </label>

                <input
                    value={leader.name}
                    disabled
                    className="w-full rounded-xl border bg-gray-100 px-4 py-3"
                />

            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Meeting Title
                </label>

                <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder="Project Discussion"
                    className="w-full rounded-xl border px-4 py-3"
                />
            </div>

            <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                    Meeting Type
                </label>

                <div className="flex gap-6">

                    <label className="flex cursor-pointer items-center gap-2">
                        <input
                            type="radio"
                            value="instant"
                            checked={meetingType === "instant"}
                            onChange={(e) => setMeetingType(e.target.value)}
                        />

                        <span>⚡ Instant Meeting</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2">
                        <input
                            type="radio"
                            value="scheduled"
                            checked={meetingType === "scheduled"}
                            onChange={(e) => setMeetingType(e.target.value)}
                        />

                        <span>📅 Schedule Meeting</span>
                    </label>

                </div>
            </div>

            <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Purpose
                </label>

                <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3"
                >

                    {callRequestConfig.purposes.map((item) => (

                        <option
                            key={item}
                            value={item}
                        >
                            {item}
                        </option>

                    ))}

                </select>

            </div>

            <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Priority
                </label>

                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3"
                >

                    {callRequestConfig.priorities.map((item) => (

                        <option
                            key={item}
                            value={item}
                        >
                            {item}
                        </option>

                    ))}

                </select>

            </div>

            {meetingType === "scheduled" && (

                <div className="grid grid-cols-2 gap-4">

                    <div>

                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Meeting Date
                        </label>

                        <input
                            type="date"
                            value={meetingDate}
                            onChange={(e) => setMeetingDate(e.target.value)}
                            className="w-full rounded-xl border px-4 py-3"
                        />

                    </div>

                    <div>

                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Meeting Time
                        </label>

                        <input
                            type="time"
                            value={meetingTime}
                            onChange={(e) => setMeetingTime(e.target.value)}
                            className="w-full rounded-xl border px-4 py-3"
                        />

                    </div>

                </div>

            )}

            <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Notes
                </label>

                <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add meeting agenda..."
                    className="w-full rounded-xl border px-4 py-3"
                />

            </div>

            <div className="flex gap-4">

                <button
                    type="submit"
                    className="flex-1 rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-700"
                >
                    Send Request
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 rounded-xl border py-3 font-semibold hover:bg-gray-100"
                >
                    Cancel
                </button>

            </div>

        </form>

    );

}