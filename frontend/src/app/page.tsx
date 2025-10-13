import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to portfolio overview (main dashboard)
  redirect("/portfolio");
}
