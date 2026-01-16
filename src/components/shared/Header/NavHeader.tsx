import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

export default function NavHeader() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<string>("home");

  const scrollToSection = (id: string) => {
    setActiveMenu(id);

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
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const menuClass = (id: string) =>
    `text-white text-sm uppercase tracking-wide transition border-b-2
     ${
       activeMenu === id
         ? "font-bold border-white"
         : "font-semibold border-transparent hover:border-white"
     }`;

  return (
    <nav className="fixed top-[100px] left-0 w-full z-40 bg-[#0B2C5D] border-b border-blue-300">
      <div className="px-4 py-2 flex items-center justify-between">

        {/* LEFT MENU */}
        <div className="flex gap-8 text-center leading-tight">
          <Link
            href="/"
            onClick={() => setActiveMenu("home")}
            className={menuClass("home")}
          >
            Home
          </Link>

          <button
            onClick={() => scrollToSection("overview")}
            className={menuClass("overview")}
          >
            Overview
          </button>

          <button
            onClick={() => scrollToSection("aboutProject")}
            className={menuClass("aboutProject")}
          >
            About Project
          </button>

          <button
            onClick={() => scrollToSection("gallery-media")}
            className={menuClass("gallery-media")}
          >
            Gallery / Media
          </button>
        </div>

        {/* RIGHT LOGIN */}
        <button
          onClick={() => router.push("/login")}
          className="bg-white text-[#0B2C5D] px-5 py-1.5 text-sm font-bold border border-blue-200 rounded hover:bg-blue-50 transition"
        >
          Login
        </button>
      </div>
    </nav>
  );
}
