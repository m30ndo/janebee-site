import type { Metadata } from "next";
import { PageBackground } from "@/components/PageBackground";
import { EnquiryForm } from "@/components/EnquiryForm";

export const metadata: Metadata = { title: "Contact", description: "Commissions, questions and collaborations." };

export default function ContactPage() {
  return (
    <section className="px-6 py-16 md:px-12 md:py-28">
      <PageBackground page="contact" />
      <div className="grid gap-14 md:grid-cols-[1fr_1fr]">
        <div>
          <h1 className="font-h1 text-6xl leading-[0.95] font-light md:text-8xl">
            Say <span className="text-honey italic">hello.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-white/80">
            Commissions, a question about a piece, or something a little bit naughty in mind. Jane reads every message.
          </p>
          <div className="mt-10 space-y-2 text-sm">
            <p className="text-[11px] tracking-[0.22em] text-honey uppercase">Elsewhere</p>
            <a href="https://www.instagram.com/janeybee.art/" target="_blank" rel="noopener" className="link-draw text-lg">@janeybee.art ↗</a>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10">
          <EnquiryForm kind="general" />
        </div>
      </div>
    </section>
  );
}
