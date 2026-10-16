"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useSessionGuard } from "./session-provider";

export function PrivateContent({
  ownerId,
  children,
}: {
  ownerId: string;
  children: ReactNode;
}) {
  const session = useSessionGuard();
  const router = useRouter();
  const sameUser = session.isSignedIn && session.userId === ownerId;
  useEffect(() => {
    if (session.isLoaded && session.isSignedIn && !sameUser) router.refresh();
  }, [session.isLoaded, session.isSignedIn, sameUser, router]);
  if (!session.isLoaded || (session.isSignedIn && !sameUser))
    return (
      <main className="account-empty" aria-busy="true">
        <p>Loading your secure dashboard…</p>
      </main>
    );
  if (!sameUser)
    return (
      <main className="account-empty">
        <ShieldCheck size={28} />
        <h1>Your journeys are private.</h1>
        <p>Your session has ended. Sign in again to continue.</p>
        <button className="button primary" onClick={session.signIn}>
          Sign in securely
        </button>
      </main>
    );
  return children;
}
