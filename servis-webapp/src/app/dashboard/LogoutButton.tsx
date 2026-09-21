"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function odjava() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={odjava}
      className="text-sm text-gray-500 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5"
    >
      Odjavi se
    </button>
  );
}
