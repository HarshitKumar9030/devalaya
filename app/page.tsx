import { Devalaya } from "@/components/devalaya";
export default function Home() {
  return (
    <Devalaya
      authConfigured={Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)}
    />
  );
}
