export default function LeaderFilters() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <select className="rounded-xl border border-gray-300 p-3">
                <option>State</option>
            </select>

            <select className="rounded-xl border border-gray-300 p-3">
                <option>District</option>
            </select>

            <select className="rounded-xl border border-gray-300 p-3">
                <option>Department</option>
            </select>
        </div>
    );
}