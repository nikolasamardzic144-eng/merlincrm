"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

function IconKlijenti() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.5v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1.5M8.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.5 19.5v-1.5a3.5 3.5 0 0 0-2.5-3.35M15 10a3 3 0 1 0 0-6" />
    </svg>
  );
}

function IconPodesavanja() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.3 3.75c.2-.9 1.2-.9 1.4 0l.2.9c.1.5.5.9 1 1.1.5.2 1.1.1 1.5-.2l.7-.6c.7-.6 1.6.1 1.3.9l-.3.9c-.2.5-.1 1.1.2 1.5.3.4.8.7 1.4.7h.9c.9 0 1.2 1.1.4 1.6l-.7.5c-.4.3-.7.8-.7 1.3s.2 1 .7 1.3l.7.5c.7.5.5 1.6-.4 1.6h-.9c-.6 0-1.1.3-1.4.7-.3.4-.4 1-.2 1.5l.3.9c.3.8-.6 1.5-1.3.9l-.7-.6c-.4-.3-1-.4-1.5-.2-.5.2-.9.6-1 1.1l-.2.9c-.2.9-1.2.9-1.4 0l-.2-.9c-.1-.5-.5-.9-1-1.1-.5-.2-1.1-.1-1.5.2l-.7.6c-.7.6-1.6-.1-1.3-.9l.3-.9c.2-.5.1-1.1-.2-1.5-.3-.4-.8-.7-1.4-.7h-.9c-.9 0-1.2-1.1-.4-1.6l.7-.5c.4-.3.7-.8.7-1.3s-.2-1-.7-1.3l-.7-.5c-.7-.5-.5-1.6.4-1.6h.9c.6 0 1.1-.3 1.4-.7.3-.4.4-1 .2-1.5l-.3-.9c-.3-.8.6-1.5 1.3-.9l.7.6c.4.3 1 .4 1.5.2.5-.2.9-.6 1-1.1l.2-.9Z" />
      <circle cx="12" cy="12" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFakture() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3.75h10a1 1 0 0 1 1 1v15.5l-2.5-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2.5 1.5V4.75a1 1 0 0 1 1-1Z" />
      <path strokeLinecap="round" d="M9 8.25h6M9 11.25h6M9 14.25h3.5" />
    </svg>
  );
}

function IconIzvestaji() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5h16M7.5 19.5v-6M12 19.5v-10M16.5 19.5V7" />
    </svg>
  );
}

function IconPredlosci() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 5.75h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3v-3H4.5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function IconTim() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="w-5 h-5">
      <circle cx="9" cy="8" r="2.75" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 19v-1.5a4 4 0 0 1 4-4h2.5a4 4 0 0 1 4 4V19M16 8.25a2.25 2.25 0 1 0 0-4.5M14.5 19v-1.5a4 4 0 0 0-1.7-3.27M18.5 19v-1.5a3.75 3.75 0 0 0-2.5-3.54" />
    </svg>
  );
}

const AKTIVNO = [
  { href: "/dashboard", label: "Klijenti", icon: IconKlijenti },
  { href: "/dashboard/podesavanja", label: "Podešavanja", icon: IconPodesavanja },
];

const USKORO = [
  { label: "Fakture i naplata", icon: IconFakture },
  { label: "Izveštaji", icon: IconIzvestaji },
  { label: "Predlošci poruka", icon: IconPredlosci },
  { label: "Tim", icon: IconTim },
];

function NavContent({ naziv, email }: { naziv: string; email: string }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-5">
        <p className="text-white font-semibold text-lg tracking-tight">Servis CRM</p>
        <p className="text-gray-400 text-xs mt-0.5">{naziv}</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {AKTIVNO.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-100"
              }`}
            >
              <Icon />
              {label}
            </Link>
          );
        })}

        <p className="px-3 pt-6 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
          Uskoro
        </p>
        {USKORO.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 cursor-not-allowed"
            title="Uskoro dostupno"
          >
            <Icon />
            <span className="flex-1">{label}</span>
            <span className="text-[10px] bg-gray-800 text-gray-400 rounded-full px-1.5 py-0.5">
              uskoro
            </span>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-5 pt-3 border-t border-gray-800">
        <p className="px-3 pb-2 text-xs text-gray-500 truncate">{email}</p>
        <LogoutButton />
      </div>
    </div>
  );
}

export default function Sidebar({ naziv, email }: { naziv: string; email: string }) {
  const [otvoreno, setOtvoreno] = useState(false);

  return (
    <>
      {/* Mobilna traka */}
      <div className="md:hidden flex items-center justify-between bg-gray-900 text-white px-4 py-3">
        <span className="font-semibold">Servis CRM</span>
        <button
          onClick={() => setOtvoreno(true)}
          className="p-1.5 rounded-md hover:bg-gray-800"
          aria-label="Otvori meni"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-gray-900 shrink-0">
        <NavContent naziv={naziv} email={email} />
      </aside>

      {/* Mobilni overlay meni */}
      {otvoreno && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-72 bg-gray-900 flex flex-col">
            <div className="flex justify-end px-3 pt-3">
              <button
                onClick={() => setOtvoreno(false)}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-800"
                aria-label="Zatvori meni"
              >
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 -mt-3" onClick={() => setOtvoreno(false)}>
              <NavContent naziv={naziv} email={email} />
            </div>
          </div>
          <div
            className="flex-1 bg-black/40"
            onClick={() => setOtvoreno(false)}
          />
        </div>
      )}
    </>
  );
}
