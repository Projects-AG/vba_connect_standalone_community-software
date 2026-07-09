import { useState } from "react";
import LeaderCard from "./LeaderCard";
import LeaderModal from "./LeaderModal";

export default function LeaderGrid({ leaders }) {
    const [selectedLeader, setSelectedLeader] = useState(null);
    const national = leaders.filter(
        (leader) => leader.level === "National"
    );

    const state = leaders.filter(
        (leader) => leader.level === "State"
    );

    const district = leaders.filter(
        (leader) => leader.level === "District"
    );

    const renderSection = (title, data) => {

        if (data.length === 0) return null;

        return (

            <section className="mb-12">

                <div className="mb-6 flex items-center justify-between">

                    <div>

                        <h2 className="text-2xl font-bold text-gray-800">
                            {title}
                        </h2>

                        <p className="text-gray-500">
                            {data.length} Leader{data.length > 1 ? "s" : ""}
                        </p>

                    </div>

                    <div className="h-px flex-1 bg-gray-300 ml-6"></div>

                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

                    {data.map((leader) => (
                        <div
                            key={leader.id}
                            onClick={() => setSelectedLeader(leader)}
                            className="cursor-pointer"
                        >
                            <LeaderCard leader={leader} />
                        </div>
                    ))}

                </div>

            </section>

        );

    };

    return (
        <>
            {renderSection("🇮🇳 National Leadership", national)}

            {renderSection("🏛️ State Leadership", state)}

            {renderSection("📍 District Leadership", district)}

            <LeaderModal
                leader={selectedLeader}
                onClose={() => setSelectedLeader(null)}
            />
        </>
    );

}