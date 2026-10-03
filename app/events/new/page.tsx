import { requireUser } from "@/lib/auth";
import CreateEventForm from "./create-event-form";

export default async function CreateEventPage() {
  await requireUser("/events/new");
  return <CreateEventForm />;
}
