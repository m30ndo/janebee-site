import Link from "next/link";
import { HiveForm } from "@/components/HiveForm";

/** Placeholder home — final layout to follow Jez's design. */
export default function Home() {
  return (
    <div className="px-6 md:px-12">
      <section className="py-16 md:py-28">
        <p className="inline-block -rotate-3 font-punk text-5xl text-pink md:text-7xl">Come closer</p>
        <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[1.05] font-light md:text-7xl">
          Every piece holds a memory.
        </h1>
        <p className="mt-6 max-w-xl text-lg opacity-80">
          Walk the rooms, lean in to the work, and find the story Bee-hind.
        </p>
        <Link
          href="/gallery"
          className="mt-10 inline-block rounded-full bg-espresso px-8 py-4 font-medium text-cream hover:bg-honey hover:text-espresso"
        >
          Enter the gallery →
        </Link>
      </section>

      <section className="my-10 rounded-2xl bg-espresso px-8 py-14 text-cream md:px-14">
        <h2 className="font-serif text-4xl font-light md:text-5xl">
          Join <span className="text-honey">the Hive</span>
        </h2>
        <p className="mt-3 mb-8 max-w-md opacity-80">First look at new work, before it hits Instagram.</p>
        <HiveForm source="home" />
      </section>
    </div>
  );
}
