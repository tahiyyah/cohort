import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/profiles";
import ProfileCard from "./profile-card";

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const profile = await getProfile(user.id);

  // The signup trigger creates this row, so a missing one means something
  // went wrong rather than that the person is new.
  if (!profile) {
    notFound();
  }

  return <ProfileCard initialProfile={profile} />;
}
