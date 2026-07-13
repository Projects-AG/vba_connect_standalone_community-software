import CallRequestCard from "./CallRequestCard";

export default function CallRequestList({
    requests,
    onApprove,
    onReject,
    onJoinMeeting,
}) {

    if (requests.length === 0) {

        return (

            <div className="rounded-3xl bg-white p-16 text-center shadow">

                <div className="mb-4 text-6xl">
                    📞
                </div>

                <h2 className="text-2xl font-bold text-gray-700">
                    No Call Requests
                </h2>

                <p className="mt-3 text-gray-500">
                    New call requests will appear here.
                </p>

            </div>

        );

    }

    return (

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {requests.map((request) => (

                <CallRequestCard
                    key={request.id}
                    request={request}
                    onApprove={onApprove}
                    onReject={onReject}
                    onJoinMeeting={onJoinMeeting}
                />

            ))}

        </div>

    );

}