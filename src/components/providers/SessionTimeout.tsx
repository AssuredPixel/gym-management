"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

export default function SessionTimeout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(() => {
    console.log("Inactivity timeout reached. Logging out...");
    signOut({ callbackUrl: "/login/owner" });
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (session) {
      timerRef.current = setTimeout(handleLogout, TIMEOUT_MS);
    }
  }, [session, handleLogout]);

  useEffect(() => {
    // Events to monitor for activity
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];

    // Reset timer on any event
    const resetOnActivity = () => resetTimer();

    if (session) {
      // Initialize timer
      resetTimer();

      // Add event listeners
      events.forEach((event) => {
        window.addEventListener(event, resetOnActivity);
      });
    }

    return () => {
      // Cleanup
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetOnActivity);
      });
    };
  }, [session, resetTimer, pathname]);

  return <>{children}</>;
}
