// import LeaderFilters from "../components/LeaderFilters";
import LeaderGrid from "../components/LeaderGrid";
import LeaderHeader from "../components/LeaderHeader";
import LeaderSearch from "../components/LeaderSearch";
import useLeadership from "../hooks/useLeadership";

export default function LeadershipDirectory() {
    const {
        leaders,
        search,
        setSearch,
        department,
        setDepartment,
        level,
        setLevel,
    } = useLeadership();

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-7xl">
                <LeaderHeader />

                <div className="mb-6">
                    <LeaderSearch
                        search={search}
                        setSearch={setSearch}
                        department={department}
                        setDepartment={setDepartment}
                        level={level}
                        setLevel={setLevel}
                    />
                </div>

                {/* <div className="mb-8">
                    <LeaderFilters />
                </div> */}

                <LeaderGrid leaders={leaders} />
            </div>
        </div>
    );
}