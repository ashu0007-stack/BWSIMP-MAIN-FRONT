import { useEffect, useState } from "react";

export default function Footer() {
    const [year, setYear] = useState<number | null>(null);
    
    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);
    
    return (
        <footer className="bg-blue-900 text-white text-center py-3 shadow-lg border-t border-blue-700">
            <p className="text-sm">
                © {year || new Date().getFullYear()} Bihar Water Security & Irrigation Modernization Project (BWSIMP). All rights reserved.
            </p>
        </footer>
    );
}