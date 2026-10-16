import { AuthPage } from "@/components/auth/auth-page";
import { authPageReturnTo } from "@/lib/auth-page";
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <AuthPage kind="sign-up" returnTo={await authPageReturnTo(searchParams)} />
  );
}
