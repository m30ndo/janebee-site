import Link from "next/link";
import { PageBackground } from "@/components/PageBackground";
import type { Metadata } from "next";
import { HiveForm } from "@/components/HiveForm";

export const metadata: Metadata = { title: "Join the Hive" };

export default function HivePage() {
  return (
    <section className="px-6 py-16 md:px-12 md:py-28">
      <PageBackground page="the-hive" />
      <h1 className="font-serif text-5xl font-light md:text-7xl">
        Join <span className="text-honey">the Hive</span>
      </h1>
      <ul className="mt-6 mb-10 max-w-md space-y-2 opacity-80">
        <li>First look at new paintings and prints, before anyone else</li>
        <li>The stories Bee-hind the work</li>
        <li>Invitations to launches and private views</li>
      </ul>
      <HiveForm source="hive-page" />
      <p className="mt-8 text-sm opacity-70">
        Want first look at new work and invitations? <Link href="/signin" className="underline underline-offset-4">Join the members app</Link>.
      </p>
    </section>
  );
}
