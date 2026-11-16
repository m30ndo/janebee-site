import type { Metadata } from "next";
import { ThankYouView } from "@/components/views/ThankYouView";

export const metadata: Metadata = { title: "Thank you" };

export default function ThankYou() {
  return <div className="px-6 md:px-12"><ThankYouView /></div>;
}
