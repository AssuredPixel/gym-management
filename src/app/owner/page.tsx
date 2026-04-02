import { redirect } from "next/navigation";

export default function OwnerShortcutPage() {
  // If the user isn't logged in, the middleware will catch them and send them to /login/owner.
  // If they are logged in, we send them to their dashboard.
  redirect("/dashboard");
}
