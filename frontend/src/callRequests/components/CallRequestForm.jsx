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

    const handleSubmit = (e) => {

        e.preventDefault();

        onSubmit({

            leaderId: leader.id,

            leaderName: leader.name,

            designation: leader.designation,

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