import { loadDashboard } from "@/lib/tickets";
import { privateJson, accessFailure } from "@/lib/auth";
export async function GET() {
  try {
    return privateJson(await loadDashboard());
  } catch (error) {
    return accessFailure(error);
  }
}
