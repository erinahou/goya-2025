import { redirect } from "next/navigation";

export default function InfoPage() {
  redirect("/exhibitions?info=open");
}
