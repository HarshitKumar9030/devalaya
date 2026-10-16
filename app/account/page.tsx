import { redirect } from "next/navigation";
import { requirePageUser } from "@/lib/auth";
export default async function AccountPage() {
  await requirePageUser("/account");
  redirect("/account/bookings");
}
