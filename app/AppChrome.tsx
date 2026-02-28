"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const HIDDEN_PATHS = ["/login", "/register"];

export default function AppChrome() {
  const pathname = usePathname();
  const router = useRouter();

  if (HIDDEN_PATHS.some((path) => pathname.startsWith(path))) {
    return null;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="chrome-wrap">
      <div className="chrome-brand">
        <Image
          src="/logo.png"
          alt="Logo"
          width={34}
          height={34}
          className="chrome-logo"
          priority
        />
        <span className="chrome-title">Attendance System</span>
      </div>
      <button type="button" className="button button-secondary chrome-logout" onClick={handleLogout}>
        Sign out
      </button>
    </div>
  );
}
