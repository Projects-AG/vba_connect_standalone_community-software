export default function LeaderModal({ leader, onClose }) {

    if (!leader) return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">

                {/* Header */}

                <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white rounded-t-3xl">

                    <div className="flex items-center gap-5">

                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-bold text-violet-700">

                            {leader.name.charAt(0)}

                        </div>

                        <div>

                            <h2 className="text-2xl font-bold">
                                {leader.name}
                            </h2>

                            <p className="text-indigo-100">
                                {leader.designation}
                            </p>

                        </div>

                    </div>

                </div>

                {/* Body */}

                <div className="space-y-5 p-8">

                    <div>

                        <p className="text-sm text-gray-500">
                            Department
                        </p>

                        <p className="font-semibold">
                            {leader.department}
                        </p>

                    </div>

                    <div>

                        <p className="text-sm text-gray-500">
                            Level
                        </p>

                        <p className="font-semibold">
                            {leader.level}
                        </p>

                    </div>

                    <div>

                        <p className="text-sm text-gray-500">
                            Contact
                        </p>

                        <p className="font-semibold">
                            {leader.phone}
                        </p>

                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2">

                        <button className="rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700">
                            📞 Call
                        </button>

                        <button className="rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
                            💬 Chat
                        </button>

                        <button className="rounded-xl bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700">
                            🎥 Video
                        </button>

                    </div>

                    <button
                        onClick={onClose}
                        className="mt-4 w-full rounded-xl border py-3 font-semibold hover:bg-gray-100"
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>

    );

}