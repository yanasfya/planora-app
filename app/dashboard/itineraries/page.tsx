import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import DashboardClient from "../DashboardClient";

export const runtime = "nodejs";

export const metadata = {
  title: "My Itineraries | Planora",
  description: "Manage your travel itineraries",
};

export default async function ItinerariesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/itineraries");
  }

  return (
    <DashboardLayout
      userName={session.user.name || "Traveler"}
      userEmail={session.user.email || ""}
      userImage={session.user.image || undefined}
    >
      <DashboardClient
        userId={session.user.id}
        userName={session.user.name || "Traveler"}
      />
    </DashboardLayout>
  );
}
