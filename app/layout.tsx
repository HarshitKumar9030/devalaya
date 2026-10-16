import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";
import "react-day-picker/style.css";
import "./controls.css";
import "./dashboard.css";
import { isAuthConfigured } from "@/lib/auth-config";
import { SessionProvider } from "@/components/auth/session-provider";

const displayFont = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});
const bodyFont = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Devalaya — A journey closer to the divine",
  description:
    "Discover sacred places, plan your darshan, and support a temple and its local community. A little closer to what matters.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const configured = isAuthConfigured();
  const content = (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <body>
        <SessionProvider configured={configured}>{children}</SessionProvider>
      </body>
    </html>
  );
  return configured ? (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      appearance={{
        variables: {
          colorPrimary: "#4589df",
          fontFamily: "var(--font-body), sans-serif",
          borderRadius: "18px",
        },
        elements: {
          cardBox: { boxShadow: "none", border: "none" },
          card: { boxShadow: "none", border: "none" },
          formFieldInput: {
            boxShadow: "none",
            border: "none",
            background: "#edf5fd",
          },
          socialButtonsBlockButton: {
            boxShadow: "none",
            border: "none",
            background: "#edf5fd",
          },
        },
      }}
    >
      {content}
    </ClerkProvider>
  ) : (
    content
  );
}
