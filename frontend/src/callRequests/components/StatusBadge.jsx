export default function StatusBadge({ status }) {

    const styles = {

        Pending:
            "bg-yellow-100 text-yellow-700 border-yellow-300",

        Approved:
            "bg-green-100 text-green-700 border-green-300",

        Rejected:
            "bg-red-100 text-red-700 border-red-300",

        Completed:
            "bg-blue-100 text-blue-700 border-blue-300",

    };

    return (

        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${styles[status] ||
                "bg-gray-100 text-gray-700 border-gray-300"
                }`}
        >
            {status}
        </span>

    );

}