import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import SettingsClient from "./SettingsClient";

export const runtime = "nodejs";

export const metadata = {
  title: "Settings | Planora",
  description: "Manage your account settings",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <DashboardLayout
      userName={session.user.name || "Traveler"}
      userEmail={session.user.email || ""}
      userImage={session.user.image || undefined}
    >
      <SettingsClient
        userName={session.user.name || ""}
        userEmail={session.user.email || ""}
        userImage={session.user.image || ""}
      />
    </DashboardLayout>
  );
}
