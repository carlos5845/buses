"use client";

import { ExternalLink } from "@/components/animate-ui/icons/external-link";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import Link from "next/link";
import { ThemeTogglerDemo } from "@/components/theme-toggler";
export default function Header() {
  return (
    <header className="  z-40 backdrop-blur w-full fixed top-0 left-0">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <a href="" className="flex items-center gap-2">
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
          <nav className="hidden md:flex items-center gap-8 text-sm"></nav>
          <div className="flex items-center gap-3">
            <ThemeTogglerDemo direction="ltr" />
            <Link
              href="Auth/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-white text-gray-900 px-3 py-2 text-sm font-medium hover:bg-gray-100 transition font-sans dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              <AnimateIcon animateOnHover>
                <ExternalLink width={20} />
              </AnimateIcon>
              Acceso como chofer
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
