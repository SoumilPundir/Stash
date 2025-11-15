export const dynamic = "force-dynamic";
import { seedTransactions } from "@/actions/seed";

export async function GET() {
  const result = await seedTransactions();
  return Response.json(result);
}

