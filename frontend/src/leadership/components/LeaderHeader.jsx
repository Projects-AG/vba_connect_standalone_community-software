export default function LeaderHeader() {
    return (
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white shadow-xl">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

                <div>

                    <h1 className="text-4xl font-bold">
                        Leadership Directory
                    </h1>

                    <p className="mt-3 max-w-2xl text-indigo-100 text-lg">
                        Browse organizational leaders, explore the hierarchy,
                        and quickly connect through messaging, voice, or video.
                    </p>

                </div>

                <div className="grid grid-cols-2 gap-4">

                    <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

                        <p className="text-sm text-indigo-100">
                            Total Leaders
                        </p>

                        <h2 className="mt-2 text-3xl font-bold">
                            124
                        </h2>

                    </div>

                    <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

                        <p className="text-sm text-indigo-100">
                            Online
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-green-300">
                            38
                        </h2>

                    </div>

                </div>

            </div>

        </div>
    );
}