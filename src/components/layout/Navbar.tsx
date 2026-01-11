import Image from "next/image";
import wordBank from "../../../public/wordbank.svg";
import logoWRD from "../../../public/logoWRD.png";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">

          {/* ===== LEFT: PROJECT TITLE ===== */}
          <div className="flex items-center gap-4">
            <div className="border-l-4 border-cyan-400 pl-4">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-wide">
                <span className="text-cyan-300">BWSIMP</span>
              </h1>
              <p className="text-xs sm:text-sm text-blue-200 leading-snug">
                Bihar Water Security & Irrigation<br className="hidden sm:block" />
                Modernization Project
              </p>
            </div>
          </div>

          {/* ===== RIGHT: LOGOS ===== */}
          <div className="flex items-center gap-4 sm:gap-6">

            {/* World Bank */}
            <div className="relative group">
              <div className="relative h-12 sm:h-14 w-32 sm:w-40 bg-white/95 rounded-xl p-3 shadow-md transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={wordBank}
                  alt="World Bank"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-700 text-[10px] px-2 py-0.5 rounded-full">
                Partner
              </span>
            </div>

            {/* WRD */}
            <div className="relative group">
              <div className="relative h-12 sm:h-14 w-28 sm:w-32 bg-white/95 rounded-xl p-2 shadow-md transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={logoWRD}
                  alt="WRD Bihar"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-[10px] px-2 py-0.5 rounded-full">
                WRD
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* ===== BOTTOM ACCENT BAR ===== */}
      <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400" />
    </nav>
  );
}
