import Link from "next/link";
import { SignIn, SignUp } from "@clerk/nextjs";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { isAuthConfigured } from "@/lib/auth-config";

export function AuthPage({
  kind,
  returnTo = "/account/bookings",
}: {
  kind: "sign-in" | "sign-up";
  returnTo?: string;
}) {
  const configured = isAuthConfigured();
  return (
    <main className="auth-page">
      <Link href="/" className="brand">
        Devalaya.
      </Link>
      <div className="auth-page-heading">
        <h1>A little closer.</h1>
        <p>
          {kind === "sign-in"
            ? "Sign in to plan your visit and give with an open heart."
            : "Create a little space for meaningful journeys."}
        </p>
      </div>
      {configured ? (
        kind === "sign-in" ? (
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl={returnTo}
          />
        ) : (
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl={returnTo}
          />
        )
      ) : (
        <div role="status" className="account-empty">
          <ShieldCheck size={27} />
          <p>
            Secure sign-in is temporarily unavailable. Please try again later.
          </p>
        </div>
      )}
      <Link href="/" className="text-link">
        <ArrowLeft size={14} />
        Back to discovery
      </Link>
    </main>
  );
}
