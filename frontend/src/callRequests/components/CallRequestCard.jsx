import StatusBadge from "./StatusBadge";

export default function CallRequestCard({
    request,
    onApprove,
    onReject,
}) {

    return (

        <div className="rounded-2xl bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">

            <div className="mb-5 flex items-start justify-between">

                <div>

                    <h3 className="text-xl font-bold text-gray-800">
                        {request.leaderName}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        {request.designation}
                    </p>

                </div>

                <StatusBadge
                    status={request.status}
                />

            </div>

            <div className="space-y-3 text-sm">

                <div className="flex justify-between">

                    <span className="font-medium text-gray-500">
                        Purpose
                    </span>

                    <span className="font-semibold text-gray-800">
                        {request.purpose}
                    </span>

                </div>

                <div className="flex justify-between">

                    <span className="font-medium text-gray-500">
                        Priority
                    </span>

                    <span
                        className={`font-semibold ${request.priority === "High"
                            ? "text-red-600"
                            : request.priority === "Medium"
                                ? "text-amber-600"
                                : "text-green-600"
                            }`}
                    >
                        {request.priority}
                    </span>

                </div>

                <div className="flex justify-between">

                    <span className="font-medium text-gray-500">
                        Requested
                    </span>

                    <span className="text-gray-700">
                        {request.date}
                    </span>

                </div>

            </div>

            <div className="mt-6 flex gap-3">

                <button
                    onClick={() => onApprove(request.id)}
                    disabled={request.status !== "Pending"}
                    className="flex-1 rounded-xl bg-green-600 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                    ✓ Approve
                </button>

                <button
                    onClick={() => onReject(request.id)}
                    disabled={request.status !== "Pending"}
                    className="flex-1 rounded-xl bg-red-600 py-2 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                    ✕ Reject
                </button>

            </div>

            {request.status === "Approved" && (

                <button
                    className="mt-4 w-full rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-700"
                >
                    🎥 Join Meeting
                </button>

            )}

        </div>

    );

}