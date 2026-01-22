import Image from "next/image";
import wordBank from "../../../public/world-bank-logo_0.jpg";
import logoWRD from "../../../public/logoWRD.png";


export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-blue-300">
      
      {/* Top thin blue strip */}
      <div className="h-2" />

      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between">

          {/* LEFT LOGO */}
          <div className="flex items-center">
            <Image
              src={logoWRD}
              alt="Government of Bihar"
              width={70}
              height={70}
              priority
            />
          </div>

          {/* CENTER TITLE */}
          <div className="text-center leading-tight">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black">
              Bihar Water Security & Irrigation Modernization Project
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold text-black">
             (BWSIMP)
            </h2>
          </div>

          {/* RIGHT LOGO */}
          <div >
            <Image
              src={wordBank}
              alt="world bank"
              width={130}
              height={100}
              priority
            />
          </div>

        </div>
      </div>
    </header>
  );
}
