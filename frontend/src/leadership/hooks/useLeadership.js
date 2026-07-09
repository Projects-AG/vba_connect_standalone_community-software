import { useMemo, useState } from "react";

export default function useLeadership() {
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("");
    const [level, setLevel] = useState("");



    // Temporary mock data
    const leaders = [
        {
            id: 1,
            name: "Amit Sharma",
            designation: "National President",
            department: "Organization",
            level: "National",
            phone: "+91 9876543210",
        },
        {
            id: 2,
            name: "Priya Verma",
            designation: "State President",
            department: "State",
            level: "State",
            phone: "+91 9876500000",
        },
        {
            id: 3,
            name: "Rahul Singh",
            designation: "District President",
            department: "District",
            level: "District",
            phone: "+91 9811111111",
        },
        {
            id: 4,
            name: "Neha Patel",
            designation: "General Secretary",
            department: "Organization",
            level: "National",
            phone: "+91 9898989898",
        },
    ];

    const filteredLeaders = useMemo(() => {
        return leaders.filter((leader) => {
            const matchesSearch =
                leader.name.toLowerCase().includes(search.toLowerCase()) ||
                leader.designation.toLowerCase().includes(search.toLowerCase());

            const matchesDepartment =
                department === "" || leader.department === department;

            const matchesLevel =
                level === "" || leader.level === level;

            return matchesSearch && matchesDepartment && matchesLevel;
        });
    }, [leaders, search, department, level]);

    return {
        search,
        setSearch,

        department,
        setDepartment,

        level,
        setLevel,

        leaders: filteredLeaders,
    };
}