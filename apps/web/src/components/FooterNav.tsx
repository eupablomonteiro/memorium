"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function FooterNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-evenly border-t border-gray-200 bg-white/80 backdrop-blur-sm h-16 px-4 md:hidden">
      <Link
        href="/"
        className={pathname === "/" ? "text-primary" : "text-gray-500"}
      >
        🏠
      </Link>
      <Link
        href="/upload"
        className={pathname === "/upload" ? "text-primary" : "text-gray-500"}
      >
        📤
      </Link>
      <Link
        href="/setup"
        className={pathname === "/setup" ? "text-primary" : "text-gray-500"}
      >
        ⚙️
      </Link>
    </div>
  );
}