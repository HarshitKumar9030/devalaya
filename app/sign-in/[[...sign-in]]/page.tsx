import { AuthPage } from "@/components/auth/auth-page";
import { authPageReturnTo } from "@/lib/auth-page";
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <AuthPage kind="sign-in" returnTo={await authPageReturnTo(searchParams)} />
  );
}
