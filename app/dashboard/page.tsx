import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardHome from "./DashboardHome";

// Force Node.js runtime for this route (MongoDB compatibility)
export const runtime = "nodejs";

export const metadata = {
  title: "Dashboard | Planora",
  description: "Your travel planning dashboard",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }

  return (
    <DashboardLayout
      userName={session.user.name || "Traveler"}
      userEmail={session.user.email || ""}
      userImage={session.user.image || undefined}
    >
      <DashboardHome
        userId={session.user.id}
        userName={session.user.name || "Traveler"}
      />
    </DashboardLayout>
  );
}
