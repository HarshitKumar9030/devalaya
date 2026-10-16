"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { X } from "lucide-react";

type SessionContextValue = {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  protect: (action: () => void) => void;
  signIn: () => void;
};
const SessionContext = createContext<SessionContextValue | null>(null);
export function SessionProvider({
  configured,
  children,
}: {
  configured: boolean;
  children: ReactNode;
}) {
  return configured ? (
    <ClerkSessionProvider>{children}</ClerkSessionProvider>
  ) : (
    <UnavailableSession>{children}</UnavailableSession>
  );
}
function UnavailableSession({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const unavailable = () =>
    setMessage(
      "Secure sign-in is temporarily unavailable. Please try again later.",
    );
  return (
    <SessionContext.Provider
      value={{
        isLoaded: true,
        isSignedIn: false,
        userId: null,
        protect: unavailable,
        signIn: unavailable,
      }}
    >
      {children}
      {message && (
        <div className="auth-notice" role="status">
          {message}
          <button aria-label="Dismiss notice" onClick={() => setMessage("")}>
            <X size={17} />
          </button>
        </div>
      )}
    </SessionContext.Provider>
  );
}
function ClerkSessionProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId, sessionId } = useAuth({
    treatPendingAsSignedOut: true,
  });
  const { openSignIn } = useClerk();
  const pending = useRef<(() => void) | null>(null);
  const authenticated = Boolean(isSignedIn && userId && sessionId);
  const signIn = useCallback(() => {
    openSignIn({ fallbackRedirectUrl: "/" });
  }, [openSignIn]);
  const protect = useCallback(
    (action: () => void) => {
      if (!isLoaded) return;
      if (authenticated) {
        action();
        return;
      }
      pending.current = action;
      signIn();
    },
    [isLoaded, authenticated, signIn],
  );
  useEffect(() => {
    if (authenticated && pending.current) {
      const action = pending.current;
      pending.current = null;
      action();
    }
  }, [authenticated]);
  return (
    <SessionContext.Provider
      value={{
        isLoaded: Boolean(isLoaded),
        isSignedIn: authenticated,
        userId: userId ?? null,
        protect,
        signIn,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
export function useSessionGuard() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("SessionProvider is required.");
  return context;
}
