import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/supabase/server";

export default async function Home() {
  const auth = await requireAuth();
  redirect(auth ? "/dashboard" : "/login");
}
