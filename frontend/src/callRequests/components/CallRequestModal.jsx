import CallRequestForm from "./CallRequestForm";

export default function CallRequestModal({
    open,
    leader,
    onSubmit,
    onClose,
}) {

    if (!open || !leader) return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">

                <div className="flex items-center justify-between border-b px-8 py-5">

                    <div>

                        <h2 className="text-2xl font-bold text-gray-800">
                            Request a Call
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Send a meeting request to the selected leader.
                        </p>

                    </div>

                    <button
                        onClick={onClose}
                        className="text-3xl font-light text-gray-500 transition hover:text-red-600"
                    >
                        ×
                    </button>

                </div>

                <div className="p-8">

                    <CallRequestForm
                        leader={leader}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                    />

                </div>

            </div>

        </div>

    );

}