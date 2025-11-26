import { ExternalLink } from "@/components/animate-ui/icons/external-link";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import Link from "next/link";
export default function Header() {
  return (
    <header className=" z-40 backdrop-blur supports-[backdrop-filter]:bg-gray-900/70 bg-gray-900/60 border-t border-gray-800 max-w-7xl ml-auto mr-auto rounded-full w-full">
      <div className="max-w-7xl mr-auto ml-auto pr-6 pl-6">
        <div className="h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-0">
            <svg
              className="md:w-14 md:h-14 w-[36px] h-[36px]"
              viewBox="0 0 48 48"
              aria-hidden="true"
              strokeWidth="2"
              style={{ width: "36px", height: "36px" }}
            >
              <circle
                cx="24"
                cy="24"
                r="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              ></circle>
              <circle cx="32" cy="18" r="3" fill="currentColor"></circle>
            </svg>
            <span className="text-lg font-semibold tracking-tight">
              Bus Traker
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a
              href="#docs"
              className="text-gray-400 hover:text-gray-200 font-sans"
            >
              Docs
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {/* 

    href="#"
    className="hidden sm:inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/50 px-4 py-2.5 text-sm font-medium hover:bg-gray-800 transition font-sans"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-log-in w-4 h-4"
    >
      <path d="m10 17 5-5-5-5"></path>
      <path d="M15 12H3"></path>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
    </svg>
    Acceso como chofer
  </a>
*/}

            <Link
              href="Auth/login"
              className="inline-flex items-center gap-2 rounded-full bg-white text-gray-900 px-4 py-2.5 text-sm font-medium hover:bg-gray-100 transition font-sans"
            >
              <AnimateIcon animateOnHover>
                <ExternalLink width={20} />
              </AnimateIcon>
              Acceso como chofer
            </Link>
            <button className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-gray-800 bg-gray-900/50 hover:bg-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-menu w-5 h-5"
              >
                <path d="M4 12h16"></path>
                <path d="M4 18h16"></path>
                <path d="M4 6h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
