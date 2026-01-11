import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { FC } from 'react'
export const NavHeader: FC = () => {
    const router = useRouter();
    const scrollToSection = (id: string) => {
        if (router.pathname !== "/landing") {
            router
                .push(`/landing#${id}`, undefined, { scroll: false })
                .then(() => {
                    setTimeout(() => {
                        const el = document.getElementById(id);
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                    }, 300);
                });
            return;
        }
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };
    return (
        <nav className='bg-gradient-to-r from-blue-900 to-blue-800 text-white flex items-center justify-between px-4 py-3 shadow-xl fixed top-[100px] left-0 w-full z-40'>
            <div className="flex gap-4 ml-4">
                <Link href="/" className="hover:text-blue-200 font-medium transition-colors text-sm">
                    Home
                </Link>
                <button
                    onClick={() => scrollToSection("overview")}
                    className="hover:text-blue-200 font-medium transition-colors text-sm">
                    Overview
                </button>
                <button
                    onClick={() => scrollToSection("aboutProject")}
                    className="hover:text-blue-200 font-medium transition-colors text-sm">
                    About Project
                </button>
                <button
                    onClick={() => scrollToSection("gallery-media")}
                    className="hover:text-blue-200 font-medium transition-colors text-sm">
                    Gallery / Media
                </button>
            </div>
            <div className="mr-4">
                <button
                    onClick={() => router.push("/login")}
                    className="bg-white text-blue-900 hover:bg-blue-50 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 hover:shadow-lg text-sm" >
                    Login
                </button>
            </div>
        </nav>
    );
};