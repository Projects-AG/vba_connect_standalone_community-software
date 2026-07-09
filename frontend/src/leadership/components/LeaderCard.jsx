export default function LeaderCard({ leader }) {
    return (
        <div className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-6 text-white">

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-4">

                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-bold text-violet-700 shadow-lg">
                            {leader.name.charAt(0)}
                        </div>

                        <div>

                            <h3 className="text-lg font-bold">
                                {leader.name}
                            </h3>

                            <p className="text-sm text-indigo-100">
                                {leader.designation}
                            </p>

                        </div>

                    </div>

                    <span className="h-4 w-4 rounded-full bg-green-400 ring-4 ring-white/30"></span>

                </div>

            </div>

            {/* Body */}
            <div className="space-y-4 p-6">

                <div className="flex flex-wrap gap-2">

                    <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700">
                        {leader.department}
                    </span>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                        {leader.level}
                    </span>

                </div>

                <div>

                    <p className="text-sm text-gray-500">
                        Contact Number
                    </p>

                    <p className="font-semibold text-gray-800">
                        {leader.phone}
                    </p>

                </div>

                {/* Buttons */}

                <div className="grid grid-cols-3 gap-3 pt-2">

                    <button
                        className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                        📞 Call
                    </button>

                    <button
                        className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        💬 Chat
                    </button>

                    <button
                        className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
                    >
                        🎥 Video
                    </button>

                </div>

            </div>

        </div>
    );
}