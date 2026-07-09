import { useMemo, useState } from "react";

import CallRequestList from "../components/CallRequestList";
import { callRequestConfig } from "../config/callRequestConfig";
import useCallRequests from "../hooks/useCallRequests";

export default function CallRequestDashboard() {

    const {
        requests,
        loading,
        approveRequest,
        rejectRequest,
    } = useCallRequests();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");

    const filteredRequests = useMemo(() => {

        return requests.filter((request) => {

            const matchesSearch =
                request.leaderName
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||
                request.purpose
                    ?.toLowerCase()
                    .includes(search.toLowerCase());

            const matchesStatus =
                status === "All" ||
                request.status === status;

            return matchesSearch && matchesStatus;

        });

    }, [requests, search, status]);

    const stats = {

        total: requests.length,

        pending: requests.filter(
            (r) => r.status === "Pending"
        ).length,

        approved: requests.filter(
            (r) => r.status === "Approved"
        ).length,

        rejected: requests.filter(
            (r) => r.status === "Rejected"
        ).length,

    };

    return (

        <div className="min-h-screen bg-slate-100">

            <div className="mx-auto max-w-7xl p-8">

                <div className="mb-8">

                    <h1 className="text-4xl font-bold text-slate-800">
                        📞 Call Request Dashboard
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Manage, approve and monitor call requests.
                    </p>

                </div>

                <div className="mb-8 grid gap-5 md:grid-cols-4">

                    <div className="rounded-2xl bg-white p-6 shadow">
                        <p className="text-sm text-gray-500">Total</p>
                        <h2 className="mt-2 text-3xl font-bold">
                            {stats.total}
                        </h2>
                    </div>

                    <div className="rounded-2xl bg-yellow-50 p-6 shadow">
                        <p className="text-sm text-yellow-700">
                            Pending
                        </p>
                        <h2 className="mt-2 text-3xl font-bold text-yellow-700">
                            {stats.pending}
                        </h2>
                    </div>

                    <div className="rounded-2xl bg-green-50 p-6 shadow">
                        <p className="text-sm text-green-700">
                            Approved
                        </p>
                        <h2 className="mt-2 text-3xl font-bold text-green-700">
                            {stats.approved}
                        </h2>
                    </div>

                    <div className="rounded-2xl bg-red-50 p-6 shadow">
                        <p className="text-sm text-red-700">
                            Rejected
                        </p>
                        <h2 className="mt-2 text-3xl font-bold text-red-700">
                            {stats.rejected}
                        </h2>
                    </div>

                </div>

                <div className="mb-8 rounded-2xl bg-white p-6 shadow">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <input
                            type="text"
                            placeholder="Search by leader or purpose..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            className="w-full rounded-xl border px-4 py-3 lg:max-w-md"
                        />

                        <div className="flex flex-wrap gap-2">

                            {callRequestConfig.statuses.map((item) => (

                                <button
                                    key={item}
                                    onClick={() => setStatus(item)}
                                    className={`rounded-full px-5 py-2 font-medium transition ${status === item
                                        ? "bg-violet-600 text-white"
                                        : "bg-gray-100 hover:bg-gray-200"
                                        }`}
                                >
                                    {item}
                                </button>

                            ))}

                        </div>

                    </div>

                </div>

                {loading ? (

                    <div className="py-20 text-center text-lg">
                        Loading...
                    </div>

                ) : (

                    <CallRequestList
                        requests={filteredRequests}
                        onApprove={approveRequest}
                        onReject={rejectRequest}
                    />

                )}

            </div>

        </div>

    );

}