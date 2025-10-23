import { FaWifi, FaBolt, FaShoppingBag } from "react-icons/fa";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-blue-600 to-blue-800 text-white py-20 px-6 md:px-12 lg:px-24 overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('/pattern.svg')] bg-cover bg-center" />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="max-w-xl text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Stay <span className="text-blue-200">Connected</span> <br /> with
            Fast & Affordable Data Bundles
          </h1>
          <p className="text-blue-100 text-lg mb-6">
            Buy data instantly across all networks — fast, secure, and reliable.
            Enjoy seamless internet access wherever you are.
          </p>
        </div>
      </div>

      <svg
        className="absolute bottom-[-20] left-0 w-full text-white"
        viewBox="0 0 1440 320"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          fillOpacity="1"
          d="M0,224L30,213.3C60,203,120,181,180,192C240,203,300,245,360,240C420,235,480,181,540,181.3C600,181,660,235,720,229.3C780,224,840,160,900,133.3C960,107,1020,117,1080,138.7C1140,160,1200,192,1260,197.3C1320,203,1380,181,1410,170.7L1440,160L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"
        ></path>
      </svg>
    </section>
  );
}