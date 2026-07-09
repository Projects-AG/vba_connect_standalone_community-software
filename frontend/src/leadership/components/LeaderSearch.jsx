export default function LeaderSearch({
    search,
    setSearch,
    department,
    setDepartment,
    level,
    setLevel,
}) {

    return (

        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">

            <div className="mb-6">

                <h2 className="text-xl font-semibold text-gray-800">
                    Search Leaders
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Quickly find leaders by name, designation, department or level.
                </p>

            </div>

            <div className="grid gap-5 lg:grid-cols-3">

                <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Search
                    </label>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or designation..."
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-100"
                    />

                </div>

                <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Department
                    </label>

                    <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-100"
                    >
                        <option value="">All Departments</option>
                        <option value="Organization">Organization</option>
                        <option value="State">State</option>
                        <option value="District">District</option>
                    </select>

                </div>

                <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Level
                    </label>

                    <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-100"
                    >
                        <option value="">All Levels</option>
                        <option value="National">National</option>
                        <option value="State">State</option>
                        <option value="District">District</option>
                    </select>

                </div>

            </div>

        </div>

    );

}